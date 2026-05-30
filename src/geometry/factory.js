/**
 * GeometryFactory
 * 几何体工厂，负责创建各种几何体
 */

import * as THREE from 'three';
import { COLORS, GEOMETRY_TYPES } from '../utils/constants.js';
import { GEOMETRY_DETAILS } from './configs.js';

export class GeometryFactory {
  constructor() {
    this.materials = this.createMaterials();
  }

  createMaterials() {
    return {
      primary: new THREE.MeshStandardMaterial({
        color: COLORS.primary,
        metalness: 0.1,
        roughness: 0.6,
        transparent: true,
        opacity: 0.85
      }),
      wireframe: new THREE.LineBasicMaterial({
        color: COLORS.wireframe,
        linewidth: 1
      }),
      highlight: new THREE.MeshStandardMaterial({
        color: COLORS.highlight,
        metalness: 0.1,
        roughness: 0.6,
        transparent: true,
        opacity: 0.9
      }),
      selected: new THREE.MeshStandardMaterial({
        color: COLORS.selected,
        metalness: 0.1,
        roughness: 0.6,
        transparent: true,
        opacity: 0.9
      })
    };
  }

  create(type, params = {}) {
    const config = GEOMETRY_DETAILS[type];
    if (!config) {
      console.error(`Unknown geometry type: ${type}`);
      return null;
    }

    const geometry = this.createGeometry(type, params);
    if (!geometry) return null;

    const mesh = new THREE.Mesh(geometry, this.materials.primary.clone());
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { type, params, config };

    // 添加线框
    const wireframe = new THREE.WireframeGeometry(geometry);
    const wireframeLine = new THREE.LineSegments(wireframe, this.materials.wireframe);
    mesh.add(wireframeLine);

    return mesh;
  }

  createGeometry(type, params) {
    switch (type) {
      case GEOMETRY_TYPES.CUBE:
        return new THREE.BoxGeometry(params.size, params.size, params.size);
      
      case GEOMETRY_TYPES.RECTANGULAR_BOX:
        return new THREE.BoxGeometry(params.width, params.height, params.depth);
      
      case GEOMETRY_TYPES.TRIANGULAR_PRISM:
        return this.createTriangularPrism(params);
      
      case GEOMETRY_TYPES.TETRAHEDRON:
        return new THREE.TetrahedronGeometry(params.radius);
      
      case GEOMETRY_TYPES.SQUARE_PYRAMID:
        return this.createSquarePyramid(params);
      
      case GEOMETRY_TYPES.HEXAGONAL_PRISM:
        return this.createHexagonalPrism(params);
      
      case GEOMETRY_TYPES.TRIANGULAR_PYRAMID:
        return this.createTriangularPyramid(params);
      
      case GEOMETRY_TYPES.CYLINDER:
        return new THREE.CylinderGeometry(params.radius, params.radius, params.height, 32);
      
      case GEOMETRY_TYPES.CONE:
        return new THREE.ConeGeometry(params.radius, params.height, 32);
      
      case GEOMETRY_TYPES.SPHERE:
        return new THREE.SphereGeometry(params.radius, 32, 32);
      
      default:
        return null;
    }
  }

  createTriangularPrism(params) {
    const geometry = new THREE.BufferGeometry();
    const radius = params.radius;
    const height = params.height;
    
    // 三角形底面顶点
    const vertices = new Float32Array([
      // 底面
      -radius, 0, -radius * Math.sqrt(3) / 3,
      radius, 0, -radius * Math.sqrt(3) / 3,
      0, 0, radius * 2 * Math.sqrt(3) / 3,
      // 顶面
      -radius, height, -radius * Math.sqrt(3) / 3,
      radius, height, -radius * Math.sqrt(3) / 3,
      0, height, radius * 2 * Math.sqrt(3) / 3
    ]);
    
    const indices = [
      // 底面
      0, 1, 2,
      // 顶面
      3, 5, 4,
      // 侧面
      0, 3, 4, 0, 4, 1,
      1, 4, 5, 1, 5, 2,
      2, 5, 3, 2, 3, 0
    ];
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  }

  createSquarePyramid(params) {
    const geometry = new THREE.BufferGeometry();
    const baseSize = params.baseSize / 2;
    const height = params.height;
    
    const vertices = new Float32Array([
      // 底面
      -baseSize, 0, -baseSize,
      baseSize, 0, -baseSize,
      baseSize, 0, baseSize,
      -baseSize, 0, baseSize,
      // 顶点
      0, height, 0
    ]);
    
    const indices = [
      // 底面
      0, 1, 2, 0, 2, 3,
      // 侧面
      0, 4, 1,
      1, 4, 2,
      2, 4, 3,
      3, 4, 0
    ];
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  }

  createHexagonalPrism(params) {
    const geometry = new THREE.CylinderGeometry(params.radius, params.radius, params.height, 6);
    return geometry;
  }

  createTriangularPyramid(params) {
    const geometry = new THREE.BufferGeometry();
    const radius = params.baseRadius;
    const height = params.height;
    
    const vertices = new Float32Array([
      // 底面三角形
      -radius, 0, -radius * Math.sqrt(3) / 3,
      radius, 0, -radius * Math.sqrt(3) / 3,
      0, 0, radius * 2 * Math.sqrt(3) / 3,
      // 顶点
      0, height, 0
    ]);
    
    const indices = [
      // 底面
      0, 2, 1,
      // 侧面
      0, 3, 1,
      1, 3, 2,
      2, 3, 0
    ];
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  }

  getDetails(type) {
    return GEOMETRY_DETAILS[type] || null;
  }

  calculateVolume(type, params) {
    const details = this.getDetails(type);
    return details ? details.volume(params) : 0;
  }

  calculateSurfaceArea(type, params) {
    const details = this.getDetails(type);
    return details ? details.surfaceArea(params) : 0;
  }
}
