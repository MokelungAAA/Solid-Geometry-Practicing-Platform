/**
 * 相机管理器
 * 负责Three.js相机的创建和管理
 */

import * as THREE from 'three';

export class CameraManager {
    constructor() {
        this.camera = null;
        this.defaultPosition = { x: 4, y: 3, z: 5 };
        this.defaultLookAt = { x: 0, y: 0, z: 0 };

        this.init();
    }

    /**
     * 初始化相机
     */
    init() {
        const container = document.getElementById('canvas-wrapper');
        const width = container ? container.clientWidth : window.innerWidth;
        const height = container ? container.clientHeight : window.innerHeight;

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.set(
            this.defaultPosition.x,
            this.defaultPosition.y,
            this.defaultPosition.z
        );
        this.camera.lookAt(
            this.defaultLookAt.x,
            this.defaultLookAt.y,
            this.defaultLookAt.z
        );
    }

    /**
     * 获取相机
     */
    getCamera() {
        return this.camera;
    }

    /**
     * 设置相机位置
     */
    setPosition(x, y, z) {
        this.camera.position.set(x, y, z);
    }

    /**
     * 设置相机看向的目标点
     */
    setLookAt(x, y, z) {
        this.camera.lookAt(x, y, z);
    }

    /**
     * 重置相机到默认位置
     */
    reset() {
        this.setPosition(
            this.defaultPosition.x,
            this.defaultPosition.y,
            this.defaultPosition.z
        );
        this.setLookAt(
            this.defaultLookAt.x,
            this.defaultLookAt.y,
            this.defaultLookAt.z
        );
    }

    /**
     * 更新相机宽高比
     */
    updateAspect(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}
