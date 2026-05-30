// ========================
// 视图控制管理器
// ========================
import * as THREE from 'three';

export class ViewControlManager {
    constructor(camera, controls) {
        this.camera = camera;
        this.controls = controls;

        // 预设视图位置
        this.viewPresets = {
            'default': { x: 5, y: 5, z: 5 },
            'front': { x: 0, y: 0, z: 8 },
            'back': { x: 0, y: 0, z: -8 },
            'left': { x: -8, y: 0, z: 0 },
            'right': { x: 8, y: 0, z: 0 },
            'top': { x: 0, y: 8, z: 0.01 },
            'bottom': { x: 0, y: -8, z: 0.01 }
        };

        // 动画配置
        this.animationDuration = 0.5;
        this.isAnimating = false;
    }

    // ========================
    // 设置视图
    // ========================
    setView(viewName, duration = 0.5) {
        const preset = this.viewPresets[viewName];
        if (!preset) {
            console.warn(`未知视图: ${viewName}`);
            return;
        }

        this.animateCamera(
            new THREE.Vector3(preset.x, preset.y, preset.z),
            duration
        );
    }

    // ========================
    // 动画过渡相机位置
    // ========================
    animateCamera(targetPosition, duration = 0.5) {
        if (this.isAnimating) return;

        this.isAnimating = true;

        const startPosition = this.camera.position.clone();
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = (currentTime - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);

            // 使用缓动函数
            const eased = this.easeInOutCubic(progress);

            // 插值位置
            this.camera.position.lerpVectors(startPosition, targetPosition, eased);

            // 更新控制器
            if (this.controls) {
                this.controls.update();
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
            }
        };

        requestAnimationFrame(animate);
    }

    // ========================
    // 缓动函数
    // ========================
    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // ========================
    // 重置视图
    // ========================
    resetView(duration = 0.5) {
        this.setView('default', duration);
    }

    // ========================
    // 获取当前视图信息
    // ========================
    getCurrentViewInfo() {
        return {
            position: this.camera.position.clone(),
            rotation: this.camera.rotation.clone(),
            zoom: this.camera.zoom
        };
    }

    // ========================
    // 设置相机到指定位置
    // ========================
    setCameraPosition(x, y, z, lookAtCenter = true) {
        this.camera.position.set(x, y, z);

        if (lookAtCenter) {
            this.camera.lookAt(0, 0, 0);
        }

        if (this.controls) {
            this.controls.update();
        }
    }

    // ========================
    // 聚焦到指定点
    // ========================
    focusOnPoint(point, distance = 5) {
        const direction = new THREE.Vector3()
            .subVectors(this.camera.position, point)
            .normalize();

        const targetPosition = point.clone().add(
            direction.multiplyScalar(distance)
        );

        this.animateCamera(targetPosition);
    }

    // ========================
    // 围绕点旋转
    // ========================
    orbitAroundPoint(point, angle, axis = 'y') {
        const offset = this.camera.position.clone().sub(point);

        const rotationMatrix = new THREE.Matrix4();
        const axisVector = axis === 'x'
            ? new THREE.Vector3(1, 0, 0)
            : axis === 'z'
                ? new THREE.Vector3(0, 0, 1)
                : new THREE.Vector3(0, 1, 0);

        rotationMatrix.makeRotationAxis(axisVector, angle);
        offset.applyMatrix4(rotationMatrix);

        this.camera.position.copy(point).add(offset);
        this.camera.lookAt(point);

        if (this.controls) {
            this.controls.target.copy(point);
            this.controls.update();
        }
    }

    // ========================
    // 获取相机朝向
    // ========================
    getCameraDirection() {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        return direction;
    }

    // ========================
    // 检查是否正在动画
    // ========================
    isAnimatingCamera() {
        return this.isAnimating;
    }

    // ========================
    // 停止动画
    // ========================
    stopAnimation() {
        this.isAnimating = false;
    }

    // ========================
    // 获取所有视图名称
    // ========================
    getViewNames() {
        return Object.keys(this.viewPresets);
    }
}
