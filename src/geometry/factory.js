/**
 * GeometryFactory
 * 几何体工厂，负责创建各种几何体
 */

import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { COLORS } from '../utils/constants.js';

export class GeometryFactory {
  constructor(scene, labelRenderer) {
    this.scene = scene;
    this.labelRenderer = labelRenderer;
    this.currentVertices = {};
    this.currentEdges = [];
    this.currentFaces = [];
  }

  createGeometry(config, options = {}) {
    const { showFaces = true, showEdges = true, showVertices = true, showLabels = true } = options;
    const group = new THREE.Group();
    group.name = 'geometry';

    // 曲面体特殊处理（圆柱/圆锥/球）
    if (config.type === 'curved') {
      return this._createCurvedGeometry(config, options);
    }

    // 创建顶点
    this.currentVertices = {};
    if (config.vertices) {
      Object.entries(config.vertices).forEach(([name, pos]) => {
        this.currentVertices[name] = new THREE.Vector3(pos[0], pos[1], pos[2]);
      });
    }

    // 居中几何体
    const center = new THREE.Vector3();
    Object.values(this.currentVertices).forEach(v => center.add(v));
    if (Object.keys(this.currentVertices).length > 0) {
      center.divideScalar(Object.keys(this.currentVertices).length);
    }
    Object.values(this.currentVertices).forEach(v => v.sub(center));

    // 创建面
    if (showFaces && config.faces) {
      const facesGroup = this.createFaces(config);
      group.add(facesGroup);
    }

    // 创建边
    if (showEdges && config.edges) {
      const edgesGroup = this.createEdges(config);
      group.add(edgesGroup);
    }

    // 创建顶点
    if (showVertices && config.vertices) {
      const verticesGroup = this.createVertices(config);
      group.add(verticesGroup);
    }

    // 创建标签
    if (showLabels && config.vertices) {
      const labelsGroup = this.createLabels(config);
      group.add(labelsGroup);
    }

    return group;
  }

  /** 创建曲面几何体（圆柱/圆锥/球） */
  _createCurvedGeometry(config, options) {
    const { showFaces = true, showEdges = true, showLabels = true } = options;
    const group = new THREE.Group();
    group.name = 'geometry';
    const params = config.defaultParams || {};

    let geometry;
    if (config.name === '圆柱') {
      geometry = new THREE.CylinderGeometry(
        params.radius || 1, params.radius || 1, params.height || 2, 32
      );
    } else if (config.name === '圆锥') {
      geometry = new THREE.ConeGeometry(
        params.radius || 1, params.height || 2, 32
      );
    } else if (config.name === '球') {
      geometry = new THREE.SphereGeometry(params.radius || 1, 32, 24);
    } else {
      geometry = new THREE.SphereGeometry(params.radius || 1, 32, 24);
    }

    // 半透明实体
    if (showFaces) {
      const material = new THREE.MeshStandardMaterial({
        color: COLORS.primary,
        metalness: 0.1,
        roughness: 0.6,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = `face_${config.name}`;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }

    // 线框边
    if (showEdges) {
      const edgesGeometry = new THREE.EdgesGeometry(geometry, 15);
      const edgesMaterial = new THREE.LineBasicMaterial({
        color: COLORS.wireframe,
        linewidth: 2
      });
      const wireframe = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      wireframe.name = 'edges';
      group.add(wireframe);
    }

    // 曲面体标签
    if (showLabels) {
      const labels = [];
      if (config.name === '圆柱') {
        labels.push(
          { name: 'O', pos: [0, -(params.height || 2) / 2, 0] },
          { name: 'O\'', pos: [0, (params.height || 2) / 2, 0] }
        );
      } else if (config.name === '圆锥') {
        labels.push(
          { name: 'V', pos: [0, (params.height || 2) / 2, 0] },
          { name: 'O', pos: [0, -(params.height || 2) / 2, 0] }
        );
      } else if (config.name === '球') {
        labels.push({ name: 'O', pos: [0, 0, 0] });
      }
      labels.forEach(({ name, pos }) => {
        const div = document.createElement('div');
        div.className = 'vertex-label';
        div.textContent = name;
        div.style.cssText = 'color:#333;font-size:12px;font-weight:bold;background:rgba(255,255,255,0.8);padding:2px 6px;border-radius:4px;border:1px solid #ddd;pointer-events:none;';
        const label = new CSS2DObject(div);
        label.position.set(pos[0], pos[1] + 0.15, pos[2]);
        label.name = `label_${name}`;
        label.userData = { isLabel: true };
        group.add(label);
      });
    }

    return group;
  }

  createFaces(config) {
    const facesGroup = new THREE.Group();
    facesGroup.name = 'faces';

    Object.entries(config.faces).forEach(([faceName, vertexNames]) => {
      if (!Array.isArray(vertexNames)) return;

      const shape = new THREE.Shape();
      const points = vertexNames.map(name => this.currentVertices[name]).filter(v => v);

      if (points.length < 3) return;

      // 创建平面几何
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const indices = [];

      points.forEach(p => vertices.push(p.x, p.y, p.z));

      // 三角化多边形
      for (let i = 1; i < points.length - 1; i++) {
        indices.push(0, i, i + 1);
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();

      const material = new THREE.MeshStandardMaterial({
        color: COLORS.primary,
        metalness: 0.1,
        roughness: 0.6,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = `face_${faceName}`;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { faceName, vertexNames };

      facesGroup.add(mesh);
    });

    return facesGroup;
  }

  createEdges(config) {
    const edgesGroup = new THREE.Group();
    edgesGroup.name = 'edges';

    const points = [];
    config.edges.forEach(([start, end]) => {
      const v1 = this.currentVertices[start];
      const v2 = this.currentVertices[end];
      if (v1 && v2) {
        points.push(v1.x, v1.y, v1.z);
        points.push(v2.x, v2.y, v2.z);
      }
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    const material = new THREE.LineBasicMaterial({
      color: COLORS.wireframe,
      linewidth: 2
    });

    const lines = new THREE.LineSegments(geometry, material);
    lines.name = 'edges';
    edgesGroup.add(lines);

    return edgesGroup;
  }

  createVertices(config) {
    const verticesGroup = new THREE.Group();
    verticesGroup.name = 'vertices';

    const geometry = new THREE.SphereGeometry(0.04, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: COLORS.vertex,
      metalness: 0.3,
      roughness: 0.4
    });

    Object.entries(this.currentVertices).forEach(([name, pos]) => {
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.copy(pos);
      sphere.name = `vertex_${name}`;
      sphere.userData = { vertexName: name };
      verticesGroup.add(sphere);
    });

    return verticesGroup;
  }

  createLabels(config) {
    const labelsGroup = new THREE.Group();
    labelsGroup.name = 'labels';

    Object.entries(this.currentVertices).forEach(([name, pos]) => {
      const div = document.createElement('div');
      div.className = 'vertex-label';
      div.textContent = name;
      div.style.cssText = 'color:#333;font-size:12px;font-weight:bold;background:rgba(255,255,255,0.8);padding:2px 6px;border-radius:4px;border:1px solid #ddd;pointer-events:none;';

      const label = new CSS2DObject(div);
      label.position.copy(pos);
      label.position.y += 0.15;
      label.name = `label_${name}`;
      label.userData = { isLabel: true };
      labelsGroup.add(label);
    });

    return labelsGroup;
  }

  getVertexWorldPosition(vertexName) {
    return this.currentVertices[vertexName] || null;
  }
}
