/**
 * CameraManager
 * 相机管理器
 */

import * as THREE from 'three';
import { SIZES } from '../utils/constants.js';

export class CameraManager {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth || SIZES.scene.width;
    this.height = container.clientHeight || SIZES.scene.height;
    
    this.init();
  }

  init() {
    // 创建透视相机
    this.camera = new THREE.PerspectiveCamera(
      SIZES.camera.fov,
      this.width / this.height,
      SIZES.camera.near,
      SIZES.camera.far
    );
    
    // 设置初始位置
    this.camera.position.set(
      SIZES.camera.position.x,
      SIZES.camera.position.y,
      SIZES.camera.position.z
    );
    
    // 看向原点
    this.camera.lookAt(0, 0, 0);
  }

  updateSize(width, height) {
    this.width = width;
    this.height = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  setPosition(x, y, z) {
    this.camera.position.set(x, y, z);
  }

  lookAt(x, y, z) {
    this.camera.lookAt(x, y, z);
  }

  getCamera() {
    return this.camera;
  }

  update() {
    // 更新逻辑（如果需要）
  }
}
