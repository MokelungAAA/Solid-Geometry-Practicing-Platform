/**
 * 渲染器管理器
 * 负责Three.js渲染器的创建和管理
 */

import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

export class RendererManager {
    constructor() {
        this.renderer = null;
        this.labelRenderer = null;
        this.currentContainer = null;

        this.init();
    }

    /**
     * 初始化渲染器
     */
    init() {
        const container = document.getElementById('canvas-wrapper');
        if (!container) {
            console.error('找不到canvas容器');
            return;
        }

        this.currentContainer = container;
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;

        // WebGL渲染器
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // 设置色调映射（如果支持）
        if (THREE.ACESFilmicToneMapping !== undefined) {
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.2;
        }
        container.appendChild(this.renderer.domElement);

        // CSS2D标签渲染器
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(width, height);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0';
        this.labelRenderer.domElement.style.left = '0';
        this.labelRenderer.domElement.style.pointerEvents = 'none';
        container.appendChild(this.labelRenderer.domElement);
    }

    /**
     * 获取WebGL渲染器
     */
    getRenderer() {
        return this.renderer;
    }

    /**
     * 获取标签渲染器
     */
    getLabelRenderer() {
        return this.labelRenderer;
    }

    /**
     * 更新渲染器尺寸
     */
    setSize(width, height) {
        if (this.renderer) {
            this.renderer.setSize(width, height);
        }
        if (this.labelRenderer) {
            this.labelRenderer.setSize(width, height);
        }
    }

    /**
     * 切换容器
     */
    switchContainer(containerId) {
        const newContainer = document.getElementById(containerId);
        if (!newContainer || newContainer === this.currentContainer) return;

        // 从旧容器移除
        if (this.currentContainer) {
            if (this.renderer && this.renderer.domElement.parentNode === this.currentContainer) {
                this.currentContainer.removeChild(this.renderer.domElement);
            }
            if (this.labelRenderer && this.labelRenderer.domElement.parentNode === this.currentContainer) {
                this.currentContainer.removeChild(this.labelRenderer.domElement);
            }
        }

        // 添加到新容器
        this.currentContainer = newContainer;
        const width = newContainer.clientWidth;
        const height = newContainer.clientHeight;

        this.setSize(width, height);
        newContainer.appendChild(this.renderer.domElement);
        newContainer.appendChild(this.labelRenderer.domElement);
    }

    /**
     * 渲染场景
     */
    render(scene, camera) {
        if (this.renderer && scene && camera) {
            this.renderer.render(scene, camera);
        }
        if (this.labelRenderer && scene && camera) {
            this.labelRenderer.render(scene, camera);
        }
    }
}
