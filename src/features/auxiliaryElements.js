/**
 * AuxiliaryElementsManager
 * 辅助元素管理器（网格、坐标轴、标签）
 */

import * as THREE from 'three';

export class AuxiliaryElementsManager {
  constructor(scene) {
    this.scene = scene;
    this.grid = null;
    this.axes = null;
    this.vertexLabels = [];
    this.edgeLabels = [];
    this.showGrid = true;
    this.showAxes = true;
    this.showVertexLabels = false;
    this.showEdgeLabels = false;
    this.init();
  }

  init() {
    this.createGrid();
    this.createAxes();
  }

  createGrid() {
    const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0xcccccc);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.5;
    this.grid = gridHelper;
    this.scene.add(this.grid);
  }

  createAxes() {
    const axesHelper = new THREE.AxesHelper(5);
    this.axes = axesHelper;
    this.scene.add(this.axes);
  }

  toggleGrid() {
    this.showGrid = !this.showGrid;
    if (this.grid) this.grid.visible = this.showGrid;
    return this.showGrid;
  }

  toggleAxes() {
    this.showAxes = !this.showAxes;
    if (this.axes) this.axes.visible = this.showAxes;
    return this.showAxes;
  }

  createVertexLabels(geometry) {
    this.clearVertexLabels();
    if (!geometry || !geometry.geometry) return;
    const positions = geometry.geometry.attributes.position;
    const seen = new Set();
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      const key = `${x.toFixed(2)}_${y.toFixed(2)}_${z.toFixed(2)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(103, 80, 164, 0.8)';
      ctx.fillRect(0, 0, 64, 32);
      ctx.fillStyle = 'white';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String.fromCharCode(65 + i), 32, 20);
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(x, y + 0.15, z);
      sprite.scale.set(0.3, 0.15, 1);
      this.vertexLabels.push(sprite);
      this.scene.add(sprite);
    }
  }

  clearVertexLabels() {
    this.vertexLabels.forEach(label => {
      this.scene.remove(label);
      if (label.material.map) label.material.map.dispose();
      label.material.dispose();
    });
    this.vertexLabels = [];
  }

  toggleVertexLabels(geometry) {
    this.showVertexLabels = !this.showVertexLabels;
    if (this.showVertexLabels) {
      this.createVertexLabels(geometry);
    } else {
      this.clearVertexLabels();
    }
    return this.showVertexLabels;
  }

  update(geometry) {
    if (this.showVertexLabels) {
      this.createVertexLabels(geometry);
    }
  }

  dispose() {
    if (this.grid) this.scene.remove(this.grid);
    if (this.axes) this.scene.remove(this.axes);
    this.clearVertexLabels();
  }
}
