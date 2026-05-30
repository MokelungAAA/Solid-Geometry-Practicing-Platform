/**
 * RendererManager
 * 渲染器管理器
 */

import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

export class RendererManager {
  constructor() {
    this.container = null;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.init();
  }

  init() {
    // 创建 WebGL 渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    // 设置尺寸
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 启用阴影
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 设置色调映射
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // 创建 CSS2D 渲染器
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(this.width, this.height);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0';
    this.labelRenderer.domElement.style.left = '0';
    this.labelRenderer.domElement.style.pointerEvents = 'none';

    // 默认添加到 canvas-wrapper
    this.switchContainer('canvas-wrapper');
  }

  switchContainer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 移除旧的 canvas
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    if (this.labelRenderer.domElement.parentNode) {
      this.labelRenderer.domElement.parentNode.removeChild(this.labelRenderer.domElement);
    }

    // 添加到新容器
    this.container = container;
    container.style.position = 'relative';
    container.appendChild(this.renderer.domElement);
    container.appendChild(this.labelRenderer.domElement);

    // 更新尺寸
    this.updateSize(container.clientWidth, container.clientHeight);
  }

  updateSize(width, height) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
    this.labelRenderer.setSize(width, height);
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);
    this.labelRenderer.render(scene, camera);
  }

  getRenderer() {
    return this.renderer;
  }

  getLabelRenderer() {
    return this.labelRenderer;
  }

  dispose() {
    this.renderer.dispose();
    this.labelRenderer.domElement.remove();
    if (this.container && this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
