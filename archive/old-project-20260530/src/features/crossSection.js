// ========================
// 截面管理器
// ========================
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export class CrossSectionManager {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        this.crossSectionMode = false;
        this.sectionPoints = [];
        this.sectionPointMarkers = [];
        this.sectionPointLabels = [];
        this.previewPoint = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.faceMeshes = [];
        this.currentVertices = {};
        this.selectedVertices = [];

        this.SNAP_THRESHOLD = 0.15;
        this.sectionMesh = null;
        this.sectionEdges = null;

        this.onModeChange = null;
        this.onPointsChange = null;
        this.onVertexSelect = null;
    }

    // ========================
    // 设置面网格（用于射线检测）
    // ========================
    setFaceMeshes(faceMeshes) {
        this.faceMeshes = faceMeshes;
    }

    // ========================
    // 设置当前顶点
    // ========================
    setCurrentVertices(vertices) {
        this.currentVertices = vertices;
    }

    // ========================
    // 切换截面选点模式
    // ========================
    toggleMode() {
        this.crossSectionMode = !this.crossSectionMode;

        if (this.crossSectionMode) {
            this.createPreviewPoint();
            if (this.onModeChange) {
                this.onModeChange(true);
            }
        } else {
            this.removePreviewPoint();
            if (this.onModeChange) {
                this.onModeChange(false);
            }
        }

        return this.crossSectionMode;
    }

    // ========================
    // 是否在选点模式
    // ========================
    isModeActive() {
        return this.crossSectionMode;
    }

    // ========================
    // 创建预览点
    // ========================
    createPreviewPoint() {
        if (this.previewPoint) this.removePreviewPoint();

        const geometry = new THREE.SphereGeometry(0.08, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xb19cd9,
            transparent: true,
            opacity: 0.6
        });
        this.previewPoint = new THREE.Mesh(geometry, material);
        this.previewPoint.visible = false;
        this.scene.add(this.previewPoint);
    }

    // ========================
    // 移除预览点
    // ========================
    removePreviewPoint() {
        if (this.previewPoint) {
            this.scene.remove(this.previewPoint);
            this.previewPoint.geometry.dispose();
            this.previewPoint.material.dispose();
            this.previewPoint = null;
        }
    }

    // ========================
    // 更新鼠标位置
    // ========================
    updateMousePosition(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    // ========================
    // 更新预览点位置
    // ========================
    updatePreviewPoint(event) {
        if (!this.crossSectionMode || !this.previewPoint) return;

        this.updateMousePosition(event);

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.faceMeshes);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            const snappedPoint = this.snapToVertex(point);
            this.previewPoint.position.copy(snappedPoint);
            this.previewPoint.visible = true;
            return { snapped: snappedPoint.isSnapped || false, vertexName: snappedPoint.vertexName };
        } else {
            this.previewPoint.visible = false;
            return null;
        }
    }

    // ========================
    // 处理点击（放置截面点）
    // ========================
    handleClick(event) {
        if (!this.crossSectionMode) return false;

        this.updateMousePosition(event);

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.faceMeshes);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            const snappedPoint = this.snapToVertex(point);
            this.addSectionPoint(snappedPoint);
            return true;
        }

        return false;
    }

    // ========================
    // 顶点吸附
    // ========================
    snapToVertex(point) {
        let closestVertex = null;
        let closestDistance = Infinity;
        let closestName = '';

        Object.keys(this.currentVertices).forEach(name => {
            const vertex = this.currentVertices[name];
            const distance = point.distanceTo(vertex);
            if (distance < this.SNAP_THRESHOLD && distance < closestDistance) {
                closestDistance = distance;
                closestVertex = vertex;
                closestName = name;
            }
        });

        if (closestVertex) {
            const result = closestVertex.clone();
            result.isSnapped = true;
            result.vertexName = closestName;
            return result;
        }

        return point;
    }

    // ========================
    // 添加截面点
    // ========================
    addSectionPoint(position) {
        const pointData = {
            position: position.clone(),
            isVertex: position.isSnapped || false,
            vertexName: position.vertexName || null
        };

        this.sectionPoints.push(pointData);

        // 创建3D标记
        const marker = this.createSectionPointMarker(pointData);
        this.sectionPointMarkers.push(marker);

        // 创建标签
        const label = this.createSectionPointLabel(this.sectionPoints.length - 1);
        this.sectionPointLabels.push(label);

        if (this.onPointsChange) {
            this.onPointsChange(this.sectionPoints);
        }

        return this.sectionPoints.length;
    }

    // ========================
    // 创建截面点标记
    // ========================
    createSectionPointMarker(pointData) {
        const geometry = new THREE.SphereGeometry(0.12, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xb19cd9,
            transparent: true,
            opacity: 0.9
        });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.copy(pointData.position);

        // 添加发光效果
        const glowGeometry = new THREE.SphereGeometry(0.18, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xd4b8e8,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        marker.add(glow);

        this.scene.add(marker);
        return marker;
    }

    // ========================
    // 创建截面点标签
    // ========================
    createSectionPointLabel(index) {
        const div = document.createElement('div');
        div.className = 'section-point-label';
        div.textContent = `P${index + 1}`;
        div.dataset.index = index;

        const label = new CSS2DObject(div);
        label.position.copy(this.sectionPoints[index].position);
        label.position.y += 0.25;
        this.scene.add(label);
        return label;
    }

    // ========================
    // 删除截面点
    // ========================
    removeSectionPoint(index) {
        if (index < 0 || index >= this.sectionPoints.length) return;

        // 移除3D标记
        if (this.sectionPointMarkers[index]) {
            this.scene.remove(this.sectionPointMarkers[index]);
            this.sectionPointMarkers[index].geometry.dispose();
            this.sectionPointMarkers[index].material.dispose();
            this.sectionPointMarkers.splice(index, 1);
        }

        // 移除标签
        if (this.sectionPointLabels[index]) {
            this.scene.remove(this.sectionPointLabels[index]);
            if (this.sectionPointLabels[index].element) {
                this.sectionPointLabels[index].element.remove();
            }
            this.sectionPointLabels.splice(index, 1);
        }

        // 移除数据
        this.sectionPoints.splice(index, 1);

        // 更新剩余点的标签索引
        this.sectionPointLabels.forEach((label, i) => {
            if (label.element) {
                label.element.textContent = `P${i + 1}`;
                label.element.dataset.index = i;
                label.position.copy(this.sectionPoints[i].position);
                label.position.y += 0.25;
            }
        });

        if (this.onPointsChange) {
            this.onPointsChange(this.sectionPoints);
        }
    }

    // ========================
    // 清空所有截面点
    // ========================
    clearSectionPoints() {
        // 移除所有标记
        this.sectionPointMarkers.forEach(marker => {
            this.scene.remove(marker);
            marker.geometry.dispose();
            marker.material.dispose();
        });
        this.sectionPointMarkers = [];

        // 移除所有标签
        this.sectionPointLabels.forEach(label => {
            this.scene.remove(label);
            if (label.element) label.element.remove();
        });
        this.sectionPointLabels = [];

        // 清空数据
        this.sectionPoints = [];

        // 清除截面
        this.clearSection();

        if (this.onPointsChange) {
            this.onPointsChange(this.sectionPoints);
        }
    }

    // ========================
    // 切换顶点选择
    // ========================
    toggleVertexSelection(vertexName) {
        const index = this.selectedVertices.indexOf(vertexName);

        if (index > -1) {
            this.selectedVertices.splice(index, 1);
        } else {
            this.selectedVertices.push(vertexName);
        }

        if (this.onVertexSelect) {
            this.onVertexSelect(vertexName, this.selectedVertices);
        }

        return this.selectedVertices;
    }

    // ========================
    // 获取选中的顶点
    // ========================
    getSelectedVertices() {
        return [...this.selectedVertices];
    }

    // ========================
    // 获取截面点
    // ========================
    getSectionPoints() {
        return [...this.sectionPoints];
    }

    // ========================
    // 获取所有点（顶点 + 截面点）
    // ========================
    getAllPoints() {
        const allPoints = [];

        this.selectedVertices.forEach(name => {
            if (this.currentVertices[name]) {
                allPoints.push(this.currentVertices[name].clone());
            }
        });

        this.sectionPoints.forEach(p => {
            allPoints.push(p.position.clone());
        });

        return allPoints;
    }

    // ========================
    // 创建截面
    // ========================
    createSection() {
        const allPoints = this.getAllPoints();

        if (allPoints.length < 3) {
            console.warn('至少需要3个点才能创建截面');
            return null;
        }

        this.clearSection();

        // 计算截面平面
        const plane = this.calculatePlane(allPoints);
        if (!plane) return null;

        // 创建截面几何体
        const sectionGeometry = this.createSectionGeometry(allPoints, plane);
        if (!sectionGeometry) return null;

        const sectionMaterial = new THREE.MeshPhongMaterial({
            color: 0xb19cd9,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });

        this.sectionMesh = new THREE.Mesh(sectionGeometry, sectionMaterial);
        this.sectionMesh.name = 'crossSection';
        this.scene.add(this.sectionMesh);

        // 创建截面边线
        const edgesGeometry = new THREE.EdgesGeometry(sectionGeometry);
        const edgesMaterial = new THREE.LineBasicMaterial({
            color: 0xd4b8e8,
            linewidth: 2
        });
        this.sectionEdges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        this.scene.add(this.sectionEdges);

        return this.sectionMesh;
    }

    // ========================
    // 计算平面
    // ========================
    calculatePlane(points) {
        if (points.length < 3) return null;

        const v1 = new THREE.Vector3().subVectors(points[1], points[0]);
        const v2 = new THREE.Vector3().subVectors(points[2], points[0]);
        const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();

        if (normal.length() < 0.001) return null;

        return new THREE.Plane().setFromNormalAndCoplanarPoint(normal, points[0]);
    }

    // ========================
    // 创建截面几何体
    // ========================
    createSectionGeometry(points, plane) {
        if (points.length < 3) return null;

        // 计算中心点
        const center = new THREE.Vector3();
        points.forEach(p => center.add(p));
        center.divideScalar(points.length);

        // 创建局部坐标系
        const normal = plane.normal;
        const up = Math.abs(normal.y) > 0.9
            ? new THREE.Vector3(1, 0, 0)
            : new THREE.Vector3(0, 1, 0);
        const right = new THREE.Vector3().crossVectors(up, normal).normalize();
        const newUp = new THREE.Vector3().crossVectors(normal, right).normalize();

        // 投影到2D
        const points2D = points.map(p => {
            const diff = p.clone().sub(center);
            return new THREE.Vector2(diff.dot(right), diff.dot(newUp));
        });

        // 按角度排序
        const angles = points2D.map((p, i) => ({
            index: i,
            angle: Math.atan2(p.y, p.x)
        }));
        angles.sort((a, b) => a.angle - b.angle);

        const sortedPoints = angles.map(a => points[a.index]);
        const sortedPoints2D = angles.map(a => points2D[a.index]);

        // 创建形状
        const shape = new THREE.Shape();
        shape.moveTo(sortedPoints2D[0].x, sortedPoints2D[0].y);
        for (let i = 1; i < sortedPoints2D.length; i++) {
            shape.lineTo(sortedPoints2D[i].x, sortedPoints2D[i].y);
        }
        shape.closePath();

        const geometry = new THREE.ShapeGeometry(shape);

        // 变换到3D位置
        const matrix = new THREE.Matrix4();
        matrix.makeBasis(right, newUp, normal);
        matrix.setPosition(center);
        geometry.applyMatrix4(matrix);

        return geometry;
    }

    // ========================
    // 清除截面
    // ========================
    clearSection() {
        if (this.sectionMesh) {
            this.scene.remove(this.sectionMesh);
            this.sectionMesh.geometry.dispose();
            this.sectionMesh.material.dispose();
            this.sectionMesh = null;
        }

        if (this.sectionEdges) {
            this.scene.remove(this.sectionEdges);
            this.sectionEdges.geometry.dispose();
            this.sectionEdges.material.dispose();
            this.sectionEdges = null;
        }
    }

    // ========================
    // 清除所有
    // ========================
    clear() {
        this.clearSectionPoints();
        this.clearSection();
        this.selectedVertices = [];
        this.removePreviewPoint();
        this.crossSectionMode = false;
    }

    // ========================
    // 计算截面面积
    // ========================
    getSectionArea() {
        const allPoints = this.getAllPoints();
        if (allPoints.length < 3) return 0;

        // 使用叉积计算面积
        let area = 0;
        for (let i = 1; i < allPoints.length - 1; i++) {
            const v1 = new THREE.Vector3().subVectors(allPoints[i], allPoints[0]);
            const v2 = new THREE.Vector3().subVectors(allPoints[i + 1], allPoints[0]);
            area += v1.cross(v2).length() / 2;
        }

        return area;
    }
}
