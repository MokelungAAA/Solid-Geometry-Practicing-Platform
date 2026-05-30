/**
 * CameraManager
 * 相机管理器
 */

import * as THREE from 'three';

export class CameraManager {
  constructor() {
    this.init();
  }

  init() {
    // 创建透视相机
    this.camera = new THREE.PerspectiveCamera(
      45,  // fov
      window.innerWidth / window.innerHeight,  // aspect
      0.1,  // near
      100   // far
    );

    // 设置初始位置
    this.camera.position.set(5, 4, 5);

    // 看向原点
    this.camera.lookAt(0, 0, 0);
  }

  updateSize(width, height) {
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
