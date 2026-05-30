// ========================
// 工具栏管理器
// ========================

export class ToolbarManager {
    constructor() {
        this.elements = {};
        this.callbacks = {};

        this.init();
    }

    // ========================
    // 初始化
    // ========================
    init() {
        this.cacheElements();
        this.bindEvents();
    }

    // ========================
    // 缓存DOM元素
    // ========================
    cacheElements() {
        this.elements = {
            geometrySelect: document.getElementById('geometrySelect'),
            sizeSlider: document.getElementById('sizeSlider'),
            sizeValue: document.getElementById('sizeValue'),
            toggleFaces: document.getElementById('toggleFaces'),
            toggleEdges: document.getElementById('toggleEdges'),
            toggleVertices: document.getElementById('toggleVertices'),
            toggleLabels: document.getElementById('toggleLabels'),
            setViewDefault: document.getElementById('setViewDefault'),
            setViewFront: document.getElementById('setViewFront'),
            setViewSide: document.getElementById('setViewSide'),
            setViewPerspective: document.getElementById('setViewPerspective'),
            toggleSectionMode: document.getElementById('toggleSectionMode'),
            clearSectionPoints: document.getElementById('clearSectionPoints'),
            createSection: document.getElementById('createSection'),
            createFaceSection: document.getElementById('createFaceSection'),
            toggleAnimate: document.getElementById('toggleAnimate'),
            restartAnimate: document.getElementById('restartAnimate'),
            resetAll: document.getElementById('resetAll'),
            viewButtons: document.querySelectorAll('.view-btn')
        };
    }

    // ========================
    // 绑定事件
    // ========================
    bindEvents() {
        // 几何体选择
        if (this.elements.geometrySelect) {
            this.elements.geometrySelect.addEventListener('change', (e) => {
                this.trigger('geometryChange', e.target.value);
            });
        }

        // 尺寸滑块
        if (this.elements.sizeSlider) {
            this.elements.sizeSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                if (this.elements.sizeValue) {
                    this.elements.sizeValue.textContent = value.toFixed(1);
                }
                this.trigger('sizeChange', value);
            });
        }

        // 可见性切换
        if (this.elements.toggleFaces) {
            this.elements.toggleFaces.addEventListener('click', () => {
                this.trigger('toggleFaces');
            });
        }

        if (this.elements.toggleEdges) {
            this.elements.toggleEdges.addEventListener('click', () => {
                this.trigger('toggleEdges');
            });
        }

        if (this.elements.toggleVertices) {
            this.elements.toggleVertices.addEventListener('click', () => {
                this.trigger('toggleVertices');
            });
        }

        if (this.elements.toggleLabels) {
            this.elements.toggleLabels.addEventListener('click', () => {
                this.trigger('toggleLabels');
            });
        }

        // 视图按钮
        this.elements.viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.trigger('viewChange', view);
            });
        });

        // 截面功能
        if (this.elements.toggleSectionMode) {
            this.elements.toggleSectionMode.addEventListener('click', () => {
                this.trigger('toggleSectionMode');
            });
        }

        if (this.elements.clearSectionPoints) {
            this.elements.clearSectionPoints.addEventListener('click', () => {
                this.trigger('clearSectionPoints');
            });
        }

        if (this.elements.createSection) {
            this.elements.createSection.addEventListener('click', () => {
                this.trigger('createSection');
            });
        }

        if (this.elements.createFaceSection) {
            this.elements.createFaceSection.addEventListener('click', () => {
                this.trigger('createFaceSection');
            });
        }

        // 展开动画
        if (this.elements.toggleAnimate) {
            this.elements.toggleAnimate.addEventListener('click', () => {
                this.trigger('toggleAnimate');
            });
        }

        if (this.elements.restartAnimate) {
            this.elements.restartAnimate.addEventListener('click', () => {
                this.trigger('restartAnimate');
            });
        }

        // 重置
        if (this.elements.resetAll) {
            this.elements.resetAll.addEventListener('click', () => {
                this.trigger('resetAll');
            });
        }
    }

    // ========================
    // 事件监听
    // ========================
    on(event, callback) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
    }

    // ========================
    // 触发事件
    // ========================
    trigger(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(cb => cb(data));
        }
    }

    // ========================
    // 更新展开按钮状态
    // ========================
    updateAnimateButton(isPlaying) {
        if (this.elements.toggleAnimate) {
            this.elements.toggleAnimate.textContent = isPlaying ? '⏸️ 暂停' : '▶️ 播放';
        }
    }

    // ========================
    // 更新截面模式按钮状态
    // ========================
    updateSectionModeButton(isActive) {
        if (this.elements.toggleSectionMode) {
            this.elements.toggleSectionMode.classList.toggle('active', isActive);
        }
    }

    // ========================
    // 更新可见性按钮状态
    // ========================
    updateToggleButtonState(buttonId, isActive) {
        const btn = this.elements[buttonId];
        if (btn) {
            btn.classList.toggle('active', isActive);
        }
    }

    // ========================
    // 设置几何体选择器的值
    // ========================
    setGeometryValue(value) {
        if (this.elements.geometrySelect) {
            this.elements.geometrySelect.value = value;
        }
    }

    // ========================
    // 设置尺寸滑块
    // ========================
    setSizeSlider(value, min = 0.5, max = 3, step = 0.1) {
        if (this.elements.sizeSlider) {
            this.elements.sizeSlider.min = min;
            this.elements.sizeSlider.max = max;
            this.elements.sizeSlider.step = step;
            this.elements.sizeSlider.value = value;
        }
        if (this.elements.sizeValue) {
            this.elements.sizeValue.textContent = value.toFixed(1);
        }
    }

    // ========================
    // 获取当前几何体
    // ========================
    getCurrentGeometry() {
        return this.elements.geometrySelect
            ? this.elements.geometrySelect.value
            : 'cube';
    }

    // ========================
    // 获取当前尺寸
    // ========================
    getCurrentSize() {
        return this.elements.sizeSlider
            ? parseFloat(this.elements.sizeSlider.value)
            : 2;
    }
}
