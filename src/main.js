/**
 * 高中立体几何交互练习平台 - 主入口
 * Material You 重构版本
 */

console.log('main.js 开始加载...');

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
import { GEOMETRY_CONFIGS, GEOMETRY_NAMES } from './geometry/configs.js';

// 功能模块
import { UnfoldManager } from './features/unfold.js';
import { CrossSectionManager } from './features/crossSection.js';
import { ViewControlManager } from './features/viewControl.js';
import { PracticeManager } from './features/practice.js';
import { RecordsManager } from './features/records.js';
import { Solution3DManager } from './features/solution3D.js';
import { generateGeometryThumbnails } from './features/thumbnail.js';

// UI模块
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
        this.practiceManager = null;
        this.recordsManager = null;
        this.toastManager = null;

        // 状态
        this.currentGeometryType = 'cube';
        this.geometryGroup = null;
        this.currentTab = 'view';

        // 初始化
        this.init();

        // 安全超时：10秒后强制隐藏加载动画
        setTimeout(() => {
            const overlay = document.getElementById('loading-overlay');
            if (overlay && !overlay.classList.contains('hidden')) {
                console.warn('初始化超时，强制隐藏加载动画');
                this.hideLoading();
            }
        }, 10000);
    }

    /**
     * 初始化应用
     */
    async init() {
        try {
            console.log('开始初始化立体几何平台...');

            // 初始化核心模块
            console.log('初始化核心模块...');
            this.initCore();

            // 初始化功能模块
            console.log('初始化功能模块...');
            this.initFeatures();

            // 初始化UI模块
            console.log('初始化UI模块...');
            this.initUI();

            // 初始化几何体
            console.log('初始化几何体...');
            this.initGeometry();

            // 绑定事件
            console.log('绑定事件...');
            this.bindEvents();

            // 开始渲染循环
            console.log('开始渲染循环...');
            this.animate();

            // 隐藏加载动画
            console.log('隐藏加载动画...');
            this.hideLoading();

            console.log('立体几何平台初始化完成');
        } catch (error) {
            console.error('初始化失败:', error);
            // 尝试显示错误信息
            const loadingText = document.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = `初始化失败: ${error.message}`;
                loadingText.style.color = '#e68a8a';
            }
            // 延迟后隐藏加载动画
            setTimeout(() => this.hideLoading(), 3000);
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
        // 截面管理器
        this.crossSectionManager = new CrossSectionManager(this.scene, this.camera, this.renderer);

        // 视图控制管理器
        this.viewControlManager = new ViewControlManager(this.camera, this.controls);

        // 练习模式管理器
        this.practiceManager = new PracticeManager();

        // 做题记录管理器
        this.recordsManager = new RecordsManager();

        // 3D解析管理器
        this.solution3DManager = new Solution3DManager(this.scene, this.camera, this.renderer);
    }

    /**
     * 初始化UI模块
     */
    initUI() {
        // Toast提示
        this.toastManager = new ToastManager();

        // 初始化几何体选择器
        this.initGeometrySelector();
    }

    /**
     * 初始化几何体选择器（卡片网格）
     */
    initGeometrySelector() {
        const selector = document.getElementById('geometry-selector');
        if (!selector) return;

        // 清空现有内容
        selector.innerHTML = '';

        // 定义要显示的几何体（不全铺开）
        const displayTypes = [
            'cube', 'rectangularBox', 'triangularPrism', 'tetrahedron',
            'squarePyramid', 'hexagonalPrism', 'triangularPyramid',
            'cylinder', 'cone', 'sphere'
        ];

        // 为每个几何体创建卡片
        displayTypes.forEach(type => {
            const config = GEOMETRY_CONFIGS[type];
            if (!config) return;

            const card = document.createElement('button');
            card.className = 'geometry-card';
            card.dataset.type = type;

            // 如果是当前选中的几何体，添加active类
            if (type === this.currentGeometryType) {
                card.classList.add('active');
            }

            // 创建缩略图容器
            const thumbnail = document.createElement('div');
            thumbnail.className = 'geometry-thumbnail';
            thumbnail.id = `thumbnail-${type}`;

            // 创建信息区
            const info = document.createElement('div');
            info.className = 'geometry-card-info';

            const name = document.createElement('div');
            name.className = 'geometry-card-name';
            name.textContent = GEOMETRY_NAMES[type] || type;

            const detail = document.createElement('div');
            detail.className = 'geometry-card-detail';
            const vertexCount = config.vertices ? Object.keys(config.vertices).length : 0;
            const edgeCount = config.edges ? config.edges.length : 0;
            const faceCount = config.faces ? Object.keys(config.faces).length : 0;
            detail.textContent = `${vertexCount}顶点 · ${edgeCount}棱 · ${faceCount}面`;

            info.appendChild(name);
            info.appendChild(detail);

            // 展开图标
            const expandIcon = document.createElement('div');
            expandIcon.className = 'geometry-card-expand-icon';
            expandIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>`;

            card.appendChild(thumbnail);
            card.appendChild(info);
            card.appendChild(expandIcon);

            // 点击展开/收起
            card.addEventListener('click', (e) => {
                // 如果点击的是展开图标或已展开状态，切换展开
                if (card.classList.contains('expanded') || e.target.closest('.geometry-card-expand-icon')) {
                    card.classList.toggle('expanded');
                    // 更新展开详情
                    this.updateCardDetail(card, type, card.classList.contains('expanded'));
                } else {
                    // 选择几何体
                    this.createGeometry(type);
                }
            });

            selector.appendChild(card);
        });

        // 生成缩略图（延迟执行，确保DOM已渲染）
        setTimeout(() => {
            generateGeometryThumbnails();
        }, 100);
    }

    /**
     * 更新几何体选择器的按钮状态
     */
    updateGeometrySelectorButtons(activeType) {
        document.querySelectorAll('.geometry-card').forEach(card => {
            card.classList.toggle('active', card.dataset.type === activeType);
        });
    }

    /**
     * 更新卡片展开详情
     */
    updateCardDetail(card, type, expanded) {
        let detailEl = card.querySelector('.geometry-card-detail');
        if (!detailEl) return;

        const config = GEOMETRY_CONFIGS[type];
        if (!config) return;

        if (expanded) {
            const vertexCount = config.vertices ? Object.keys(config.vertices).length : 0;
            const edgeCount = config.edges ? config.edges.length : 0;
            const faceCount = config.faces ? Object.keys(config.faces).length : 0;
            const surfaceArea = config.type === 'curved' ? '含曲面' : `${faceCount}个平面`;
            detailEl.textContent = `${vertexCount}顶点 · ${edgeCount}棱 · ${faceCount}面 · ${surfaceArea}`;
        } else {
            const vertexCount = config.vertices ? Object.keys(config.vertices).length : 0;
            const edgeCount = config.edges ? config.edges.length : 0;
            const faceCount = config.faces ? Object.keys(config.faces).length : 0;
            detailEl.textContent = `${vertexCount}顶点 · ${edgeCount}棱 · ${faceCount}面`;
        }
    }

    /**
     * 初始化几何体
     */
    initGeometry() {
        this.geometryFactory = new GeometryFactory(this.scene, this.labelRenderer);

        // 展开管理器（依赖geometryFactory）
        this.unfoldManager = new UnfoldManager(this.scene, this.geometryFactory);

        this.createGeometry('cube');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // Tab切换
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // 几何体选择
        document.querySelectorAll('.geometry-card').forEach(card => {
            card.addEventListener('click', (e) => {
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

        // 信息卡片折叠
        document.getElementById('toggle-info-card')?.addEventListener('click', () => {
            document.getElementById('geometry-info-card').classList.toggle('collapsed');
        });

        // 练习模式
        document.getElementById('btn-start-practice')?.addEventListener('click', () => {
            this.startPractice();
        });

        // 做题记录
        document.getElementById('btn-export-records')?.addEventListener('click', () => {
            this.exportRecords();
        });
        document.getElementById('btn-import-records')?.addEventListener('click', () => {
            document.getElementById('import-file-input').click();
        });
        document.getElementById('import-file-input')?.addEventListener('change', (e) => {
            this.importRecords(e);
        });

        // Issue 12: 设置按钮
        const settingsBtn = document.getElementById('btn-settings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }

        // Issue 4: 编辑按钮
        const editBtn = document.getElementById('btn-edit');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.showEditDialog());
        }

        // Issue 6: 随机生成按钮
        const randomBtn = document.getElementById('btn-random');
        if (randomBtn) {
            randomBtn.addEventListener('click', () => this.randomGeometry());
        }

        // 窗口大小变化
        window.addEventListener('resize', () => this.onWindowResize());
    }

    /**
     * 切换Tab
     */
    switchTab(tabId) {
        // 更新Tab按钮状态
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });

        // 更新Tab内容显示
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabId}`);
        });

        this.currentTab = tabId;

        // 切换渲染器容器（只在view和practice之间切换，records不需要3D渲染器）
        if (tabId === 'view') {
            this.rendererManager.switchContainer('canvas-wrapper');
        } else if (tabId === 'practice') {
            this.rendererManager.switchContainer('canvas-wrapper-practice');
        }

        // 如果切换到记录标签，更新记录列表
        if (tabId === 'records') {
            this.updateRecordsList();
        }

        // 触发窗口大小变化以调整3D场景
        this.onWindowResize();
    }

    /**
     * 创建几何体
     */
    createGeometry(type) {
        // 移除旧几何体（递归释放资源防止残留渲染）
        if (this.geometryGroup) {
            this.disposeGroup(this.geometryGroup);
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
        this.updateGeometryInfo(type);

        // 更新顶点选择器
        this.updateVertexSelector();

        // 更新geometry-selector按钮状态
        this.updateGeometrySelectorButtons(type);

        this.showToast(`已切换到${GEOMETRY_NAMES[type] || type}`);
    }

    /**
     * 更新几何体信息卡片
     */
    updateGeometryInfo(type) {
        const config = GEOMETRY_CONFIGS[type];
        if (!config) return;

        const nameEl = document.getElementById('geometry-name');
        const vertexCountEl = document.getElementById('vertex-count');
        const edgeCountEl = document.getElementById('edge-count');
        const faceCountEl = document.getElementById('face-count');

        if (nameEl) nameEl.textContent = GEOMETRY_NAMES[type] || type;
        if (vertexCountEl) vertexCountEl.textContent = config.vertices ? Object.keys(config.vertices).length : '-';
        if (edgeCountEl) edgeCountEl.textContent = config.edges ? config.edges.length : '-';
        if (faceCountEl) faceCountEl.textContent = config.faces ? Object.keys(config.faces).length : '-';
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
        document.querySelectorAll('.display-controls .btn-group .btn').forEach(btn => btn.classList.remove('active'));
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
     * 递归释放Three.js Group内的所有资源
     */
    disposeGroup(group) {
        group.traverse(child => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
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
            btn.textContent = '退出截面选点模式';
            btn.classList.add('active');
            hint.style.display = 'block';
            container.style.display = 'block';
        } else {
            btn.textContent = '进入截面选点模式';
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
                this.crossSectionManager.toggleVertexSelection(name);
                btn.classList.toggle('selected');
            });
            container.appendChild(btn);
        });
    }

    /**
     * 开始练习
     */
    startPractice() {
        const mode = document.getElementById('practice-mode')?.value || 'current';
        const count = parseInt(document.getElementById('question-count')?.value || '5');
        const difficulty = document.getElementById('difficulty-level')?.value || 'mixed';

        // 确定几何体类型
        let geometryType = this.currentGeometryType;
        if (mode === 'random') {
            // 随机选择几何体类型
            const types = Object.keys(GEOMETRY_CONFIGS);
            geometryType = types[Math.floor(Math.random() * types.length)];
        }

        // 生成题目
        const questions = this.practiceManager.generateQuestions(geometryType, count, difficulty);

        // 更新UI
        this.updatePracticeUI(questions);

        // 开始计时
        this.practiceManager.startTimer();

        this.showToast('练习开始！', 'success');
    }

    /**
     * 更新练习模式UI
     */
    updatePracticeUI(questions) {
        const container = document.getElementById('question-container');
        if (!container) return;

        // 清空容器
        container.innerHTML = '';

        // 创建题目列表
        questions.forEach((question, index) => {
            const questionEl = document.createElement('div');
            questionEl.className = 'question-item';
            questionEl.innerHTML = `
                <div class="question-header">
                    <span class="question-number">第 ${index + 1} 题</span>
                    <span class="question-type">${this.getQuestionTypeName(question.type)}</span>
                    <span class="question-difficulty ${question.difficulty}">${this.getDifficultyName(question.difficulty)}</span>
                </div>
                <div class="question-text">${question.question}</div>
                ${question.options ? this.createOptionsHTML(question.options, index) : this.createInputHTML(index)}
                <div class="question-actions">
                    <button class="btn btn-sm btn-primary" onclick="app.submitAnswer(${index})">提交答案</button>
                    <button class="btn btn-sm btn-outline" onclick="app.showHint(${index})">查看提示</button>
                </div>
            `;
            container.appendChild(questionEl);
        });

        // 更新统计
        this.updatePracticeStats();
    }

    /**
     * 创建输入框HTML
     */
    createInputHTML(questionIndex) {
        return `
            <div class="question-input">
                <input type="text" class="input" id="answer_${questionIndex}" placeholder="请输入答案">
            </div>
        `;
    }

    /**
     * 创建选项HTML
     */
    createOptionsHTML(options, questionIndex) {
        return `
            <div class="question-options">
                ${options.map((option, index) => `
                    <label class="option-item">
                        <input type="radio" name="question_${questionIndex}" value="${index}">
                        <span class="option-text">${option}</span>
                    </label>
                `).join('')}
            </div>
        `;
    }

    /**
     * 获取题目类型名称
     */
    getQuestionTypeName(type) {
        const names = {
            'fill': '填空题',
            'choice': '选择题',
            'proof': '证明题',
            'calculation': '计算题'
        };
        return names[type] || type;
    }

    /**
     * 获取难度名称
     */
    getDifficultyName(difficulty) {
        const names = {
            'easy': '简单',
            'medium': '中等',
            'hard': '困难'
        };
        return names[difficulty] || difficulty;
    }

    /**
     * 提交答案
     */
    submitAnswer(questionIndex) {
        // 获取用户答案
        const question = this.practiceManager.questions[questionIndex];
        let userAnswer = null;

        if (question.type === 'choice') {
            const selected = document.querySelector(`input[name="question_${questionIndex}"]:checked`);
            userAnswer = selected ? selected.value : null;
        } else {
            const input = document.getElementById(`answer_${questionIndex}`);
            userAnswer = input ? input.value : null;
        }

        if (userAnswer === null || userAnswer === '') {
            this.showToast('请先输入答案', 'warning');
            return;
        }

        // 提交答案
        const result = this.practiceManager.submitAnswer(userAnswer);

        // 显示结果
        this.showAnswerResult(questionIndex, result);

        // 显示3D解析（如果在练习模式下）
        if (this.currentTab === 'practice') {
            this.show3DSolution(question, result);
        }

        // 更新统计
        this.updatePracticeStats();

        // 如果是最后一题，显示总结
        if (this.practiceManager.currentIndex >= this.practiceManager.questions.length) {
            this.showPracticeSummary();
        }
    }

    /**
     * 显示答案结果
     */
    showAnswerResult(questionIndex, result) {
        const questionEl = document.querySelectorAll('.question-item')[questionIndex];
        if (!questionEl) return;

        const resultEl = document.createElement('div');
        resultEl.className = `answer-result ${result.isCorrect ? 'correct' : 'incorrect'}`;
        resultEl.innerHTML = `
            <div class="result-header">
                ${result.isCorrect ? '✓ 回答正确' : '✗ 回答错误'}
            </div>
            <div class="result-detail">
                <p><strong>正确答案：</strong>${result.correctAnswer}</p>
                <p><strong>解析：</strong>${result.solution}</p>
            </div>
        `;

        questionEl.appendChild(resultEl);

        // 禁用输入和按钮
        const input = questionEl.querySelector('input');
        if (input) input.disabled = true;

        const buttons = questionEl.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);
    }

    /**
     * 显示提示
     */
    showHint(questionIndex) {
        const question = this.practiceManager.questions[questionIndex];
        if (question && question.hint) {
            this.showToast(question.hint, 'info');
        }
    }

    /**
     * 更新练习统计
     */
    updatePracticeStats() {
        const stats = this.practiceManager.getStats();

        const totalEl = document.getElementById('total-questions');
        const correctEl = document.getElementById('correct-count');
        const accuracyEl = document.getElementById('accuracy');

        if (totalEl) totalEl.textContent = stats.total;
        if (correctEl) correctEl.textContent = stats.correct;
        if (accuracyEl) accuracyEl.textContent = `${stats.accuracy}%`;
    }

    /**
     * 显示3D解析
     */
    show3DSolution(question, result) {
        // 切换到练习模式的3D视图
        const containerId = 'canvas-wrapper-practice';
        this.rendererManager.switchContainer(containerId);

        // 显示解析
        this.solution3DManager.showSolution(
            this.currentGeometryType,
            question,
            result.correctAnswer
        );

        this.showToast('3D解析已显示', 'info');
    }

    /**
     * 显示练习总结
     */
    showPracticeSummary() {
        const stats = this.practiceManager.getStats();
        const record = this.practiceManager.getRecord();

        // 保存记录
        this.recordsManager.addRecord(record);

        // 显示总结对话框
        const summaryHtml = `
            <div class="practice-summary">
                <h3>练习完成！</h3>
                <div class="summary-stats">
                    <p>总题数：${stats.total}</p>
                    <p>正确：${stats.correct}</p>
                    <p>正确率：${stats.accuracy}%</p>
                </div>
            </div>
        `;

        // 创建总结元素
        const summaryEl = document.createElement('div');
        summaryEl.className = 'practice-summary-overlay';
        summaryEl.innerHTML = summaryHtml;

        // 添加到页面
        document.body.appendChild(summaryEl);

        // 3秒后自动移除
        setTimeout(() => {
            summaryEl.remove();
        }, 3000);
    }

    /**
     * 导出做题记录
     */
    exportRecords() {
        const success = this.recordsManager.exportToJSON();
        if (success) {
            this.showToast('记录导出成功', 'success');
        } else {
            this.showToast('记录导出失败', 'error');
        }
    }

    /**
     * 导入做题记录
     */
    async importRecords(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const result = await this.recordsManager.importFromJSON(file);
            this.showToast(`成功导入 ${result.imported} 条记录`, 'success');
            // 更新记录列表显示
            this.updateRecordsList();
        } catch (error) {
            this.showToast(`导入失败：${error.message}`, 'error');
        }

        // 清空文件输入
        event.target.value = '';
    }

    /**
     * 更新记录列表显示
     */
    updateRecordsList() {
        const container = document.getElementById('records-list');
        if (!container) return;

        const records = this.recordsManager.getRecords();

        if (records.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M12 20V10"/>
                            <path d="M18 20V4"/>
                            <path d="M6 20v-4"/>
                        </svg>
                    </div>
                    <div class="empty-state-title">暂无记录</div>
                    <div class="empty-state-text">完成练习后会自动记录</div>
                </div>
            `;
            return;
        }

        // 创建记录列表
        container.innerHTML = records.map((record, index) => `
            <div class="record-item">
                <div class="record-header">
                    <span class="record-date">${this.formatRecordDate(record.date)}</span>
                    <span class="record-accuracy">${record.stats?.accuracy || 0}%</span>
                </div>
                <div class="record-detail">
                    <span>共 ${record.stats?.total || 0} 题</span>
                    <span>正确 ${record.stats?.correct || 0} 题</span>
                    <span>用时 ${this.formatTime(record.totalTime)}</span>
                </div>
                <button class="btn btn-sm btn-outline" onclick="app.deleteRecord(${index})">删除</button>
            </div>
        `).join('');

        // 更新统计
        this.updateRecordsStats();
    }

    /**
     * 格式化记录日期
     */
    formatRecordDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * 格式化时间
     */
    formatTime(milliseconds) {
        if (!milliseconds) return '0分钟';
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        if (minutes === 0) return `${seconds}秒`;
        return `${minutes}分${seconds}秒`;
    }

    /**
     * 删除记录
     */
    deleteRecord(index) {
        if (this.recordsManager.deleteRecord(index)) {
            this.showToast('记录已删除', 'success');
            this.updateRecordsList();
        }
    }

    /**
     * 更新记录统计
     */
    updateRecordsStats() {
        const stats = this.recordsManager.getStats();

        const totalPracticesEl = document.getElementById('total-practices');
        const avgAccuracyEl = document.getElementById('avg-accuracy');
        const totalTimeEl = document.getElementById('total-time');

        if (totalPracticesEl) totalPracticesEl.textContent = stats.totalPractices;
        if (avgAccuracyEl) avgAccuracyEl.textContent = `${stats.avgAccuracy}%`;
        if (totalTimeEl) totalTimeEl.textContent = this.formatTime(stats.totalTime);

        // 渲染正确率趋势图表
        this.renderAccuracyChart();
    }

    /**
     * 渲染正确率趋势图表
     */
    renderAccuracyChart() {
        const canvas = document.getElementById('accuracy-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const trend = this.recordsManager.getAccuracyTrend(7);

        // 设置画布大小
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;

        // 清空画布
        ctx.clearRect(0, 0, width, height);

        // 绘制背景
        ctx.fillStyle = '#fafafa';
        ctx.fillRect(0, 0, width, height);

        // 绘制标题
        ctx.fillStyle = '#333';
        ctx.font = '14px Noto Sans SC, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('近7天正确率趋势', width / 2, 20);

        if (trend.length === 0 || trend.every(t => t.accuracy === 0)) {
            // 无数据时显示提示
            ctx.fillStyle = '#999';
            ctx.font = '12px Noto Sans SC, sans-serif';
            ctx.fillText('暂无数据', width / 2, height / 2);
            return;
        }

        // 计算绘图区域
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // 绘制坐标轴
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;

        // X轴
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Y轴
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.stroke();

        // 绘制Y轴刻度（0%, 25%, 50%, 75%, 100%）
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';

        for (let i = 0; i <= 4; i++) {
            const y = height - padding - (chartHeight * i / 4);
            const label = (i * 25) + '%';
            ctx.fillText(label, padding - 5, y + 3);

            // 绘制网格线
            ctx.strokeStyle = '#eee';
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // 绘制数据点和折线
        const pointSpacing = chartWidth / (trend.length - 1);

        ctx.strokeStyle = '#1976d2';
        ctx.lineWidth = 2;
        ctx.beginPath();

        trend.forEach((point, index) => {
            const x = padding + index * pointSpacing;
            const y = height - padding - (point.accuracy / 100 * chartHeight);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // 绘制数据点
        trend.forEach((point, index) => {
            const x = padding + index * pointSpacing;
            const y = height - padding - (point.accuracy / 100 * chartHeight);

            // 绘制圆点
            ctx.fillStyle = '#1976d2';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();

            // 绘制日期标签
            ctx.fillStyle = '#666';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            const dateLabel = point.date.substring(5); // 只显示月-日
            ctx.fillText(dateLabel, x, height - padding + 15);

            // 绘制数值
            if (point.accuracy > 0) {
                ctx.fillStyle = '#333';
                ctx.font = '10px Arial';
                ctx.fillText(point.accuracy.toFixed(0) + '%', x, y - 10);
            }
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
        const containerId = this.currentTab === 'view' ? 'canvas-wrapper' : 'canvas-wrapper-practice';
        const container = document.getElementById(containerId);
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

    // ========================================
    // Issue 12: 设置功能
    // ========================================
    showSettings() {
        // 移除已有设置面板
        const existing = document.querySelector('.settings-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'settings-overlay';
        overlay.innerHTML = `
            <div class="settings-panel">
                <div class="settings-header">
                    <h3>⚙️ 设置</h3>
                    <button class="btn btn-ghost btn-icon btn-sm" id="close-settings">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="settings-body">
                    <div class="settings-group">
                        <div class="settings-group-title">显示</div>
                        <div class="settings-item">
                            <div>
                                <div class="settings-item-label">网格</div>
                                <div class="settings-item-desc">显示/隐藏地面网格</div>
                            </div>
                            <div class="switch ${this.sceneManager?.gridVisible ? 'active' : ''}" id="setting-grid"></div>
                        </div>
                        <div class="settings-item">
                            <div>
                                <div class="settings-item-label">坐标轴</div>
                                <div class="settings-item-desc">显示/隐藏XYZ坐标轴</div>
                            </div>
                            <div class="switch ${this.sceneManager?.axesVisible ? 'active' : ''}" id="setting-axes"></div>
                        </div>
                    </div>
                    <div class="settings-group">
                        <div class="settings-group-title">几何体</div>
                        <div class="settings-item">
                            <div>
                                <div class="settings-item-label">透明度</div>
                                <div class="settings-item-desc">调整面的透明程度</div>
                            </div>
                            <input type="range" class="slider" id="setting-opacity" min="0" max="1" step="0.05" value="0.6" style="width:120px">
                        </div>
                        <div class="settings-item">
                            <div>
                                <div class="settings-item-label">显示标签</div>
                                <div class="settings-item-desc">顶点名称标签</div>
                            </div>
                            <div class="switch active" id="setting-labels"></div>
                        </div>
                    </div>
                    <div class="settings-group">
                        <div class="settings-group-title">练习</div>
                        <div class="settings-item">
                            <div>
                                <div class="settings-item-label">默认题数</div>
                                <div class="settings-item-desc">每次练习的题目数量</div>
                            </div>
                            <select class="select" id="setting-default-count" style="width:80px">
                                <option value="3">3题</option>
                                <option value="5" selected>5题</option>
                                <option value="10">10题</option>
                                <option value="15">15题</option>
                            </select>
                        </div>
                    </div>
                    <div class="settings-group">
                        <div class="settings-group-title">关于</div>
                        <div class="settings-item">
                            <div>
                                <div class="settings-item-label">立体几何练习平台</div>
                                <div class="settings-item-desc">版本 1.0 · 基于 Three.js</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // 事件绑定
        overlay.querySelector('#close-settings').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

        overlay.querySelector('#setting-grid')?.addEventListener('click', (e) => {
            this.sceneManager.toggleGrid();
            e.currentTarget.classList.toggle('active');
        });
        overlay.querySelector('#setting-axes')?.addEventListener('click', (e) => {
            this.sceneManager.toggleAxes();
            e.currentTarget.classList.toggle('active');
        });
        overlay.querySelector('#setting-opacity')?.addEventListener('input', (e) => {
            this.setOpacity(parseFloat(e.target.value));
        });
        overlay.querySelector('#setting-labels')?.addEventListener('click', (e) => {
            e.currentTarget.classList.toggle('active');
            const visible = e.currentTarget.classList.contains('active');
            if (this.geometryGroup) {
                this.geometryGroup.traverse(child => {
                    if (child.isCSS2DObject || child.userData?.isLabel) {
                        child.visible = visible;
                    }
                });
            }
        });
    }

    // ========================================
    // Issue 6: 随机生成几何体
    // ========================================
    randomGeometry() {
        const types = Object.keys(GEOMETRY_CONFIGS);
        // 避免与当前类型重复
        let available = types.filter(t => t !== this.currentGeometryType);
        if (available.length === 0) available = types;
        const randomType = available[Math.floor(Math.random() * available.length)];
        this.createGeometry(randomType);
        this.showToast(`🎲 随机：${GEOMETRY_NAMES[randomType] || randomType}`, 'info');
    }

    // ========================================
    // Issue 4: 编辑功能
    // ========================================
    showEditDialog() {
        if (!this.currentGeometryType) {
            this.showToast('请先选择一个几何体', 'warning');
            return;
        }

        const config = GEOMETRY_CONFIGS[this.currentGeometryType];
        const name = GEOMETRY_NAMES[this.currentGeometryType] || this.currentGeometryType;

        const existing = document.querySelector('.settings-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'settings-overlay';
        overlay.innerHTML = `
            <div class="settings-panel">
                <div class="settings-header">
                    <h3>✏️ 编辑 · ${name}</h3>
                    <button class="btn btn-ghost btn-icon btn-sm" id="close-edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="settings-body">
                    <div class="settings-group">
                        <div class="settings-group-title">显示控制</div>
                        <div class="settings-item">
                            <div class="settings-item-label">显示面</div>
                            <div class="switch active" id="edit-faces"></div>
                        </div>
                        <div class="settings-item">
                            <div class="settings-item-label">显示边</div>
                            <div class="switch active" id="edit-edges"></div>
                        </div>
                        <div class="settings-item">
                            <div class="settings-item-label">显示顶点</div>
                            <div class="switch active" id="edit-vertices"></div>
                        </div>
                        <div class="settings-item">
                            <div class="settings-item-label">显示标签</div>
                            <div class="switch active" id="edit-labels"></div>
                        </div>
                    </div>
                    <div class="settings-group">
                        <div class="settings-group-title">颜色</div>
                        <div class="settings-item">
                            <div class="settings-item-label">面颜色</div>
                            <input type="color" id="edit-face-color" value="#6c8ebf" style="width:40px;height:30px;border:none;cursor:pointer">
                        </div>
                        <div class="settings-item">
                            <div class="settings-item-label">边颜色</div>
                            <input type="color" id="edit-edge-color" value="#dfd0b7" style="width:40px;height:30px;border:none;cursor:pointer">
                        </div>
                    </div>
                    <div class="settings-group">
                        <div class="settings-group-title">几何体信息</div>
                        <div style="font-size:13px;color:var(--md-on-surface-variant);line-height:1.8">
                            <div>顶点数：${config.vertices ? Object.keys(config.vertices).length : '-'}</div>
                            <div>棱数：${config.edges ? config.edges.length : '-'}</div>
                            <div>面数：${config.faces ? Object.keys(config.faces).length : '-'}</div>
                            <div>类型：${config.type === 'curved' ? '曲面' : '多面体'}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // 事件绑定
        overlay.querySelector('#close-edit').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

        // 显示/隐藏控制
        const toggleChild = (name, visible) => {
            if (!this.geometryGroup) return;
            this.geometryGroup.children.forEach(child => {
                if (child.name === name || (name === 'labels' && (child.isCSS2DObject || child.userData?.isLabel))) {
                    child.visible = visible;
                }
            });
        };

        overlay.querySelector('#edit-faces')?.addEventListener('click', (e) => {
            e.currentTarget.classList.toggle('active');
            toggleChild('faces', e.currentTarget.classList.contains('active'));
        });
        overlay.querySelector('#edit-edges')?.addEventListener('click', (e) => {
            e.currentTarget.classList.toggle('active');
            toggleChild('edges', e.currentTarget.classList.contains('active'));
        });
        overlay.querySelector('#edit-vertices')?.addEventListener('click', (e) => {
            e.currentTarget.classList.toggle('active');
            toggleChild('vertices', e.currentTarget.classList.contains('active'));
        });
        overlay.querySelector('#edit-labels')?.addEventListener('click', (e) => {
            e.currentTarget.classList.toggle('active');
            toggleChild('labels', e.currentTarget.classList.contains('active'));
        });

        // 颜色控制
        overlay.querySelector('#edit-face-color')?.addEventListener('input', (e) => {
            if (!this.geometryGroup) return;
            this.geometryGroup.traverse(child => {
                if (child.isMesh && !child.material.wireframe) {
                    child.material.color.set(e.target.value);
                }
            });
        });
        overlay.querySelector('#edit-edge-color')?.addEventListener('input', (e) => {
            if (!this.geometryGroup) return;
            this.geometryGroup.traverse(child => {
                if (child.isLineSegments) {
                    child.material.color.set(e.target.value);
                }
            });
        });
    }

    // ========================================
    // Issue 9: 增强提示系统
    // ========================================
    showHint(questionIndex) {
        const question = this.practiceManager.questions[questionIndex];
        if (!question) return;

        // 多级提示系统
        const hints = this.generateMultiHints(question);
        this.showHintPanel(questionIndex, hints);
    }

    generateMultiHints(question) {
        const hints = [];

        // 第一级：概念提示
        if (question.type === 'calculation') {
            hints.push({
                level: '💡 概念',
                text: question.hint || '回忆相关公式和定理'
            });
            // 第二级：思路提示
            hints.push({
                level: '🔍 思路',
                text: `本题考查${this.getQuestionTypeName(question.type)}能力，注意审题中的关键条件。`
            });
        } else if (question.type === 'choice') {
            hints.push({
                level: '💡 概念',
                text: question.hint || '仔细分析每个选项'
            });
            hints.push({
                level: '🔍 排除',
                text: '尝试排除明显错误的选项，缩小范围。'
            });
        } else if (question.type === 'proof') {
            hints.push({
                level: '💡 概念',
                text: question.hint || '明确已知条件和求证目标'
            });
            hints.push({
                level: '🔍 思路',
                text: '从已知条件出发，逐步推导到结论。常用方法：综合法、分析法、反证法。'
            });
            hints.push({
                level: '📝 格式',
                text: '证明格式：已知→求证→证明过程（每步标注理由）'
            });
        } else {
            hints.push({
                level: '💡 提示',
                text: question.hint || '仔细审题，注意关键条件'
            });
        }

        return hints;
    }

    showHintPanel(questionIndex, hints) {
        const existing = document.querySelector('.settings-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'settings-overlay';
        overlay.innerHTML = `
            <div class="settings-panel">
                <div class="settings-header">
                    <h3>💡 提示 · 第${questionIndex + 1}题</h3>
                    <button class="btn btn-ghost btn-icon btn-sm" id="close-hint">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="settings-body">
                    ${hints.map((h, i) => `
                        <div class="settings-group" style="opacity:${1 - i * 0.15}">
                            <div class="settings-group-title">${h.level}</div>
                            <div style="font-size:14px;color:var(--md-on-surface);line-height:1.8;padding:8px 0">${h.text}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.querySelector('#close-hint').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    }

    // ========================================
    // Issue 10: 证明题模板
    // ========================================
    createProofToolbar(questionIndex) {
        const symbols = [
            { label: '∵', insert: '∵ ' },
            { label: '∴', insert: '∴ ' },
            { label: '∠', insert: '∠' },
            { label: '△', insert: '△' },
            { label: '∥', insert: '∥' },
            { label: '⊥', insert: '⊥' },
            { label: '≡', insert: '≡' },
            { label: '≈', insert: '≈' },
            { label: '≠', insert: '≠' },
            { label: '≤', insert: '≤' },
            { label: '≥', insert: '≥' },
            { label: '°', insert: '°' },
            { label: 'π', insert: 'π' },
            { label: '→', insert: '→' },
            { label: '⇒', insert: '⇒' },
            { label: '∈', insert: '∈' },
            { label: '⊂', insert: '⊂' },
            { label: '∪', insert: '∪' },
            { label: '∩', insert: '∩' },
            { label: '▱', insert: '▱' },
            { label: '⊙', insert: '⊙' },
            { label: '全等', insert: '≅' },
            { label: '相似', insert: '∽' },
            { label: '根号', insert: '√' },
            { label: '平方', insert: '²' },
            { label: '已知', insert: '已知：' },
            { label: '求证', insert: '求证：' },
            { label: '证明', insert: '证明：' },
        ];

        return `
            <div class="proof-toolbar">
                ${symbols.map(s => `<button class="proof-symbol-btn" data-insert="${s.insert}" data-target="proof-${questionIndex}">${s.label}</button>`).join('')}
            </div>
            <textarea class="proof-textarea" id="proof-${questionIndex}" placeholder="在此书写证明过程...&#10;&#10;提示：点击上方符号可快速插入数学符号"></textarea>
        `;
    }

    bindProofToolbarEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('proof-symbol-btn')) {
                const insert = e.target.dataset.insert;
                const targetId = e.target.dataset.target;
                const textarea = document.getElementById(targetId);
                if (textarea) {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const text = textarea.value;
                    textarea.value = text.substring(0, start) + insert + text.substring(end);
                    textarea.selectionStart = textarea.selectionEnd = start + insert.length;
                    textarea.focus();
                }
            }
        });
    }

    // ========================================
    // Issue 11: Fisher-Yates 洗牌算法
    // ========================================
    fisherYatesShuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // ========================================
    // Issue 2: 练习模式改进
    // ========================================
    startPractice() {
        const mode = document.getElementById('practice-mode')?.value || 'current';
        const count = parseInt(document.getElementById('question-count')?.value || '5');
        const difficulty = document.getElementById('difficulty-level')?.value || 'mixed';

        // 确定几何体类型
        let geometryType = this.currentGeometryType;
        if (mode === 'random') {
            const types = Object.keys(GEOMETRY_CONFIGS);
            geometryType = types[Math.floor(Math.random() * types.length)];
        }

        // 生成题目（使用 Fisher-Yates 洗牌）
        const questions = this.practiceManager.generateQuestions(geometryType, count, difficulty);
        const shuffled = this.fisherYatesShuffle(questions);
        this.practiceManager.questions = shuffled;

        // 收起左侧面板，全宽显示题目
        const practiceTab = document.getElementById('tab-practice');
        if (practiceTab) practiceTab.classList.add('practice-active');

        // 更新UI
        this.updatePracticeUI(shuffled);

        // 开始计时
        this.practiceManager.startTimer();

        this.showToast('📝 练习开始！', 'success');
    }

    // ========================================
    // 更新练习UI（支持证明题模板）
    // ========================================
    updatePracticeUI(questions) {
        const container = document.getElementById('question-container');
        if (!container) return;

        container.innerHTML = '';

        questions.forEach((question, index) => {
            const questionEl = document.createElement('div');
            questionEl.className = 'question-item';

            let answerHTML;
            if (question.options) {
                answerHTML = this.createOptionsHTML(question.options, index);
            } else if (question.type === 'proof') {
                answerHTML = this.createProofToolbar(index);
            } else {
                answerHTML = this.createInputHTML(index);
            }

            questionEl.innerHTML = `
                <div class="question-header">
                    <span class="question-number">第 ${index + 1} 题</span>
                    <span class="question-type">${this.getQuestionTypeName(question.type)}</span>
                    <span class="question-difficulty ${question.difficulty}">${this.getDifficultyName(question.difficulty)}</span>
                </div>
                <div class="question-text">${question.question}</div>
                ${answerHTML}
                <div class="question-actions">
                    <button class="btn btn-sm btn-primary" onclick="app.submitAnswer(${index})">提交答案</button>
                    <button class="btn btn-sm btn-outline" onclick="app.showHint(${index})">💡 提示</button>
                </div>
            `;
            container.appendChild(questionEl);
        });

        this.bindProofToolbarEvents();
        this.updatePracticeStats();
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SolidGeometryApp();
});
