// ========================
// 几何体工厂
// ========================
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export class GeometryFactory {
    constructor(scene, labelRenderer) {
        this.scene = scene;
        this.labelRenderer = labelRenderer;
        this.geometryGroup = null;
        this.vertexLabels = {};
        this.faceMeshes = [];
        this.solidEdgesGroup = null;
        this.hiddenEdgesGroup = null;
    }

    // ========================
    // 创建3D几何体
    // ========================
    createGeometry(config, options = {}) {
        const { showVertices = true, showEdges = true, showFaces = true, opacity = 0.6 } = options;

        // 清除旧几何体
        this.clear();

        this.geometryGroup = new THREE.Group();
        this.geometryGroup.name = 'geometry';

        const vertices = config.vertices;
        const faces = config.faces;

        // 创建材质
        const faceMaterial = new THREE.MeshPhongMaterial({
            color: 0x6c8ebf,
            transparent: true,
            opacity: opacity,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0xdfd0b7,
            linewidth: 2
        });

        // 创建面
        if (showFaces) {
            this.createFaces(vertices, faces, faceMaterial);
        }

        // 创建边
        if (showEdges) {
            this.createEdges(vertices, config.edges, edgeMaterial);
        }

        // 创建顶点
        if (showVertices) {
            this.createVertices(vertices);
        }

        this.scene.add(this.geometryGroup);
        return this.geometryGroup;
    }

    // ========================
    // 创建面
    // ========================
    createFaces(vertices, faces, material) {
        Object.entries(faces).forEach(([faceName, faceConfig]) => {
            const faceVertices = faceConfig.vertices.map(v => vertices[v]);
            const shape = new THREE.Shape();

            // 创建2D形状用于平面几何体
            const points3D = faceVertices.map(v => new THREE.Vector3(v[0], v[1], v[2]));

            // 使用三角化创建面
            if (faceVertices.length === 3) {
                // 三角形
                const geometry = new THREE.BufferGeometry();
                const positions = new Float32Array([
                    ...faceVertices[0],
                    ...faceVertices[1],
                    ...faceVertices[2]
                ]);
                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                geometry.setIndex([0, 1, 2]);
                geometry.computeVertexNormals();

                const mesh = new THREE.Mesh(geometry, material.clone());
                mesh.name = faceName;
                mesh.userData = { faceName, vertices: faceConfig.vertices };
                this.geometryGroup.add(mesh);
                this.faceMeshes.push(mesh);
            } else if (faceVertices.length === 4) {
                // 四边形 - 分成两个三角形
                const geometry = new THREE.BufferGeometry();
                const positions = new Float32Array([
                    ...faceVertices[0],
                    ...faceVertices[1],
                    ...faceVertices[2],
                    ...faceVertices[3]
                ]);
                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                geometry.setIndex([0, 1, 2, 0, 2, 3]);
                geometry.computeVertexNormals();

                const mesh = new THREE.Mesh(geometry, material.clone());
                mesh.name = faceName;
                mesh.userData = { faceName, vertices: faceConfig.vertices };
                this.geometryGroup.add(mesh);
                this.faceMeshes.push(mesh);
            } else {
                // 多边形 - 使用ShapeGeometry
                // 将3D点投影到2D平面
                const center = new THREE.Vector3();
                points3D.forEach(p => center.add(p));
                center.divideScalar(points3D.length);

                // 创建局部坐标系
                const normal = new THREE.Vector3();
                const v1 = new THREE.Vector3().subVectors(points3D[1], points3D[0]);
                const v2 = new THREE.Vector3().subVectors(points3D[2], points3D[0]);
                normal.crossVectors(v1, v2).normalize();

                const up = Math.abs(normal.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
                const right = new THREE.Vector3().crossVectors(up, normal).normalize();
                const newUp = new THREE.Vector3().crossVectors(normal, right).normalize();

                // 投影到2D
                const points2D = points3D.map(p => {
                    const diff = p.clone().sub(center);
                    return new THREE.Vector2(diff.dot(right), diff.dot(newUp));
                });

                const shape = new THREE.Shape();
                shape.moveTo(points2D[0].x, points2D[0].y);
                for (let i = 1; i < points2D.length; i++) {
                    shape.lineTo(points2D[i].x, points2D[i].y);
                }
                shape.closePath();

                const geometry = new THREE.ShapeGeometry(shape);

                // 将几何体变换到3D位置
                const matrix = new THREE.Matrix4();
                matrix.makeBasis(right, newUp, normal);
                matrix.setPosition(center);
                geometry.applyMatrix4(matrix);

                const mesh = new THREE.Mesh(geometry, material.clone());
                mesh.name = faceName;
                mesh.userData = { faceName, vertices: faceConfig.vertices };
                this.geometryGroup.add(mesh);
                this.faceMeshes.push(mesh);
            }
        });
    }

    // ========================
    // 创建边
    // ========================
    createEdges(vertices, edges, material) {
        this.solidEdgesGroup = new THREE.Group();
        this.solidEdgesGroup.name = 'solidEdges';

        edges.forEach(([start, end]) => {
            const points = [
                new THREE.Vector3(...vertices[start]),
                new THREE.Vector3(...vertices[end])
            ];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material.clone());
            line.userData = { start, end };
            this.solidEdgesGroup.add(line);
        });

        this.geometryGroup.add(this.solidEdgesGroup);
    }

    // ========================
    // 创建顶点
    // ========================
    createVertices(vertices) {
        const vertexGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const vertexMaterial = new THREE.MeshBasicMaterial({ color: 0xf0c674 });

        Object.entries(vertices).forEach(([name, position]) => {
            const mesh = new THREE.Mesh(vertexGeometry.clone(), vertexMaterial.clone());
            mesh.position.set(position[0], position[1], position[2]);
            mesh.name = `vertex_${name}`;
            mesh.userData = { vertexName: name };
            this.geometryGroup.add(mesh);

            // 创建标签
            const label = this.createVertexLabel(name, position);
            this.vertexLabels[name] = label;
        });
    }

    // ========================
    // 创建顶点标签
    // ========================
    createVertexLabel(name, position) {
        const div = document.createElement('div');
        div.className = 'vertex-label';
        div.textContent = name;
        div.style.color = '#f0c674';
        div.style.fontWeight = 'bold';
        div.style.fontSize = '14px';
        div.style.textShadow = '0 0 6px rgba(240, 198, 116, 0.6)';
        div.style.pointerEvents = 'none';

        const label = new CSS2DObject(div);
        label.position.set(position[0], position[1] + 0.15, position[2]);
        label.center.set(0.5, 0.5);
        this.geometryGroup.add(label);
        return label;
    }

    // ========================
    // 设置面透明度
    // ========================
    setOpacity(opacity) {
        this.faceMeshes.forEach(mesh => {
            mesh.material.opacity = opacity;
        });
    }

    // ========================
    // 设置面可见性
    // ========================
    setFacesVisible(visible) {
        this.faceMeshes.forEach(mesh => {
            mesh.visible = visible;
        });
    }

    // ========================
    // 设置边可见性
    // ========================
    setEdgesVisible(visible) {
        if (this.solidEdgesGroup) {
            this.solidEdgesGroup.visible = visible;
        }
    }

    // ========================
    // 设置顶点可见性
    // ========================
    setVerticesVisible(visible) {
        Object.values(this.vertexLabels).forEach(label => {
            label.visible = visible;
        });
        // 顶点球体
        this.geometryGroup.children.forEach(child => {
            if (child.name && child.name.startsWith('vertex_')) {
                child.visible = visible;
            }
        });
    }

    // ========================
    // 高亮面
    // ========================
    highlightFace(faceName, highlight = true) {
        const mesh = this.faceMeshes.find(m => m.userData.faceName === faceName);
        if (mesh) {
            if (highlight) {
                mesh.material.emissive = new THREE.Color(0x3a3a50);
                mesh.material.emissiveIntensity = 0.3;
            } else {
                mesh.material.emissive = new THREE.Color(0x000000);
                mesh.material.emissiveIntensity = 0;
            }
        }
    }

    // ========================
    // 获取面网格
    // ========================
    getFaceMesh(faceName) {
        return this.faceMeshes.find(m => m.userData.faceName === faceName);
    }

    // ========================
    // 清除几何体
    // ========================
    clear() {
        if (this.geometryGroup) {
            this.scene.remove(this.geometryGroup);
            this.geometryGroup.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            this.geometryGroup = null;
        }
        this.vertexLabels = {};
        this.faceMeshes = [];
        this.solidEdgesGroup = null;
        this.hiddenEdgesGroup = null;
    }

    // ========================
    // 获取几何体包围盒
    // ========================
    getBoundingBox() {
        if (!this.geometryGroup) return null;
        const box = new THREE.Box3().setFromObject(this.geometryGroup);
        return box;
    }

    // ========================
    // 获取几何体中心
    // ========================
    getCenter() {
        const box = this.getBoundingBox();
        if (!box) return new THREE.Vector3();
        return box.getCenter(new THREE.Vector3());
    }

    // ========================
    // 获取几何体大小
    // ========================
    getSize() {
        const box = this.getBoundingBox();
        if (!box) return new THREE.Vector3();
        return box.getSize(new THREE.Vector3());
    }
}
