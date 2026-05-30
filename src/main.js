/**
 * 高中立体几何交互练习平台 - 主入口
 * Material You 重构版本
 */

import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

import { SceneManager } from './core/scene.js';
import { CameraManager } from './core/camera.js';
import { RendererManager } from './core/renderer.js';
import { GeometryFactory } from './geometry/factory.js';
import { GEOMETRY_CONFIGS, GEOMETRY_NAMES } from './geometry/configs.js';
import { UnfoldManager } from './features/unfold.js';
import { CrossSectionManager } from './features/crossSection.js';
import { ViewControlManager } from './features/viewControl.js';
import { PracticeManager } from './features/practice.js';
import { QuestionBank, HintManager, KNOWLEDGE_POINTS } from './features/questionBank.js';
import { RecordsManager } from './features/records.js';
import { Solution3DManager } from './features/solution3D.js';
import { ChartsManager } from './features/charts.js';
import { ExportImportManager } from './features/exportImport.js';
import { PracticeStatsManager } from './features/practiceStats.js';
import { PracticeModesManager } from './features/practiceModes.js';
import { FullscreenPracticeManager } from './features/fullscreenPractice.js';
import { generateGeometryThumbnails } from './features/thumbnail.js';
import { ToastManager } from './ui/toast.js';
import { SettingsManager } from './ui/settings.js';
import { ThemeManager } from './ui/themes.js';
import { ResponsiveManager } from './ui/responsive.js';
import { KeyboardManager } from './ui/keyboard.js';
import { TouchManager } from './ui/touch.js';
import { PerformanceManager } from './utils/performance.js';
import { ErrorHandler } from './utils/errorHandler.js';

class SolidGeometryApp {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.labelRenderer = null;
    this.controls = null;
    this.sceneManager = null;
    this.cameraManager = null;
    this.rendererManager = null;
    this.geometryFactory = null;
    this.unfoldManager = null;
    this.crossSectionManager = null;
    this.viewControlManager = null;
    this.practiceManager = null;
    this.questionBank = null;
    this.hintManager = null;
    this.recordsManager = null;
    this.solution3DManager = null;
    this.chartsManager = null;
    this.exportImportManager = null;
    this.practiceStatsManager = null;
    this.practiceModesManager = null;
    this.fullscreenPracticeManager = null;
    this.toastManager = null;
    this.settingsManager = null;
    this.themeManager = null;
    this.responsiveManager = null;
    this.keyboardManager = null;
    this.touchManager = null;
    this.performanceManager = null;
    this.errorHandler = null;
    this.currentGeometryType = 'cube';
    this.geometryGroup = null;
    this.currentTab = 'view';
    this.init();
    setTimeout(() => {
      const overlay = document.getElementById('loading-overlay');
      if (overlay && !overlay.classList.contains('hidden')) {
        this.hideLoading();
      }
    }, 10000);
  }

  async init() {
    try {
      this.errorHandler = new ErrorHandler();
      this.performanceManager = new PerformanceManager();
      this.initCore();
      this.initFeatures();
      this.initUI();
      this.initGeometry();
      this.bindEvents();
      this.animate();
      this.hideLoading();
      this.performanceManager.startMonitoring();
    } catch (error) {
      console.error('初始化失败:', error);
      const loadingText = document.querySelector('.loading-text');
      if (loadingText) {
        loadingText.textContent = `初始化失败: ${error.message}`;
        loadingText.style.color = '#e68a8a';
      }
      setTimeout(() => this.hideLoading(), 3000);
    }
  }

  initCore() {
    this.sceneManager = new SceneManager();
    this.scene = this.sceneManager.getScene();
    this.cameraManager = new CameraManager();
    this.camera = this.cameraManager.getCamera();
    this.rendererManager = new RendererManager();
    this.renderer = this.rendererManager.getRenderer();
    this.labelRenderer = this.rendererManager.getLabelRenderer();
  }

  initFeatures() {
    this.crossSectionManager = new CrossSectionManager(this.scene, this.camera, this.renderer);
    this.crossSectionManager.onModeChange = (isActive) => {
      this.updateStatusBar(isActive ? '截面模式：点击顶点选择截面点' : '就绪');
    };
    this.crossSectionManager.onVertexSelect = (vertexData) => {
      this.showToast(`已选择点 ${vertexData.index + 1}`, 'success');
    };
    this.viewControlManager = new ViewControlManager(this.camera, this.renderer);
    this.controls = this.viewControlManager.controls;
    this.practiceManager = new PracticeManager(this);
    this.questionBank = new QuestionBank();
    this.hintManager = new HintManager();
    this.recordsManager = new RecordsManager();
    this.solution3DManager = new Solution3DManager(this.scene, this.camera, this.renderer);
    this.chartsManager = new ChartsManager();
    this.exportImportManager = new ExportImportManager();
    this.practiceStatsManager = new PracticeStatsManager();
    this.practiceModesManager = new PracticeModesManager();
    this.fullscreenPracticeManager = new FullscreenPracticeManager();
  }

  initUI() {
    this.toastManager = new ToastManager();
    this.settingsManager = new SettingsManager();
    this.themeManager = new ThemeManager();
    this.themeManager.init();
    this.responsiveManager = new ResponsiveManager();
    this.keyboardManager = new KeyboardManager();
    this.touchManager = new TouchManager();
    this.initGeometrySelector();
  }

  initGeometrySelector() {
    const selector = document.getElementById('geometry-selector');
    if (!selector) return;
    selector.innerHTML = '';
    const displayTypes = [
      'cube', 'rectangularBox', 'triangularPrism', 'tetrahedron',
      'squarePyramid', 'hexagonalPrism', 'triangularPyramid',
      'cylinder', 'cone', 'sphere'
    ];
    displayTypes.forEach(type => {
      const config = GEOMETRY_CONFIGS[type];
      if (!config) return;
      const card = document.createElement('button');
      card.className = 'geometry-card';
      card.dataset.type = type;
      if (type === this.currentGeometryType) card.classList.add('active');
      const thumbnail = document.createElement('div');
      thumbnail.className = 'geometry-thumbnail';
      thumbnail.id = `thumbnail-${type}`;
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
      const expandIcon = document.createElement('div');
      expandIcon.className = 'geometry-card-expand-icon';
      expandIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>`;
      card.appendChild(thumbnail);
      card.appendChild(info);
      card.appendChild(expandIcon);
      card.addEventListener('click', (e) => {
        if (card.classList.contains('expanded') || e.target.closest('.geometry-card-expand-icon')) {
          card.classList.toggle('expanded');
          this.updateCardDetail(card, type, card.classList.contains('expanded'));
        } else {
          this.createGeometry(type);
        }
      });
      selector.appendChild(card);
    });
    setTimeout(() => generateGeometryThumbnails(), 100);
  }

  updateGeometrySelectorButtons(activeType) {
    document.querySelectorAll('.geometry-card').forEach(card => {
      card.classList.toggle('active', card.dataset.type === activeType);
    });
  }

  updateCardDetail(card, type, expanded) {
    let detailEl = card.querySelector('.geometry-card-detail');
    if (!detailEl) return;
    const config = GEOMETRY_CONFIGS[type];
    if (!config) return;
    const vertexCount = config.vertices ? Object.keys(config.vertices).length : 0;
    const edgeCount = config.edges ? config.edges.length : 0;
    const faceCount = config.faces ? Object.keys(config.faces).length : 0;
    if (expanded) {
      const surfaceArea = config.type === 'curved' ? '含曲面' : `${faceCount}个平面`;
      detailEl.textContent = `${vertexCount}顶点 · ${edgeCount}棱 · ${faceCount}面 · ${surfaceArea}`;
    } else {
      detailEl.textContent = `${vertexCount}顶点 · ${edgeCount}棱 · ${faceCount}面`;
    }
  }

  initGeometry() {
    this.geometryFactory = new GeometryFactory(this.scene, this.labelRenderer);
    this.unfoldManager = new UnfoldManager(this.scene, this.geometryFactory);
    // 更新相机宽高比为容器实际尺寸
    this.onWindowResize();
    this.createGeometry('cube');
  }

  bindEvents() {
    // Tab切换
    document.querySelectorAll('.tab-item').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabId = e.currentTarget.dataset.tab;
        this.switchTab(tabId);
      });
    });

    // 视图控制
    document.getElementById('btn-front')?.addEventListener('click', () => this.viewControlManager.setView('front'));
    document.getElementById('btn-side')?.addEventListener('click', () => this.viewControlManager.setView('right'));
    document.getElementById('btn-perspective')?.addEventListener('click', () => this.viewControlManager.setView('default'));

    // 显示模式
    document.getElementById('btn-solid')?.addEventListener('click', () => this.setDisplayMode('solid'));
    document.getElementById('btn-wireframe')?.addEventListener('click', () => this.setDisplayMode('wireframe'));
    document.getElementById('btn-hidden-edges')?.addEventListener('click', () => this.setDisplayMode('hidden'));

    // 透明度
    document.getElementById('opacity-slider')?.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      this.setOpacity(value);
      const el = document.getElementById('opacity-value');
      if (el) el.textContent = value.toFixed(2);
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
    document.getElementById('btn-unfold')?.addEventListener('click', () => this.unfoldManager.animate(1));
    document.getElementById('btn-fold')?.addEventListener('click', () => this.unfoldManager.animate(0));
    document.getElementById('unfold-slider')?.addEventListener('input', (e) => {
      const progress = parseInt(e.target.value) / 100;
      this.unfoldManager.setProgress(progress);
      const el = document.getElementById('unfold-value');
      if (el) el.textContent = `${e.target.value}%`;
    });

    // 截面工具
    document.getElementById('btn-cross-section-mode')?.addEventListener('click', () => this.toggleCrossSectionMode());
    document.getElementById('btn-create-section')?.addEventListener('click', () => this.crossSectionManager.createSection());
    document.getElementById('btn-clear-section')?.addEventListener('click', () => this.crossSectionManager.clearSection());

    // 信息卡片折叠
    document.getElementById('toggle-info-card')?.addEventListener('click', () => {
      document.getElementById('geometry-info-card')?.classList.toggle('collapsed');
    });

    // 练习模式
    document.getElementById('btn-start-practice')?.addEventListener('click', () => this.startPractice());
    document.getElementById('btn-random-question')?.addEventListener('click', () => this.randomQuestion());

    // 做题记录
    document.getElementById('btn-export-records')?.addEventListener('click', () => this.exportRecords());
    document.getElementById('btn-import-records')?.addEventListener('click', () => document.getElementById('import-file-input')?.click());
    document.getElementById('import-file-input')?.addEventListener('change', (e) => this.importRecords(e));

    // 设置按钮
    document.getElementById('btn-settings')?.addEventListener('click', () => this.showSettings());

    // 编辑按钮
    document.getElementById('btn-edit')?.addEventListener('click', () => this.showEditDialog());

    // 随机生成按钮
    document.getElementById('btn-random')?.addEventListener('click', () => this.randomGeometry());

    // 窗口大小变化
    window.addEventListener('resize', () => this.onWindowResize());
  }

  switchTab(tabId) {
    document.querySelectorAll('.tab-item').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `tab-${tabId}`);
    });
    this.currentTab = tabId;
    if (tabId === 'view') {
      this.rendererManager.switchContainer('canvas-wrapper');
    } else if (tabId === 'practice') {
      this.rendererManager.switchContainer('canvas-wrapper-practice');
    }
    if (tabId === 'records') {
      this.updateRecordsList();
    }
    this.onWindowResize();
  }

  createGeometry(type) {
    if (this.geometryGroup) {
      this.disposeGroup(this.geometryGroup);
      this.scene.remove(this.geometryGroup);
    }
    this.unfoldManager.clear();
    const config = GEOMETRY_CONFIGS[type];
    if (!config) return;
    this.geometryGroup = this.geometryFactory.createGeometry(config, { showFaces: true, showEdges: true, showVertices: true, showLabels: true });
    this.scene.add(this.geometryGroup);
    this.currentGeometryType = type;
    if (config.unfoldConfig) {
      this.unfoldManager.createUnfoldGroup(config, this.geometryFactory.currentVertices);
    }
    const faceMeshes = [];
    this.geometryGroup.traverse(child => {
      if (child.isMesh && child.name.startsWith('face_')) {
        faceMeshes.push(child);
      }
    });
    this.crossSectionManager.setFaceMeshes(faceMeshes);
    this.updateGeometryInfo(type);
    this.updateVertexSelector();
    this.updateGeometrySelectorButtons(type);
    this.showToast(`已切换到${GEOMETRY_NAMES[type] || type}`);
  }

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

  setDisplayMode(mode) {
    if (!this.geometryGroup) return;
    this.geometryGroup.traverse(child => {
      if (child.isMesh) {
        switch (mode) {
          case 'solid':
            child.material.wireframe = false;
            child.material.opacity = parseFloat(document.getElementById('opacity-slider')?.value || 0.5);
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
    document.querySelectorAll('.control-group .btn-group .btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${mode}`)?.classList.add('active');
  }

  setOpacity(value) {
    if (!this.geometryGroup) return;
    this.geometryGroup.traverse(child => {
      if (child.isMesh && !child.material.wireframe) {
        child.material.opacity = value;
      }
    });
  }

  disposeGroup(group) {
    group.traverse(child => {
      // 清理 CSS2DObject 的 DOM 元素（顶点标签）
      if (child.isCSS2DObject && child.element && child.element.parentNode) {
        child.element.parentNode.removeChild(child.element);
      }
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }

  toggleCrossSectionMode() {
    const isActive = this.crossSectionManager.toggleMode();
    const btn = document.getElementById('btn-cross-section-mode');
    const hint = document.getElementById('section-mode-hint');
    const container = document.getElementById('section-points-container');
    if (isActive) {
      btn.textContent = '退出截面选点模式';
      btn.classList.add('active');
      if (hint) hint.style.display = 'block';
      if (container) container.style.display = 'block';
      this._bindCrossSectionEvents();
      this.controls.enabled = false;
    } else {
      btn.textContent = '进入截面选点模式';
      btn.classList.remove('active');
      if (hint) hint.style.display = 'none';
      if (container) container.style.display = 'none';
      this._unbindCrossSectionEvents();
      this.controls.enabled = true;
    }
  }

  _bindCrossSectionEvents() {
    if (this._crossClickBound) return;
    const canvas = this.renderer.domElement;
    this._crossClickBound = (e) => {
      if (!this.crossSectionManager.isActive) return;
      this.crossSectionManager.handleClick(e);
    };
    this._crossMoveBound = (e) => {
      if (!this.crossSectionManager.isActive) return;
      this.crossSectionManager.updatePreviewPoint(e);
    };
    canvas.addEventListener('click', this._crossClickBound);
    canvas.addEventListener('mousemove', this._crossMoveBound);
  }

  _unbindCrossSectionEvents() {
    if (!this._crossClickBound) return;
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('click', this._crossClickBound);
    canvas.removeEventListener('mousemove', this._crossMoveBound);
    this._crossClickBound = null;
    this._crossMoveBound = null;
  }

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

  createInputHTML(questionIndex) {
    return `<div class="question-input"><input type="text" class="input" id="answer_${questionIndex}" placeholder="请输入答案"></div>`;
  }

  createOptionsHTML(options, questionIndex) {
    return `<div class="question-options">${options.map((option, index) => `<label class="option-item"><input type="radio" name="question_${questionIndex}" value="${index}"><span class="option-text">${option}</span></label>`).join('')}</div>`;
  }

  getQuestionTypeName(type) {
    return { fill: '填空题', choice: '选择题', proof: '证明题', calculation: '计算题' }[type] || type;
  }

  getDifficultyName(difficulty) {
    return { easy: '简单', medium: '中等', hard: '困难' }[difficulty] || difficulty;
  }

  submitAnswer(questionIndex) {
    // 兼容旧调用，重定向到新方法
    this.submitCurrentAnswer();
  }

  showAnswerResult(questionIndex, result) {
    // 兼容旧调用，重定向到新方法
    this.showAnswerFeedback(result);
  }

  updatePracticeStats() {
    const stats = this.practiceManager.getStats();
    const totalEl = document.getElementById('total-questions');
    const correctEl = document.getElementById('correct-count');
    const accuracyEl = document.getElementById('accuracy');
    if (totalEl) totalEl.textContent = stats.total;
    if (correctEl) correctEl.textContent = stats.correct;
    if (accuracyEl) accuracyEl.textContent = `${stats.accuracy}%`;
  }

  show3DSolution(question, result) {
    const containerId = 'canvas-wrapper-practice';
    this.rendererManager.switchContainer(containerId);
    this.solution3DManager.showSolution(this.currentGeometryType, question, result.correctAnswer);
    this.showToast('3D解析已显示', 'info');
  }

  exportRecords() {
    const success = this.recordsManager.exportToJSON();
    this.showToast(success ? '记录导出成功' : '记录导出失败', success ? 'success' : 'error');
  }

  async importRecords(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const result = await this.recordsManager.importFromJSON(file);
      this.showToast(`成功导入 ${result.imported} 条记录`, 'success');
      this.updateRecordsList();
    } catch (error) {
      this.showToast(`导入失败：${error.message}`, 'error');
    }
    event.target.value = '';
  }

  updateRecordsList() {
    const container = document.getElementById('records-list');
    if (!container) return;
    const records = this.recordsManager.getRecords();
    if (records.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>
            </svg>
          </div>
          <div class="empty-state-title">暂无记录</div>
          <div class="empty-state-text">完成练习后会自动记录</div>
        </div>
      `;
      return;
    }
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
    this.updateRecordsStats();
  }

  formatRecordDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  formatTime(milliseconds) {
    if (!milliseconds) return '0分钟';
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    if (minutes === 0) return `${seconds}秒`;
    return `${minutes}分${seconds}秒`;
  }

  deleteRecord(index) {
    if (this.recordsManager.deleteRecord(index)) {
      this.showToast('记录已删除', 'success');
      this.updateRecordsList();
    }
  }

  updateRecordsStats() {
    const stats = this.recordsManager.getStats();
    const totalPracticesEl = document.getElementById('total-practices');
    const avgAccuracyEl = document.getElementById('avg-accuracy');
    const totalTimeEl = document.getElementById('total-time');
    if (totalPracticesEl) totalPracticesEl.textContent = stats.totalPractices;
    if (avgAccuracyEl) avgAccuracyEl.textContent = `${stats.avgAccuracy}%`;
    if (totalTimeEl) totalTimeEl.textContent = this.formatTime(stats.totalTime);
    this.renderAccuracyChart();
  }

  renderAccuracyChart() {
    const canvas = document.getElementById('accuracy-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const trend = this.recordsManager.getAccuracyTrend(7);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#333';
    ctx.font = '14px Noto Sans SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('近7天正确率趋势', width / 2, 20);
    if (trend.length === 0 || trend.every(t => t.accuracy === 0)) {
      ctx.fillStyle = '#999';
      ctx.font = '12px Noto Sans SC, sans-serif';
      ctx.fillText('暂无数据', width / 2, height / 2);
      return;
    }
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = height - padding - (chartHeight * i / 4);
      ctx.fillText((i * 25) + '%', padding - 5, y + 3);
      ctx.strokeStyle = '#eee';
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    const pointSpacing = chartWidth / (trend.length - 1);
    ctx.strokeStyle = '#1976d2';
    ctx.lineWidth = 2;
    ctx.beginPath();
    trend.forEach((point, index) => {
      const x = padding + index * pointSpacing;
      const y = height - padding - (point.accuracy / 100 * chartHeight);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    trend.forEach((point, index) => {
      const x = padding + index * pointSpacing;
      const y = height - padding - (point.accuracy / 100 * chartHeight);
      ctx.fillStyle = '#1976d2';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(point.date.substring(5), x, height - padding + 15);
      if (point.accuracy > 0) {
        ctx.fillStyle = '#333';
        ctx.fillText(point.accuracy.toFixed(0) + '%', x, y - 10);
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }

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

  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      setTimeout(() => {
        overlay.classList.add('hidden');
        setTimeout(() => overlay.remove(), 500);
      }, 500);
    }
  }

  showToast(message, type = 'info') {
    if (this.toastManager) this.toastManager.show(message, type);
  }

  updateStatusBar(text) {
    const el = document.getElementById('status-text');
    if (el) el.textContent = text;
  }

  // ==================== 设置功能 ====================
  showSettings() {
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
              <div><div class="settings-item-label">网格</div><div class="settings-item-desc">显示/隐藏地面网格</div></div>
              <div class="switch ${this.sceneManager?.gridVisible ? 'active' : ''}" id="setting-grid"></div>
            </div>
            <div class="settings-item">
              <div><div class="settings-item-label">坐标轴</div><div class="settings-item-desc">显示/隐藏XYZ坐标轴</div></div>
              <div class="switch ${this.sceneManager?.axesVisible ? 'active' : ''}" id="setting-axes"></div>
            </div>
          </div>
          <div class="settings-group">
            <div class="settings-group-title">几何体</div>
            <div class="settings-item">
              <div><div class="settings-item-label">透明度</div><div class="settings-item-desc">调整面的透明程度</div></div>
              <input type="range" class="slider" id="setting-opacity" min="0" max="1" step="0.05" value="0.6" style="width:120px">
            </div>
            <div class="settings-item">
              <div><div class="settings-item-label">显示标签</div><div class="settings-item-desc">顶点名称标签</div></div>
              <div class="switch active" id="setting-labels"></div>
            </div>
          </div>
          <div class="settings-group">
            <div class="settings-group-title">练习</div>
            <div class="settings-item">
              <div><div class="settings-item-label">默认题数</div><div class="settings-item-desc">每次练习的题目数量</div></div>
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
              <div><div class="settings-item-label">立体几何练习平台</div><div class="settings-item-desc">版本 1.0 · 基于 Three.js</div></div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
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
          if (child.isCSS2DObject || child.userData?.isLabel) child.visible = visible;
        });
      }
    });
  }

  // ==================== 随机生成几何体 ====================
  randomGeometry() {
    const types = Object.keys(GEOMETRY_CONFIGS);
    let available = types.filter(t => t !== this.currentGeometryType);
    if (available.length === 0) available = types;
    const randomType = available[Math.floor(Math.random() * available.length)];
    this.createGeometry(randomType);
    this.showToast(`🎲 随机：${GEOMETRY_NAMES[randomType] || randomType}`, 'info');
  }

  // ==================== 编辑功能 ====================
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
            <div class="settings-item"><div class="settings-item-label">显示面</div><div class="switch active" id="edit-faces"></div></div>
            <div class="settings-item"><div class="settings-item-label">显示边</div><div class="switch active" id="edit-edges"></div></div>
            <div class="settings-item"><div class="settings-item-label">显示顶点</div><div class="switch active" id="edit-vertices"></div></div>
            <div class="settings-item"><div class="settings-item-label">显示标签</div><div class="switch active" id="edit-labels"></div></div>
          </div>
          <div class="settings-group">
            <div class="settings-group-title">颜色</div>
            <div class="settings-item"><div class="settings-item-label">面颜色</div><input type="color" id="edit-face-color" value="#6c8ebf" style="width:40px;height:30px;border:none;cursor:pointer"></div>
            <div class="settings-item"><div class="settings-item-label">边颜色</div><input type="color" id="edit-edge-color" value="#dfd0b7" style="width:40px;height:30px;border:none;cursor:pointer"></div>
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
    overlay.querySelector('#close-edit').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
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
    overlay.querySelector('#edit-face-color')?.addEventListener('input', (e) => {
      if (!this.geometryGroup) return;
      this.geometryGroup.traverse(child => {
        if (child.isMesh && !child.material.wireframe) child.material.color.set(e.target.value);
      });
    });
    overlay.querySelector('#edit-edge-color')?.addEventListener('input', (e) => {
      if (!this.geometryGroup) return;
      this.geometryGroup.traverse(child => {
        if (child.isLineSegments) child.material.color.set(e.target.value);
      });
    });
  }

  // ==================== 多级提示系统 ====================
  showHint(questionIndex) {
    const question = this.practiceManager.questions[questionIndex];
    if (!question) return;
    const hints = this.generateMultiHints(question);
    this.showHintPanel(questionIndex, hints);
  }

  generateMultiHints(question) {
    const hints = [];
    if (question.type === 'calculation') {
      hints.push({ level: '💡 概念', text: question.hint || '回忆相关公式和定理' });
      hints.push({ level: '🔍 思路', text: `本题考查${this.getQuestionTypeName(question.type)}能力，注意审题中的关键条件。` });
    } else if (question.type === 'choice') {
      hints.push({ level: '💡 概念', text: question.hint || '仔细分析每个选项' });
      hints.push({ level: '🔍 排除', text: '尝试排除明显错误的选项，缩小范围。' });
    } else if (question.type === 'proof') {
      hints.push({ level: '💡 概念', text: question.hint || '明确已知条件和求证目标' });
      hints.push({ level: '🔍 思路', text: '从已知条件出发，逐步推导到结论。常用方法：综合法、分析法、反证法。' });
      hints.push({ level: '📝 格式', text: '证明格式：已知→求证→证明过程（每步标注理由）' });
    } else {
      hints.push({ level: '💡 提示', text: question.hint || '仔细审题，注意关键条件' });
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

  // ==================== 证明题模板 ====================
  createProofToolbar(questionIndex) {
    const symbols = [
      { label: '∵', insert: '∵ ' }, { label: '∴', insert: '∴ ' },
      { label: '∠', insert: '∠' }, { label: '△', insert: '△' },
      { label: '∥', insert: '∥' }, { label: '⊥', insert: '⊥' },
      { label: '≡', insert: '≡' }, { label: '≈', insert: '≈' },
      { label: '≠', insert: '≠' }, { label: '≤', insert: '≤' },
      { label: '≥', insert: '≥' }, { label: '°', insert: '°' },
      { label: 'π', insert: 'π' }, { label: '→', insert: '→' },
      { label: '⇒', insert: '⇒' }, { label: '∈', insert: '∈' },
      { label: '⊂', insert: '⊂' }, { label: '∪', insert: '∪' },
      { label: '∩', insert: '∩' }, { label: '▱', insert: '▱' },
      { label: '⊙', insert: '⊙' }, { label: '全等', insert: '≅' },
      { label: '相似', insert: '∽' }, { label: '根号', insert: '√' },
      { label: '平方', insert: '²' }, { label: '已知', insert: '已知：' },
      { label: '求证', insert: '求证：' }, { label: '证明', insert: '证明：' },
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

  fisherYatesShuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // ==================== 练习模式 ====================
  startPractice() {
    const mode = document.getElementById('practice-mode')?.value || 'current';
    const difficulty = document.getElementById('difficulty-level')?.value || 'mixed';
    const knowledgeSelect = document.getElementById('knowledge-filter');
    const selectedKnowledge = knowledgeSelect
      ? Array.from(knowledgeSelect.selectedOptions).map(o => o.value).filter(v => v)
      : [];

    this.practiceManager.startPractice({
      type: mode === 'random' ? 'random' : 'mixed',
      difficulty,
      knowledge: selectedKnowledge,
      geometryType: this.currentGeometryType
    });

    // 启动统计会话
    this.practiceStatsManager.loadFromStorage();
    this.practiceStatsManager.startSession(this.currentGeometryType);

    // 显示练习模式3D预览窗口
    const centerArea = document.querySelector('.center-area');
    if (centerArea) centerArea.classList.add('practice-active');
    this.rendererManager.switchContainer('canvas-wrapper-practice');

    this.showCurrentQuestion();
    this.showToast('📝 练习开始！', 'success');
  }

  showCurrentQuestion() {
    const question = this.practiceManager.currentQuestion;
    if (!question) return;

    const container = document.getElementById('question-container');
    if (!container) return;

    const questionNumber = this.practiceManager.stats.total + 1;
    let answerHTML;

    if (question.type === 'choice') {
      answerHTML = this.createOptionsHTML(question.options || [], 0);
    } else if (question.type === 'proof') {
      answerHTML = this.createProofToolbar(0);
      if (question.proofSteps) {
        this.practiceManager.initProofSteps(question.proofSteps);
      }
    } else if (question.type === 'fill') {
      answerHTML = this.createInputHTML(0);
    } else {
      answerHTML = this.createInputHTML(0);
    }

    container.innerHTML = `
      <div class="question-item" data-question-id="${question.id}">
        <div class="question-header">
          <span class="question-number">第 ${questionNumber} 题</span>
          <span class="question-type">${this.getQuestionTypeName(question.type)}</span>
          <span class="question-difficulty ${question.difficulty}">${this.getDifficultyName(question.difficulty)}</span>
          ${question.geometry ? `<span class="question-geometry">${this.getGeometryName(question.geometry)}</span>` : ''}
        </div>
        ${question.premise ? `<div class="question-premise">${question.premise}</div>` : ''}
        <div class="question-text">${question.question}</div>
        ${question.claim ? `<div class="question-claim">${question.claim}</div>` : ''}
        ${answerHTML}
        <div class="question-actions">
          <button class="btn btn-sm btn-primary" id="btn-submit-answer">提交答案</button>
          <button class="btn btn-sm btn-outline" id="btn-show-hint">💡 提示</button>
          <button class="btn btn-sm btn-outline" id="btn-next-question" style="display:none">下一题 →</button>
        </div>
        <div id="answer-feedback" class="answer-feedback" style="display:none"></div>
        <div id="hint-display" class="hint-display" style="display:none"></div>
      </div>
    `;

    // 绑定事件
    document.getElementById('btn-submit-answer')?.addEventListener('click', () => this.submitCurrentAnswer());
    document.getElementById('btn-show-hint')?.addEventListener('click', () => this.showCurrentHint());
    document.getElementById('btn-next-question')?.addEventListener('click', () => this.nextQuestion());

    this.bindProofToolbarEvents();
    this.updatePracticeStats();
  }

  submitCurrentAnswer() {
    const question = this.practiceManager.currentQuestion;
    if (!question) return;

    let userAnswer = null;
    if (question.type === 'choice') {
      const selected = document.querySelector('input[name="question_0"]:checked');
      userAnswer = selected ? parseInt(selected.value) : null;
    } else if (question.type === 'fill') {
      const input = document.getElementById('answer_0');
      userAnswer = input ? input.value.trim() : null;
    } else if (question.type === 'proof') {
      userAnswer = 'completed';
    }

    if (userAnswer === null || userAnswer === '') {
      this.showToast('请先输入答案', 'warning');
      return;
    }

    if (question.type === 'choice') {
      this.practiceManager.selectAnswer(userAnswer);
    }

    const result = this.practiceManager.submitAnswer(userAnswer);
    if (!result) return;

    // 记录统计
    this.practiceStatsManager.recordQuestion(
      this.practiceManager.currentQuestion,
      userAnswer,
      result.isCorrect
    );

    this.showAnswerFeedback(result);
    this.updatePracticeStats();

    // 显示下一题按钮
    const submitBtn = document.getElementById('btn-submit-answer');
    const nextBtn = document.getElementById('btn-next-question');
    if (submitBtn) submitBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'inline-flex';
  }

  showAnswerFeedback(result) {
    const feedbackEl = document.getElementById('answer-feedback');
    if (!feedbackEl) return;

    feedbackEl.style.display = 'block';
    feedbackEl.className = `answer-feedback ${result.isCorrect ? 'correct' : 'incorrect'}`;
    feedbackEl.innerHTML = `
      <div class="feedback-header">${result.isCorrect ? '✓ 回答正确！' : '✗ 回答错误'}</div>
      <div class="feedback-detail">
        <p><strong>正确答案：</strong>${result.correctAnswer}</p>
        ${result.explanation ? `<p><strong>解析：</strong>${result.explanation}</p>` : ''}
      </div>
    `;

    // 禁用输入
    const questionEl = document.querySelector('.question-item');
    if (questionEl) {
      questionEl.querySelectorAll('input').forEach(input => input.disabled = true);
      const submitBtn = document.getElementById('btn-submit-answer');
      if (submitBtn) submitBtn.disabled = true;
    }
  }

  showCurrentHint() {
    const hint = this.practiceManager.getHint();
    const hintDisplay = document.getElementById('hint-display');
    if (!hintDisplay) return;

    if (hint) {
      hintDisplay.style.display = 'block';
      hintDisplay.innerHTML = `
        <div class="hint-content">
          <span class="hint-step">提示 ${hint.step}/${hint.totalSteps}</span>
          <span class="hint-text">${hint.hint}</span>
        </div>
      `;
    } else {
      this.showToast('暂无更多提示', 'info');
    }
  }

  nextQuestion() {
    this.practiceManager.nextQuestion();
    this.showCurrentQuestion();
  }

  getGeometryName(type) {
    const names = {
      cube: '正方体', rectangularBox: '长方体', triangularPrism: '三棱柱',
      hexagonalPrism: '正六棱柱', squarePyramid: '四棱锥', tetrahedron: '正四面体',
      triangularPyramid: '斜三棱锥'
    };
    return names[type] || type;
  }

  showPracticeSummary() {
    const stats = this.practiceManager.getStats();
    const todayStats = this.practiceManager.getTodayStats();

    // 结束统计会话
    this.practiceStatsManager.endSession();

    // 隐藏练习模式3D预览窗口
    const centerArea = document.querySelector('.center-area');
    if (centerArea) centerArea.classList.remove('practice-active');
    this.rendererManager.switchContainer('canvas-wrapper');

    // 保存练习记录
    const records = this.practiceManager.getRecords();
    if (records && records.length > 0) {
      const lastRecord = records[records.length - 1];
      this.recordsManager.addRecord(lastRecord);
    }

    const overlay = document.createElement('div');
    overlay.className = 'practice-summary-overlay';
    overlay.innerHTML = `
      <div class="practice-summary">
        <h3>练习统计</h3>
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-label">本次答题</span>
            <span class="stat-value">${stats.total}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">正确</span>
            <span class="stat-value">${stats.correct}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">正确率</span>
            <span class="stat-value">${stats.accuracy}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">连续正确</span>
            <span class="stat-value">${stats.streak}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">今日答题</span>
            <span class="stat-value">${todayStats.total}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">今日正确率</span>
            <span class="stat-value">${todayStats.accuracy}%</span>
          </div>
        </div>
        <button class="btn btn-primary" onclick="this.closest('.practice-summary-overlay').remove()">关闭</button>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  updatePracticeUI(questions) {
    // 旧方法保留兼容性
    if (Array.isArray(questions) && questions.length > 0) {
      this.showCurrentQuestion();
    }
  }

  randomQuestion() {
    // 快速随机一题
    this.practiceManager.startPractice({
      type: 'random',
      difficulty: 'mixed',
      knowledge: [],
      geometryType: 'mixed'
    });
    this.showCurrentQuestion();
    this.showToast('🎲 随机题目已生成', 'info');
  }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  window.app = new SolidGeometryApp();
});
