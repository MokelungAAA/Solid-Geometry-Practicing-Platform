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
    // 创建展开图组（使用unfoldConfig枢轴树）
    // ========================
    createUnfoldGroup(config, currentVertices) {
        this.clear();

        const unfoldConfig = config.unfoldConfig;
        if (!unfoldConfig || !unfoldConfig.pivots) {
            this.unfoldGroup = null;
            return;
        }

        this.unfoldGroup = new THREE.Group();
        this.unfoldGroup.name = 'unfold';
        this.unfoldPivotGroups = {};

        const faceColors = [0x89cff0, 0xb19cd9, 0xf0e68a, 0x8ae6a0, 0xe68a8a, 0x87ceeb, 0xdda0dd];

        // 创建基准面（不动）
        const baseFaceName = unfoldConfig.baseFace;
        if (baseFaceName && config.faces[baseFaceName]) {
            const baseFace = config.faces[baseFaceName];
            const pts = baseFace.vertices.map(v => currentVertices[v].clone());
            const geo = this._createFaceGeometry(pts);
            const baseMesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
                color: faceColors[0],
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            }));
            baseMesh.visible = false;
            baseMesh.add(new THREE.LineSegments(
                new THREE.EdgesGeometry(geo),
                new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })
            ));
            baseMesh.userData = { faceName: baseFaceName, isBase: true };
            this.unfoldGroup.add(baseMesh);
        }

        // 为每个枢轴面创建旋转组
        let fi = 1;
        for (const [faceName, pivot] of Object.entries(unfoldConfig.pivots)) {
            if (!config.faces[faceName]) continue;

            const face = config.faces[faceName];
            const vA = currentVertices[pivot.hinge[0]];
            const vB = currentVertices[pivot.hinge[1]];
            if (!vA || !vB) continue;

            // 铰链中点和方向
            const midpoint = vA.clone().add(vB).multiplyScalar(0.5);
            const axisDir = vB.clone().sub(vA).normalize();

            // 创建旋转组（定位在铰链中点）
            const pivotGroup = new THREE.Group();
            pivotGroup.position.copy(midpoint);

            // 建立父子关系
            if (pivot.parent && this.unfoldPivotGroups[pivot.parent]) {
                this.unfoldPivotGroups[pivot.parent].add(pivotGroup);
            } else {
                this.unfoldGroup.add(pivotGroup);
            }

            this.unfoldPivotGroups[faceName] = pivotGroup;

            // 创建面几何体（顶点相对于铰链中点）
            const pts = face.vertices.map(v => currentVertices[v].clone());
            const relPts = pts.map(p => p.clone().sub(midpoint));
            const geo = this._createFaceGeometry(relPts);

            const color = faceColors[fi++ % faceColors.length];
            const mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
                color,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            }));
            mesh.visible = false;
            mesh.add(new THREE.LineSegments(
                new THREE.EdgesGeometry(geo),
                new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })
            ));
            pivotGroup.add(mesh);

            // 存储旋转数据
            pivotGroup.userData = {
                faceName,
                axisDir: axisDir,
                totalAngle: pivot.angle
            };
        }

        this.scene.add(this.unfoldGroup);
    }

    /**
     * 创建面几何体
     */
    _createFaceGeometry(points) {
        const geo = new THREE.BufferGeometry();
        const verts = [];
        points.forEach(p => verts.push(p.x, p.y, p.z));
        geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        const idx = [];
        for (let i = 1; i < points.length - 1; i++) idx.push(0, i, i + 1);
        geo.setIndex(idx);
        geo.computeVertexNormals();
        return geo;
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
    // 更新展开显示（使用枢轴旋转）
    // ========================
    updateDisplay(progress) {
        const t = progress; // progress 已经是 0..1

        if (!this.unfoldGroup) return;

        // 更新每个枢轴组的旋转
        for (const [faceName, pivotGroup] of Object.entries(this.unfoldPivotGroups)) {
            const ud = pivotGroup.userData;
            if (!ud || !ud.axisDir) continue;

            // 应用缓动
            const easedT = t < 0.5
                ? 2 * t * t
                : 1 - Math.pow(-2 * t + 2, 2) / 2;

            const angle = ud.totalAngle * easedT;
            const quat = new THREE.Quaternion();
            quat.setFromAxisAngle(ud.axisDir, angle);
            pivotGroup.quaternion.copy(quat);
        }
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
