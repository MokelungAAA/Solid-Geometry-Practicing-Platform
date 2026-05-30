/**
 * 高中立体几何交互练习平台 - 主入口
 * 模块化重构版本
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import gsap from 'gsap';

// 核心模块
import { SceneManager } from './core/scene.js';
import { CameraManager } from './core/camera.js';
import { RendererManager } from './core/renderer.js';

// 几何体模块
import { GeometryFactory } from './geometry/factory.js';
import { GEOMETRY_CONFIGS } from './geometry/configs.js';

// 功能模块
import { UnfoldManager } from './features/unfold.js';
import { CrossSectionManager } from './features/crossSection.js';
import { ViewControlManager } from './features/viewControl.js';

// UI模块
import { ToolbarManager } from './ui/toolbar.js';
import { InfoCardManager } from './ui/infoCard.js';
import { ToastManager } from './ui/toast.js';

// 工具模块
import { CONSTANTS } from './utils/constants.js';

/**
 * 应用主类
 */
class SolidGeometryApp {
    constructor() {
        // 核心对象
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.labelRenderer = null;
        this.controls = null;

        // 管理器
        this.sceneManager = null;
        this.cameraManager = null;
        this.rendererManager = null;
        this.geometryFactory = null;
        this.unfoldManager = null;
        this.crossSectionManager = null;
        this.viewControlManager = null;
        this.toolbarManager = null;
        this.infoCardManager = null;
        this.toastManager = null;

        // 状态
        this.currentGeometryType = 'cube';
        this.geometryGroup = null;

        // 初始化
        this.init();
    }

    /**
     * 初始化应用
     */
    async init() {
        try {
            // 初始化核心模块
            this.initCore();

            // 初始化功能模块
            this.initFeatures();

            // 初始化UI模块
            this.initUI();

            // 初始化几何体
            this.initGeometry();

            // 绑定事件
            this.bindEvents();

            // 开始渲染循环
            this.animate();

            // 隐藏加载动画
            this.hideLoading();

            console.log('立体几何平台初始化完成');
        } catch (error) {
            console.error('初始化失败:', error);
            this.showToast('初始化失败，请刷新页面重试', 'error');
        }
    }

    /**
     * 初始化核心模块
     */
    initCore() {
        // 场景
        this.sceneManager = new SceneManager();
        this.scene = this.sceneManager.getScene();

        // 相机
        this.cameraManager = new CameraManager();
        this.camera = this.cameraManager.getCamera();

        // 渲染器
        this.rendererManager = new RendererManager();
        this.renderer = this.rendererManager.getRenderer();
        this.labelRenderer = this.rendererManager.getLabelRenderer();

        // 控制器
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 20;
        this.controls.maxPolarAngle = Math.PI;
    }

    /**
     * 初始化功能模块
     */
    initFeatures() {
        // 展开管理器
        this.unfoldManager = new UnfoldManager(this.scene, this.camera, this.renderer);

        // 截面管理器
        this.crossSectionManager = new CrossSectionManager(this.scene, this.camera, this.renderer);

        // 视图控制管理器
        this.viewControlManager = new ViewControlManager(this.camera, this.controls);
    }

    /**
     * 初始化UI模块
     */
    initUI() {
        // 工具栏
        this.toolbarManager = new ToolbarManager();

        // 信息卡片
        this.infoCardManager = new InfoCardManager();

        // Toast提示
        this.toastManager = new ToastManager();
    }

    /**
     * 初始化几何体
     */
    initGeometry() {
        this.geometryFactory = new GeometryFactory(this.scene, this.labelRenderer);
        this.createGeometry('cube');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 几何体选择
        document.querySelectorAll('.geometry-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                if (type) {
                    this.createGeometry(type);
                }
            });
        });

        // 视图控制
        document.getElementById('btn-front')?.addEventListener('click', () => {
            this.viewControlManager.setView('front');
        });
        document.getElementById('btn-side')?.addEventListener('click', () => {
            this.viewControlManager.setView('right');
        });
        document.getElementById('btn-perspective')?.addEventListener('click', () => {
            this.viewControlManager.setView('default');
        });

        // 显示模式
        document.getElementById('btn-solid')?.addEventListener('click', () => {
            this.setDisplayMode('solid');
        });
        document.getElementById('btn-wireframe')?.addEventListener('click', () => {
            this.setDisplayMode('wireframe');
        });
        document.getElementById('btn-hidden-edges')?.addEventListener('click', () => {
            this.setDisplayMode('hidden');
        });

        // 透明度
        document.getElementById('opacity-slider')?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.setOpacity(value);
            document.getElementById('opacity-value').textContent = value.toFixed(2);
        });

        // 辅助元素
        document.getElementById('btn-grid')?.addEventListener('click', (e) => {
            this.sceneManager.toggleGrid();
            e.currentTarget.classList.toggle('active');
        });
        document.getElementById('btn-axes')?.addEventListener('click', (e) => {
            this.sceneManager.toggleAxes();
            e.currentTarget.classList.toggle('active');
        });

        // 展开/折叠
        document.getElementById('btn-unfold')?.addEventListener('click', () => {
            this.unfoldManager.animate(1);
        });
        document.getElementById('btn-fold')?.addEventListener('click', () => {
            this.unfoldManager.animate(0);
        });
        document.getElementById('unfold-slider')?.addEventListener('input', (e) => {
            const progress = parseInt(e.target.value) / 100;
            this.unfoldManager.setProgress(progress);
        });

        // 截面工具
        document.getElementById('btn-cross-section-mode')?.addEventListener('click', () => {
            this.toggleCrossSectionMode();
        });
        document.getElementById('btn-create-section')?.addEventListener('click', () => {
            this.crossSectionManager.createSection();
        });
        document.getElementById('btn-clear-section')?.addEventListener('click', () => {
            this.crossSectionManager.clearSection();
        });

        // 工具栏折叠
        document.getElementById('toolbar-toggle')?.addEventListener('click', () => {
            document.getElementById('toolbar').classList.toggle('collapsed');
        });

        // 信息卡片折叠
        document.getElementById('toggle-info-card')?.addEventListener('click', () => {
            document.getElementById('geometry-info-card').classList.toggle('collapsed');
        });

        // 窗口大小变化
        window.addEventListener('resize', () => this.onWindowResize());
    }

    /**
     * 创建几何体
     */
    createGeometry(type) {
        // 移除旧几何体
        if (this.geometryGroup) {
            this.scene.remove(this.geometryGroup);
        }

        // 重置展开状态
        this.unfoldManager.clear();

        // 获取配置
        const config = GEOMETRY_CONFIGS[type];
        if (!config) {
            console.error(`未知几何体类型: ${type}`);
            return;
        }

        // 创建新几何体
        this.geometryGroup = this.geometryFactory.createGeometry(config, { showFaces: true, showEdges: true, showVertices: true, showLabels: true });
        this.currentGeometryType = type;

        // 更新截面管理器的面网格
        const faceMeshes = [];
        this.geometryGroup.traverse(child => {
            if (child.isMesh && child.name.startsWith('face_')) {
                faceMeshes.push(child);
            }
        });
        this.crossSectionManager.setFaceMeshes(faceMeshes);

        // 更新信息卡片
        this.infoCardManager.updateGeometryInfo(type);

        // 更新顶点选择器
        this.updateVertexSelector();

        this.showToast(`已切换到${type}`);
    }

    /**
     * 设置显示模式
     */
    setDisplayMode(mode) {
        if (!this.geometryGroup) return;

        this.geometryGroup.traverse(child => {
            if (child.isMesh) {
                switch (mode) {
                    case 'solid':
                        child.material.wireframe = false;
                        child.material.opacity = parseFloat(document.getElementById('opacity-slider').value);
                        break;
                    case 'wireframe':
                        child.material.wireframe = true;
                        child.material.opacity = 1;
                        break;
                    case 'hidden':
                        child.material.wireframe = false;
                        child.material.opacity = 0.3;
                        break;
                }
            }
        });

        // 更新按钮状态
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`btn-${mode}`)?.classList.add('active');
    }

    /**
     * 设置透明度
     */
    setOpacity(value) {
        if (!this.geometryGroup) return;

        this.geometryGroup.traverse(child => {
            if (child.isMesh && !child.material.wireframe) {
                child.material.opacity = value;
            }
        });
    }

    /**
     * 切换截面模式
     */
    toggleCrossSectionMode() {
        const isActive = this.crossSectionManager.toggleMode();
        const btn = document.getElementById('btn-cross-section-mode');
        const hint = document.getElementById('section-mode-hint');
        const container = document.getElementById('section-points-container');

        if (isActive) {
            btn.innerHTML = '<span class="svg-icon"><svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></span> 退出截面选点模式';
            btn.classList.add('active');
            hint.style.display = 'block';
            container.style.display = 'block';
        } else {
            btn.innerHTML = '<span class="svg-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/></svg></span> 进入截面选点模式';
            btn.classList.remove('active');
            hint.style.display = 'none';
            container.style.display = 'none';
        }
    }

    /**
     * 更新顶点选择器
     */
    updateVertexSelector() {
        const container = document.getElementById('vertex-selector');
        if (!container) return;

        const config = GEOMETRY_CONFIGS[this.currentGeometryType];
        if (!config) return;

        container.innerHTML = '';

        Object.keys(config.vertices).forEach(name => {
            const btn = document.createElement('button');
            btn.className = 'vertex-btn';
            btn.textContent = name;
            btn.addEventListener('click', () => {
                this.crossSectionManager.toggleVertex(name);
                btn.classList.toggle('selected');
            });
            container.appendChild(btn);
        });
    }

    /**
     * 渲染循环
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        // 更新控制器
        this.controls.update();

        // 渲染场景
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
    }

    /**
     * 窗口大小变化处理
     */
    onWindowResize() {
        const container = document.getElementById('canvas-wrapper');
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.labelRenderer.setSize(width, height);
    }

    /**
     * 隐藏加载动画
     */
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            setTimeout(() => {
                overlay.classList.add('hidden');
                setTimeout(() => overlay.remove(), 500);
            }, 500);
        }
    }

    /**
     * 显示Toast提示
     */
    showToast(message, type = 'info') {
        if (this.toastManager) {
            this.toastManager.show(message, type);
        }
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SolidGeometryApp();
});
