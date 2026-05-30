/**
 * GeometryFactory
 * 几何体工厂，负责创建各种几何体
 */

import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { COLORS } from '../utils/constants.js';
import { GEOMETRY_CONFIGS } from './configs.js';

export class GeometryFactory {
  constructor(scene, labelRenderer) {
    this.scene = scene;
    this.labelRenderer = labelRenderer;
    this.currentVertices = {};
    this.currentEdges = [];
    this.currentFaces = [];
  }

  createGeometry(config, options = {}) {
    // 存储当前配置供 updateGeometryParam 使用
    this.currentConfig = config;
    this.currentOptions = options;

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

  /**
   * 动态更新几何体参数
   * @param {string} param - 参数名（如 size, width, height, radius 等）
   * @param {number} value - 新参数值
   */
  updateGeometryParam(param, value) {
    if (!this.currentConfig) return;

    // 更新参数
    if (!this.currentConfig.defaultParams) {
      this.currentConfig.defaultParams = {};
    }
    this.currentConfig.defaultParams[param] = value;

    // 移除旧几何体
    const oldGroup = this.scene.getObjectByName('geometry');
    if (oldGroup) {
      this.scene.remove(oldGroup);
      oldGroup.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    // 重新计算顶点（多面体）
    if (this.currentConfig.type === 'polyhedron') {
      this._recalculateVertices(this.currentConfig, param, value);
    }

    // 重建几何体
    const newGroup = this.createGeometry(this.currentConfig, this.currentOptions);
    this.scene.add(newGroup);

    // 触发更新事件
    this.scene.dispatchEvent({ type: 'geometryUpdate', param, value });
  }

  /**
   * 根据参数重新计算顶点位置
   * @param {object} config - 几何体配置
   * @param {string} param - 变化的参数名
   * @param {number} value - 新参数值
   */
  _recalculateVertices(config, param, value) {
    const params = config.defaultParams;
    const vertexDefs = config._originalVertices || config.vertices;

    // 首次调用时缓存原始顶点定义
    if (!config._originalVertices) {
      config._originalVertices = JSON.parse(JSON.stringify(config.vertices));
    }

    // 参数→顶点分量的缩放映射
    const scalingRules = {
      cube:        { size:      { axes: ['x', 'y', 'z'] } },
      rectangularBox: {
        width:  { axes: ['x'] },
        height: { axes: ['y'] },
        depth:  { axes: ['z'] }
      },
      triangularPrism: {
        radius: { axes: ['x', 'z'] },
        height: { axes: ['y'] }
      },
      tetrahedron:       { radius:    { axes: ['x', 'y', 'z'] } },
      squarePyramid: {
        baseSize: { axes: ['x', 'z'] },
        height:   { axes: ['y'] }
      },
      hexagonalPrism: {
        radius: { axes: ['x', 'z'] },
        height: { axes: ['y'] }
      },
      triangularPyramid: {
        baseRadius: { axes: ['x', 'y', 'z'] },
        height:     { axes: ['y'] }
      }
    };

    const configKey = Object.entries(GEOMETRY_CONFIGS).find(([, v]) => v.name === config.name)?.[0];
    const rules = scalingRules[configKey];
    if (!rules) return;

    // 计算各轴缩放因子
    const scale = { x: 1, y: 1, z: 1 };
    Object.entries(rules).forEach(([p, { axes }]) => {
      const defaultVal = config._originalDefaultParams?.[p] ?? GEOMETRY_CONFIGS[configKey]?.defaultParams?.[p];
      if (defaultVal && params[p] !== undefined) {
        const factor = params[p] / defaultVal;
        axes.forEach(axis => { scale[axis] = factor; });
      }
    });

    // 首次缓存原始默认参数
    if (!config._originalDefaultParams) {
      config._originalDefaultParams = { ...GEOMETRY_CONFIGS[configKey]?.defaultParams };
    }

    // 应用缩放
    Object.entries(vertexDefs).forEach(([name, pos]) => {
      config.vertices[name] = [
        pos[0] * scale.x,
        pos[1] * scale.y,
        pos[2] * scale.z
      ];
    });
  }
}
