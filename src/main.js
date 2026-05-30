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

            // 创建名称
            const name = document.createElement('div');
            name.className = 'geometry-card-name';
            name.textContent = GEOMETRY_NAMES[type] || type;

            card.appendChild(thumbnail);
            card.appendChild(name);
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

        // 切换渲染器容器
        const containerId = tabId === 'view' ? 'canvas-wrapper' : 'canvas-wrapper-practice';
        this.rendererManager.switchContainer(containerId);

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
        if (faceCountEl) faceCountEl.textContent = config.faces ? config.faces.length : '-';
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
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SolidGeometryApp();
});
