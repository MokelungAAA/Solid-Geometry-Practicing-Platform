// ========================
// 展开/折叠管理器
// ========================
import * as THREE from 'three';
import gsap from 'gsap';

export class UnfoldManager {
    constructor(scene, geometryFactory) {
        this.scene = scene;
        this.geometryFactory = geometryFactory;
        this.unfoldGroup = null;
        this.unfoldState = { progress: 0, isAnimating: false };
        this.unfoldPivotGroups = {};
        this.onProgressUpdate = null;
        this.onStateChange = null;
    }

    // ========================
    // 创建展开图组
    // ========================
    createUnfoldGroup(config, currentVertices) {
        this.clear();

        const unfoldConfig = config.unfoldConfig;
        if (!unfoldConfig) {
            this.unfoldGroup = null;
            return;
        }

        this.unfoldGroup = new THREE.Group();
        this.unfoldGroup.name = 'unfold';
        this.unfoldPivotGroups = {};

        const faceColors = [0x89cff0, 0xb19cd9, 0xf0e68a, 0x8ae6a0, 0xe68a8a, 0x87ceeb, 0xdda0dd];

        // 计算几何体中心
        const center = new THREE.Vector3(0, 0, 0);
        const allVerts = Object.values(currentVertices);
        allVerts.forEach(v => center.add(v));
        if (allVerts.length) center.divideScalar(allVerts.length);

        let fi = 0;
        Object.keys(config.faces).forEach(faceName => {
            const face = config.faces[faceName];
            const pts = face.vertices.map(v => currentVertices[v].clone());

            // 创建几何体
            const geo = new THREE.BufferGeometry();
            const verts = [];
            pts.forEach(p => verts.push(p.x, p.y, p.z));
            geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
            const idx = [];
            for (let i = 1; i < pts.length - 1; i++) idx.push(0, i, i + 1);
            geo.setIndex(idx);
            geo.computeVertexNormals();

            const color = faceColors[fi++ % faceColors.length];
            const mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
                color,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            }));
            mesh.visible = false;

            // 添加边线
            mesh.add(new THREE.LineSegments(
                new THREE.EdgesGeometry(geo),
                new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })
            ));

            // 计算面的中心
            const fc = new THREE.Vector3(0, 0, 0);
            pts.forEach(p => fc.add(p));
            fc.divideScalar(pts.length);

            // 计算平移方向
            const dir = fc.clone().sub(center);
            if (dir.length() > 0.001) dir.normalize();
            else dir.set(1, 0, 0);
            dir.y -= 0.4;
            dir.normalize();

            mesh.userData = {
                faceName,
                faceCenter: fc,
                spreadDir: dir,
                origPos: new THREE.Vector3()
            };

            this.unfoldGroup.add(mesh);
        });

        this.scene.add(this.unfoldGroup);
    }

    // ========================
    // 展开/折叠动画
    // ========================
    animate(targetProgress, duration = 1.5) {
        if (!this.unfoldGroup || this.unfoldGroup.children.length < 2) {
            console.warn('该几何体暂不支持展开');
            return;
        }

        if (this.unfoldState.isAnimating) {
            gsap.killTweensOf(this.unfoldState);
        }

        this.unfoldState.isAnimating = true;

        if (this.onStateChange) {
            this.onStateChange('animating', targetProgress > 0 ? '展开中...' : '折叠中...');
        }

        // 切换可见性
        if (targetProgress > 0) {
            if (this.geometryFactory.geometryGroup) {
                this.geometryFactory.geometryGroup.visible = false;
            }
            this.unfoldGroup.children.forEach(c => {
                if (c.isMesh) c.visible = true;
            });
        }

        gsap.to(this.unfoldState, {
            progress: targetProgress,
            duration,
            ease: "power2.inOut",
            onUpdate: () => {
                this.updateDisplay(this.unfoldState.progress);
                if (this.onProgressUpdate) {
                    this.onProgressUpdate(this.unfoldState.progress);
                }
            },
            onComplete: () => {
                this.unfoldState.isAnimating = false;

                if (targetProgress === 0) {
                    if (this.geometryFactory.geometryGroup) {
                        this.geometryFactory.geometryGroup.visible = true;
                    }
                    this.unfoldGroup.children.forEach(c => {
                        if (c.isMesh) c.visible = false;
                    });
                }

                if (this.onStateChange) {
                    this.onStateChange('complete', targetProgress > 0 ? '已展开' : '已折叠');
                }
            }
        });
    }

    // ========================
    // 更新展开显示
    // ========================
    updateDisplay(progress) {
        const t = progress / 100;

        if (!this.unfoldGroup) return;

        const meshes = this.unfoldGroup.children.filter(c => c.isMesh);
        if (meshes.length < 2) return;

        // 基准面不动
        meshes.forEach((mesh, i) => {
            const ud = mesh.userData;
            if (!ud.spreadDir || i === 0) {
                mesh.position.set(0, 0, 0);
                return;
            }

            // 为每个面分配固定随机距离
            if (ud.randDist === undefined) {
                ud.randDist = 1.0 + Math.random() * 1.0;
            }

            const start = (i - 1) / (meshes.length - 1);
            const end = i / (meshes.length - 1);
            const span = Math.max(0.01, end - start);
            const localT = Math.max(0, Math.min(1, (t - start) / span));
            const easedT = localT < 0.5
                ? 2 * localT * localT
                : 1 - Math.pow(-2 * localT + 2, 2) / 2;

            mesh.position.copy(ud.spreadDir.clone().multiplyScalar(easedT * ud.randDist));
        });
    }

    // ========================
    // 设置进度（滑块控制）
    // ========================
    setProgress(progress) {
        if (this.unfoldState.isAnimating) {
            gsap.killTweensOf(this.unfoldState);
        }

        this.unfoldState.progress = progress;
        this.unfoldState.isAnimating = false;

        // 切换可见性
        if (progress > 0) {
            if (this.geometryFactory.geometryGroup) {
                this.geometryFactory.geometryGroup.visible = false;
            }
            if (this.unfoldGroup) {
                this.unfoldGroup.children.forEach(c => {
                    if (c.isMesh) c.visible = true;
                });
            }
        } else {
            if (this.geometryFactory.geometryGroup) {
                this.geometryFactory.geometryGroup.visible = true;
            }
            if (this.unfoldGroup) {
                this.unfoldGroup.children.forEach(c => {
                    if (c.isMesh) c.visible = false;
                });
            }
        }

        this.updateDisplay(progress);

        if (this.onProgressUpdate) {
            this.onProgressUpdate(progress);
        }
    }

    // ========================
    // 获取当前进度
    // ========================
    getProgress() {
        return this.unfoldState.progress;
    }

    // ========================
    // 是否正在动画
    // ========================
    isAnimating() {
        return this.unfoldState.isAnimating;
    }

    // ========================
    // 清除展开组
    // ========================
    clear() {
        if (this.unfoldGroup) {
            this.scene.remove(this.unfoldGroup);
            this.unfoldGroup.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            this.unfoldGroup = null;
        }
        this.unfoldPivotGroups = {};
        this.unfoldState = { progress: 0, isAnimating: false };
    }

    // ========================
    // 显示/隐藏展开组
    // ========================
    setVisible(visible) {
        if (this.unfoldGroup) {
            this.unfoldGroup.visible = visible;
        }
    }

    // ========================
    // 设置面透明度
    // ========================
    setOpacity(opacity) {
        if (!this.unfoldGroup) return;
        this.unfoldGroup.children.forEach(child => {
            if (child.isMesh && child.material) {
                child.material.opacity = opacity;
            }
        });
    }
}
