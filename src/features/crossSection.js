/**
 * CrossSectionManager
 * 截面管理器 - 支持顶点和棱上点的选择
 * 选点优先级：顶点(阈值0.15) > 棱上点(阈值0.1)
 */

import * as THREE from 'three';

export class CrossSectionManager {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.isActive = false;

    this.faceMeshes = [];
    this.vertices = {};          // { name: THREE.Vector3 } 世界坐标
    this.edges = [];             // [['A','B'], ...]
    this.selectedPoints = [];    // [{ id, position, type }]
    this.previewMarker = null;
    this.sectionMesh = null;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // 选点阈值
    this.VERTEX_THRESHOLD = 0.15;
    this.EDGE_THRESHOLD = 0.1;

    // 回调
    this.onModeChange = null;
    this.onVertexSelect = null;  // 保持向后兼容
  }

  /** 设置用于射线检测的面网格 */
  setFaceMeshes(meshes) {
    this.faceMeshes = meshes;
  }

  /** 设置顶点坐标和棱定义 */
  setGeometryData(vertices, edges) {
    this.vertices = {};
    if (vertices) {
      Object.entries(vertices).forEach(([name, pos]) => {
        this.vertices[name] = pos.clone
          ? pos.clone()
          : new THREE.Vector3(pos.x || pos[0], pos.y || pos[1], pos.z || pos[2]);
      });
    }
    this.edges = edges ? edges.map(e => [...e]) : [];
  }

  /** 切换截面模式 */
  toggleMode() {
    this.isActive = !this.isActive;
    if (!this.isActive) {
      this.clearSection();
      this.clearPreview();
    }
    if (this.onModeChange) {
      this.onModeChange(this.isActive);
    }
    return this.isActive;
  }

  /** 通过名称切换顶点选择（兼容侧边栏按钮） */
  toggleVertexSelection(name) {
    const pos = this.vertices[name];
    if (!pos) return;
    const nearest = { type: 'vertex', id: name, position: pos.clone(), distance: 0 };
    this._togglePointSelection(nearest);
  }

  // ==================== 核心交互 ====================

  /** 处理点击事件 */
  handleClick(event) {
    if (!this.isActive) return;
    const worldPoint = this._getIntersectionPoint(event);
    if (!worldPoint) return;
    const nearest = this.findNearestSelectablePoint(worldPoint);
    if (nearest) {
      this._togglePointSelection(nearest);
    }
  }

  /** 处理鼠标移动，显示悬停预览 */
  updatePreviewPoint(event) {
    if (!this.isActive) return;
    const worldPoint = this._getIntersectionPoint(event);
    if (!worldPoint) {
      this.clearPreview();
      return;
    }
    const nearest = this.findNearestSelectablePoint(worldPoint);
    if (nearest) {
      this._showPreviewAt(nearest);
    } else {
      this.clearPreview();
    }
  }

  // ==================== 选点算法 ====================

  /**
   * 查找最近的可选点（顶点优先，然后棱上点）
   * @param {THREE.Vector3} worldPoint 射线与面的交点
   * @returns {object|null} { type, id, position, distance, edgeName?, t? }
   */
  findNearestSelectablePoint(worldPoint) {
    const vertex = this._findNearestVertex(worldPoint);
    const edgePoint = this._findNearestEdgePoint(worldPoint);

    // 两者都不存在
    if (!vertex && !edgePoint) return null;

    // 只有其一
    if (vertex && !edgePoint) {
      return vertex.distance < this.EDGE_THRESHOLD ? vertex : null;
    }
    if (!vertex && edgePoint) {
      return edgePoint.distance < this.EDGE_THRESHOLD ? edgePoint : null;
    }

    // 两者都有，优先选更近的；顶点在阈值内优先
    if (vertex.distance < this.VERTEX_THRESHOLD) return vertex;
    if (edgePoint.distance < this.EDGE_THRESHOLD) return edgePoint;
    if (vertex.distance < this.EDGE_THRESHOLD) return vertex;

    return null;
  }

  /** 查找最近的顶点 */
  _findNearestVertex(worldPoint) {
    let nearest = null;
    let minDist = Infinity;

    Object.entries(this.vertices).forEach(([name, pos]) => {
      const dist = worldPoint.distanceTo(pos);
      if (dist < minDist) {
        minDist = dist;
        nearest = {
          type: 'vertex',
          id: name,
          position: pos.clone(),
          distance: dist
        };
      }
    });

    return nearest;
  }

  /**
   * 查找最近的棱上点
   * 计算点到每条线段的最近点，取距离最小者
   */
  _findNearestEdgePoint(worldPoint) {
    let nearest = null;
    let minDist = Infinity;

    const ab = new THREE.Vector3();
    const ap = new THREE.Vector3();
    const closest = new THREE.Vector3();

    this.edges.forEach(([nameA, nameB]) => {
      const a = this.vertices[nameA];
      const b = this.vertices[nameB];
      if (!a || !b) return;

      ab.subVectors(b, a);
      ap.subVectors(worldPoint, a);
      const abLen2 = ab.dot(ab);
      if (abLen2 < 1e-10) return;

      let t = ap.dot(ab) / abLen2;
      t = Math.max(0, Math.min(1, t));

      closest.lerpVectors(a, b, t);
      const dist = worldPoint.distanceTo(closest);

      if (dist < minDist) {
        minDist = dist;
        const edgeName = `${nameA}${nameB}`;
        nearest = {
          type: 'edge',
          id: `edge:${edgeName}:${t.toFixed(2)}`,
          edgeName,
          t: parseFloat(t.toFixed(3)),
          position: closest.clone(),
          distance: dist
        };
      }
    });

    return nearest;
  }

  // ==================== 内部工具 ====================

  /** 射线检测获取世界坐标交点 */
  _getIntersectionPoint(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.faceMeshes, true);
    return intersects.length > 0 ? intersects[0].point.clone() : null;
  }

  /** 切换选中状态 */
  _togglePointSelection(nearest) {
    const idx = this.selectedPoints.findIndex(p => p.id === nearest.id);
    if (idx !== -1) {
      this.selectedPoints.splice(idx, 1);
      this._removeSelectionMarker(nearest.id);
    } else {
      this.selectedPoints.push({
        id: nearest.id,
        position: nearest.position.clone(),
        type: nearest.type
      });
      this._addSelectionMarker(nearest);
    }

    if (this.onVertexSelect) {
      this.onVertexSelect({
        index: this.selectedPoints.length,
        name: nearest.id,
        type: nearest.type,
        point: nearest
      });
    }
  }

  /** 添加选中点的持久标记 */
  _addSelectionMarker(nearest) {
    const isVertex = nearest.type === 'vertex';
    const color = isVertex ? 0x4CAF50 : 0x2196F3;
    const size = isVertex ? 0.06 : 0.04;
    const geo = new THREE.SphereGeometry(size, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color });
    const marker = new THREE.Mesh(geo, mat);
    marker.position.copy(nearest.position);
    marker.name = `cs_sel_${nearest.id}`;
    this.scene.add(marker);
  }

  /** 移除选中点标记 */
  _removeSelectionMarker(id) {
    const marker = this.scene.getObjectByName(`cs_sel_${id}`);
    if (marker) {
      this.scene.remove(marker);
      marker.geometry.dispose();
      marker.material.dispose();
    }
  }

  /** 显示悬停预览标记 */
  _showPreviewAt(nearest) {
    this.clearPreview();
    const isVertex = nearest.type === 'vertex';
    const color = isVertex ? 0xFFD8E4 : 0xBBDEFB;
    const size = isVertex ? 0.08 : 0.06;
    const geo = new THREE.SphereGeometry(size, 16, 16);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8
    });
    this.previewMarker = new THREE.Mesh(geo, mat);
    this.previewMarker.position.copy(nearest.position);
    this.scene.add(this.previewMarker);
  }

  /** 清除悬停预览 */
  clearPreview() {
    if (this.previewMarker) {
      this.scene.remove(this.previewMarker);
      this.previewMarker.geometry.dispose();
      this.previewMarker.material.dispose();
      this.previewMarker = null;
    }
  }

  // ==================== 截面创建 ====================

  /** 根据选中的点创建截面 */
  createSection() {
    if (this.selectedPoints.length < 3) return false;
    this.clearSectionMesh();

    const points = this.selectedPoints.map(p => p.position);
    if (points.length < 3) return false;

    // 计算质心
    const centroid = new THREE.Vector3();
    points.forEach(p => centroid.add(p));
    centroid.divideScalar(points.length);

    // 计算拟合平面法向量
    const v1 = new THREE.Vector3().subVectors(points[1], points[0]);
    const v2 = new THREE.Vector3().subVectors(points[2], points[0]);
    const normal = new THREE.Vector3().crossVectors(v1, v2);
    if (normal.length() < 1e-10) return false;
    normal.normalize();

    // 构建平面局部坐标系（clone避免修改原始v1）
    const u = v1.clone().normalize();
    const v = new THREE.Vector3().crossVectors(normal, u).normalize();

    // 将3D点投影到平面2D坐标
    const pts2D = points.map(p => {
      const d = new THREE.Vector3().subVectors(p, centroid);
      return { x: d.dot(u), y: d.dot(v) };
    });

    // 按极角排序以构成凸多边形
    pts2D.sort((a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x));

    // 创建Shape
    const shape = new THREE.Shape();
    shape.moveTo(pts2D[0].x, pts2D[0].y);
    for (let i = 1; i < pts2D.length; i++) {
      shape.lineTo(pts2D[i].x, pts2D[i].y);
    }
    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape);
    // 使用BasicMaterial确保无灯光也能可见
    const material = new THREE.MeshBasicMaterial({
      color: 0xFF9800,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.sectionMesh = new THREE.Mesh(geometry, material);
    this.sectionMesh.position.copy(centroid);

    // 确保法向量朝向相机（z分量为正）
    if (normal.z < 0) normal.negate();

    // 将截面网格朝向法向量方向
    const quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    this.sectionMesh.quaternion.copy(quat);

    this.scene.add(this.sectionMesh);
    return true;
  }

  /** 仅清除截面网格（不清除选点） */
  clearSectionMesh() {
    if (this.sectionMesh) {
      this.scene.remove(this.sectionMesh);
      this.sectionMesh.geometry.dispose();
      this.sectionMesh.material.dispose();
      this.sectionMesh = null;
    }
  }

  /** 清除截面和所有选点 */
  clearSection() {
    this.clearSectionMesh();
    this.selectedPoints.forEach(p => this._removeSelectionMarker(p.id));
    this.selectedPoints = [];
  }

  /** 获取当前选中点数量 */
  getSelectedCount() {
    return this.selectedPoints.length;
  }

  /** 获取选中点名称列表 */
  getSelectedPointNames() {
    return this.selectedPoints.map(p => p.id);
  }

  /** 释放所有资源 */
  dispose() {
    this.clearSection();
    this.clearPreview();
  }
}
