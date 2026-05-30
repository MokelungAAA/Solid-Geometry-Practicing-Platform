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
      this.updateStatusBar(isActive ? '截面模式：点击顶点或棱上选择截面点' : '就绪');
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
    this.settingsManager.loadSettings();
    this.settingsManager.onChange((settings) => this._applySettings(settings));
    this.themeManager = new ThemeManager();
    this.themeManager.init();
    this.responsiveManager = new ResponsiveManager();
    this.keyboardManager = new KeyboardManager();
    this.touchManager = new TouchManager();
    this.initGeometrySelector();
    this._applySettings(this.settingsManager.getAll());
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
      const visible = !this.settingsManager.getSetting('showGrid');
      this.settingsManager.setSetting('showGrid', visible);
      e.currentTarget.classList.toggle('active', visible);
    });
    document.getElementById('btn-axes')?.addEventListener('click', (e) => {
      const visible = !this.settingsManager.getSetting('showAxes');
      this.settingsManager.setSetting('showAxes', visible);
      e.currentTarget.classList.toggle('active', visible);
    });

    // 展开/折叠
    document.getElementById('btn-unfold')?.addEventListener('click', () => {
      if (!this.unfoldManager.unfoldGroup) return;
      this.unfoldManager.animate(1);
      if (this.geometryGroup) this.geometryGroup.visible = false;
      this._syncUnfoldSlider();
    });
    document.getElementById('btn-fold')?.addEventListener('click', () => {
      if (!this.unfoldManager.unfoldGroup) return;
      this.unfoldManager.animate(0);
      this._syncUnfoldSlider(() => {
        if (this.geometryGroup) this.geometryGroup.visible = true;
      });
    });
    document.getElementById('unfold-slider')?.addEventListener('input', (e) => {
      const progress = parseInt(e.target.value) / 100;
      this.unfoldManager.setProgress(progress);
      const el = document.getElementById('unfold-value');
      if (el) el.textContent = `${e.target.value}%`;
      if (this.geometryGroup) {
        this.geometryGroup.visible = progress === 0;
      }
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
    document.getElementById('btn-random-question')?.addEventListener('click', () => this.randomGeometry());

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
    this._addCoordinateLabels(this.geometryGroup, config);
    this._addEdgeLengthLabels(this.geometryGroup, config);
    this.scene.add(this.geometryGroup);
    this._applySettings(this.settingsManager.getAll());
    this.currentGeometryType = type;
    if (config.unfoldConfig) {
      this.unfoldManager.createUnfoldGroup(config, this.geometryFactory.currentVertices);
    }
    this.updateUnfoldButtons();
    const faceMeshes = [];
    this.geometryGroup.traverse(child => {
      if (child.isMesh && child.name.startsWith('face_')) {
        faceMeshes.push(child);
      }
    });
    this.crossSectionManager.setFaceMeshes(faceMeshes);
    this.crossSectionManager.setGeometryData(
      this.geometryFactory.currentVertices,
      config.edges
    );
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

  _syncUnfoldSlider(onComplete) {
    const slider = document.getElementById('unfold-slider');
    const valueEl = document.getElementById('unfold-value');
    const tick = () => {
      const pct = Math.round(this.unfoldManager.progress * 100);
      if (slider) slider.value = pct;
      if (valueEl) valueEl.textContent = `${pct}%`;
      const anim = this.unfoldManager.animation;
      if (anim && anim.isActive && anim.isActive()) {
        requestAnimationFrame(tick);
      } else {
        const finalPct = Math.round(this.unfoldManager.progress * 100);
        if (slider) slider.value = finalPct;
        if (valueEl) valueEl.textContent = `${finalPct}%`;
        if (onComplete) onComplete();
      }
    };
    requestAnimationFrame(tick);
  }

  updateUnfoldButtons() {
    const hasUnfold = !!this.unfoldManager.unfoldGroup;
    const btnUnfold = document.getElementById('btn-unfold');
    const btnFold = document.getElementById('btn-fold');
    const slider = document.getElementById('unfold-slider');
    if (btnUnfold) {
      btnUnfold.disabled = !hasUnfold;
      btnUnfold.classList.toggle('disabled', !hasUnfold);
    }
    if (btnFold) {
      btnFold.disabled = !hasUnfold;
      btnFold.classList.toggle('disabled', !hasUnfold);
    }
    if (slider) {
      slider.disabled = !hasUnfold;
      if (!hasUnfold) slider.value = 0;
    }
    if (!hasUnfold) {
      const el = document.getElementById('unfold-value');
      if (el) el.textContent = '0%';
    }
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
      // 保存 OrbitControls 当前状态，只禁用平移，保留旋转和缩放
      if (this.controls) {
        this._savedControlsState = {
          enablePan: this.controls.enablePan
        };
        this.controls.enablePan = false;
      }
      this._bindCrossSectionEvents();
    } else {
      btn.textContent = '进入截面选点模式';
      btn.classList.remove('active');
      if (hint) hint.style.display = 'none';
      if (container) container.style.display = 'none';
      this._unbindCrossSectionEvents();
      // 恢复 OrbitControls 平移状态
      if (this.controls && this._savedControlsState) {
        this.controls.enablePan = this._savedControlsState.enablePan;
        this._savedControlsState = null;
      }
    }
    // 确保几何体在截面模式下保持可见和可渲染
    if (this.geometryGroup) {
      this.geometryGroup.visible = true;
    }
  }

  _bindCrossSectionEvents() {
    if (this._crossClickBound) return;
    const canvas = this.renderer.domElement;
    this._crossClickBound = (e) => {
      if (!this.crossSectionManager.isActive) return;
      // 只响应左键选点，右键保留给 OrbitControls 旋转
      if (e.button !== 0) return;
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

    // 更新错题统计（从记录管理器获取）
    const recordStats = this.recordsManager.getStats();
    const wrongCountEl = document.getElementById('wrong-count');
    const wrongRateEl = document.getElementById('wrong-rate');
    if (wrongCountEl) wrongCountEl.textContent = recordStats.wrongCount;
    if (wrongRateEl) wrongRateEl.textContent = `${recordStats.wrongRate}%`;
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

    // 记录面板切换按钮
    const wrongCount = this.recordsManager.getWrongRecords().length;
    let toggleHTML = `
      <div class="records-toggle" style="display:flex;gap:8px;margin-bottom:12px">
        <button class="btn btn-sm btn-primary" id="btn-show-all-records" onclick="app.updateRecordsList()">练习记录</button>
        <button class="btn btn-sm btn-outline" id="btn-show-wrong-records" onclick="app.showWrongRecords()">错题本${wrongCount > 0 ? ` (${wrongCount})` : ''}</button>
      </div>
    `;

    const records = this.recordsManager.getRecords();
    if (records.length === 0) {
      container.innerHTML = toggleHTML + `
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
    container.innerHTML = toggleHTML + records.map((record, index) => `
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

  showWrongRecords() {
    const container = document.getElementById('records-list');
    if (!container) return;

    const wrongRecords = this.recordsManager.getWrongRecords();
    const wrongCount = wrongRecords.length;
    const totalRecords = this.recordsManager.getRecords().length;

    let toggleHTML = `
      <div class="records-toggle" style="display:flex;gap:8px;margin-bottom:12px">
        <button class="btn btn-sm btn-outline" id="btn-show-all-records" onclick="app.updateRecordsList()">练习记录${totalRecords > 0 ? ` (${totalRecords})` : ''}</button>
        <button class="btn btn-sm btn-primary" id="btn-show-wrong-records" onclick="app.showWrongRecords()">错题本${wrongCount > 0 ? ` (${wrongCount})` : ''}</button>
      </div>
    `;

    if (wrongRecords.length === 0) {
      container.innerHTML = toggleHTML + `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
          <div class="empty-state-title">错题本为空</div>
          <div class="empty-state-text">答错的题目会自动记录在此</div>
        </div>
      `;
      return;
    }

    const difficultyNames = { easy: '简单', medium: '中等', hard: '困难' };
    container.innerHTML = toggleHTML + wrongRecords.map((record, index) => `
      <div class="record-item" style="border-left:3px solid var(--md-error,#e53935)">
        <div class="record-header">
          <span class="record-date">${this.formatRecordDate(record.timestamp)}</span>
          <span class="record-accuracy" style="background:var(--md-error-container,#fce4ec);color:var(--md-error,#e53935)">${difficultyNames[record.difficulty] || record.difficulty || '-'}</span>
        </div>
        <div class="record-detail" style="flex-direction:column;align-items:flex-start;gap:4px">
          <span style="font-weight:500">${record.question}</span>
          <span style="color:var(--md-error,#e53935)">你的答案：${record.userAnswer}</span>
          <span style="color:var(--md-primary,#1976d2)">正确答案：${record.correctAnswer}</span>
          ${record.geometryType ? `<span style="color:var(--md-on-surface-variant,#666)">几何体：${this.getGeometryName(record.geometryType)}</span>` : ''}
        </div>
        <button class="btn btn-sm btn-outline" onclick="app.deleteWrongRecord(${index})">移除</button>
      </div>
    `).join('');
  }

  deleteWrongRecord(index) {
    if (this.recordsManager.deleteWrongRecord(index)) {
      this.showToast('已从错题本移除', 'success');
      this.showWrongRecords();
    }
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
    this.updateLabelsVisibility();
  }

  updateLabelsVisibility() {
    if (!this.geometryGroup) return;
    const distance = this.camera.position.length();

    // 坐标标签：设置开启时，距离<5时显示
    const coordGroup = this.geometryGroup.getObjectByName('coordLabels');
    if (coordGroup) {
      const settingOn = !!this.settingsManager?.getSetting('showCoordInfo');
      const show = settingOn && distance < 5;
      coordGroup.visible = show;
      coordGroup.children.forEach(label => {
        label.visible = show;
        if (label.isCSS2DObject) {
          const scale = Math.max(0.5, Math.min(1.5, 5 / distance));
          label.element.style.fontSize = `${10 * scale}px`;
        }
      });
    }

    // 棱长标签：设置开启时，距离<4时显示
    const lengthGroup = this.geometryGroup.getObjectByName('edgeLengthLabels');
    if (lengthGroup) {
      const settingOn = !!this.settingsManager?.getSetting('showEdgeLength');
      const show = settingOn && distance < 4;
      lengthGroup.visible = show;
      lengthGroup.children.forEach(label => {
        label.visible = show;
        if (label.isCSS2DObject) {
          const scale = Math.max(0.5, Math.min(1.5, 4 / distance));
          label.element.style.fontSize = `${10 * scale}px`;
        }
      });
    }
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
    this.settingsManager.show();
  }

  // ==================== 设置应用 ====================
  _applySettings(settings) {
    // 网格
    this.sceneManager.setGridVisible(settings.showGrid);
    // 坐标轴
    this.sceneManager.setAxesVisible(settings.showAxes);
    // 标签
    this._applyLabelsVisibility(settings.showLabels);
    // 坐标信息
    this._applyChildGroupVisibility('coordLabels', settings.showCoordInfo);
    // 边长
    this._applyChildGroupVisibility('edgeLengthLabels', settings.showEdgeLength);
    // 动画速度
    if (this.unfoldManager) {
      this.unfoldManager.animationSpeed = settings.animationSpeed;
    }
    // 相机灵敏度
    if (this.controls) {
      this.controls.rotateSpeed = settings.cameraSensitivity;
    }
    // 自动旋转
    if (this.controls) {
      this.controls.autoRotate = settings.autoRotate;
      this.controls.autoRotateSpeed = 2.0;
    }
    // 同步工具栏按钮状态
    const gridBtn = document.getElementById('btn-grid');
    if (gridBtn) gridBtn.classList.toggle('active', settings.showGrid);
    const axesBtn = document.getElementById('btn-axes');
    if (axesBtn) axesBtn.classList.toggle('active', settings.showAxes);
  }

  _applyLabelsVisibility(visible) {
    this.scene.traverse(child => {
      if (child.isCSS2DObject && child.userData?.isLabel) {
        child.visible = visible;
      }
    });
  }

  _applyChildGroupVisibility(groupName, visible) {
    this.scene.traverse(child => {
      if (child.name === groupName) {
        child.visible = visible;
        child.children.forEach(c => { c.visible = visible; });
      }
    });
  }

  _addCoordinateLabels(group, config) {
    if (config.type === 'curved') return;
    const coordGroup = new THREE.Group();
    coordGroup.name = 'coordLabels';
    const vertices = this.geometryFactory.currentVertices;
    Object.entries(vertices).forEach(([name, pos]) => {
      const div = document.createElement('div');
      div.className = 'coord-label';
      div.textContent = `${name}(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`;
      div.className = 'coord-label';
      const label = new CSS2DObject(div);
      label.position.copy(pos);
      label.position.y -= 0.2;
      coordGroup.add(label);
    });
    coordGroup.visible = this.settingsManager?.getSetting('showCoordInfo') || false;
    group.add(coordGroup);
  }

  _addEdgeLengthLabels(group, config) {
    if (config.type === 'curved' || !config.edges) return;
    const lengthGroup = new THREE.Group();
    lengthGroup.name = 'edgeLengthLabels';
    const vertices = this.geometryFactory.currentVertices;
    config.edges.forEach(([start, end]) => {
      const v1 = vertices[start];
      const v2 = vertices[end];
      if (!v1 || !v2) return;
      const mid = v1.clone().add(v2).multiplyScalar(0.5);
      const length = v1.distanceTo(v2);
      const div = document.createElement('div');
      div.className = 'edge-length-label';
      div.textContent = `${start}${end} = ${length.toFixed(2)}`;
      div.className = 'edge-length-label';
      const label = new CSS2DObject(div);
      label.position.copy(mid);
      lengthGroup.add(label);
    });
    lengthGroup.visible = this.settingsManager?.getSetting('showEdgeLength') || false;
    group.add(lengthGroup);
  }

  // ==================== 随机生成几何体并开始练习 ====================
  randomGeometry(preferredType = null) {
    let targetType;
    if (preferredType && GEOMETRY_CONFIGS[preferredType]) {
      targetType = preferredType;
    } else {
      const types = Object.keys(GEOMETRY_CONFIGS);
      let available = types.filter(t => t !== this.currentGeometryType);
      if (available.length === 0) available = types;
      targetType = available[Math.floor(Math.random() * available.length)];
    }
    this.createGeometry(targetType);

    // 切换到练习tab并自动开始练习
    this.switchTab('practice');
    this.startPracticeWithGeometry(targetType);
  }

  // 使用当前选中的几何体开始练习（尊重用户选择）
  startPracticeWithCurrentGeometry() {
    const type = this.currentGeometryType || 'cube';
    this.switchTab('practice');
    this.startPracticeWithGeometry(type);
  }

  // 使用指定几何体开始练习（通用辅助方法）
  startPracticeWithGeometry(geometryType) {
    const difficulty = document.getElementById('difficulty-level')?.value || 'mixed';
    const knowledgeSelect = document.getElementById('knowledge-filter');
    const selectedKnowledge = knowledgeSelect
      ? Array.from(knowledgeSelect.selectedOptions).map(o => o.value).filter(v => v)
      : [];

    // 关闭已有的练习总结浮层
    const summaryOverlay = document.querySelector('.practice-summary-overlay');
    if (summaryOverlay) summaryOverlay.remove();

    this.practiceManager.startPractice({
      type: 'mixed',
      difficulty,
      knowledge: selectedKnowledge,
      geometryType
    });

    this.practiceStatsManager.loadFromStorage();
    this.practiceStatsManager.startSession(geometryType);

    const centerArea = document.querySelector('.center-area');
    if (centerArea) centerArea.classList.add('practice-active');
    this.rendererManager.switchContainer('canvas-wrapper-practice');

    this.showCurrentQuestion();
    this.showToast(`🎲 随机几何体练习：${GEOMETRY_NAMES[geometryType] || geometryType}`, 'success');
  }

  // ==================== 编辑功能 ====================
  _getEditableParams(type) {
    const defs = {
      cube: [{ key: 'size', label: '边长', min: 0.5, max: 3, step: 0.1 }],
      rectangularBox: [
        { key: 'width', label: '长', min: 0.5, max: 3, step: 0.1 },
        { key: 'height', label: '高', min: 0.5, max: 3, step: 0.1 },
        { key: 'depth', label: '宽', min: 0.5, max: 3, step: 0.1 }
      ],
      triangularPrism: [
        { key: 'radius', label: '底面半径', min: 0.5, max: 3, step: 0.1 },
        { key: 'height', label: '高', min: 0.5, max: 3, step: 0.1 }
      ],
      tetrahedron: [{ key: 'radius', label: '边长', min: 0.5, max: 3, step: 0.1 }],
      squarePyramid: [
        { key: 'baseSize', label: '底面边长', min: 0.5, max: 3, step: 0.1 },
        { key: 'height', label: '高', min: 0.5, max: 3, step: 0.1 }
      ],
      hexagonalPrism: [
        { key: 'radius', label: '底面半径', min: 0.5, max: 3, step: 0.1 },
        { key: 'height', label: '高', min: 0.5, max: 3, step: 0.1 }
      ],
      triangularPyramid: [
        { key: 'baseRadius', label: '底面半径', min: 0.5, max: 3, step: 0.1 },
        { key: 'height', label: '高', min: 0.5, max: 3, step: 0.1 }
      ],
      cylinder: [
        { key: 'radius', label: '底面半径', min: 0.5, max: 3, step: 0.1 },
        { key: 'height', label: '高', min: 0.5, max: 3, step: 0.1 }
      ],
      cone: [
        { key: 'radius', label: '底面半径', min: 0.5, max: 3, step: 0.1 },
        { key: 'height', label: '高', min: 0.5, max: 3, step: 0.1 }
      ],
      sphere: [{ key: 'radius', label: '半径', min: 0.5, max: 3, step: 0.1 }]
    };
    return defs[type] || [];
  }

  _computeDihedralAngles(config) {
    if (!config.faces || !config.edges || config.type === 'curved') return [];
    const verts = {};
    Object.entries(config.vertices).forEach(([n, p]) => { verts[n] = new THREE.Vector3(p[0], p[1], p[2]); });
    const centroid = new THREE.Vector3();
    Object.values(verts).forEach(v => centroid.add(v));
    centroid.divideScalar(Object.values(verts).length);

    const getNormal = (faceVerts) => {
      const a = faceVerts[0], b = faceVerts[1], c = faceVerts[2];
      const n = new THREE.Vector3().crossVectors(b.clone().sub(a), c.clone().sub(a)).normalize();
      const fc = new THREE.Vector3();
      faceVerts.forEach(v => fc.add(v));
      fc.divideScalar(faceVerts.length);
      if (n.dot(fc.clone().sub(centroid)) < 0) n.negate();
      return n;
    };

    const faceList = Object.entries(config.faces)
      .filter(([, v]) => Array.isArray(v))
      .map(([name, vn]) => ({ name, verts: vn.map(n => verts[n]).filter(Boolean) }));

    const angles = [];
    config.edges.forEach(([sn, en]) => {
      const adj = faceList.filter(f => f.verts.some(v => v.equals(verts[sn])) && f.verts.some(v => v.equals(verts[en])));
      if (adj.length < 2) return;
      const [f1, f2] = adj;
      const n1 = getNormal(f1.verts), n2 = getNormal(f2.verts);
      const edgeDir = verts[en].clone().sub(verts[sn]).normalize();
      const p1 = n1.clone().sub(edgeDir.clone().multiplyScalar(n1.dot(edgeDir))).normalize();
      const p2 = n2.clone().sub(edgeDir.clone().multiplyScalar(n2.dot(edgeDir))).normalize();
      let angle = Math.acos(Math.max(-1, Math.min(1, p1.dot(p2))));
      if (new THREE.Vector3().crossVectors(p1, p2).dot(edgeDir) < 0) angle = 2 * Math.PI - angle;
      angles.push({ edge: `${sn}${en}`, faces: [f1.name, f2.name], angle: angle * 180 / Math.PI });
    });
    return angles;
  }

  _updateVertexCoords(type, newVertices) {
    const config = GEOMETRY_CONFIGS[type];
    if (!config) return;
    Object.entries(config.vertices).forEach(([name]) => {
      if (newVertices[name]) config.vertices[name] = [...newVertices[name]];
    });
    this.createGeometry(type);
    const overlay = document.querySelector('.settings-overlay');
    if (overlay) {
      overlay.querySelectorAll('.vertex-coord-input').forEach(input => {
        const vn = input.dataset.vertex, axis = input.dataset.axis;
        input.value = parseFloat(config.vertices[vn][axis]).toFixed(2);
      });
    }
  }

  _onAngleChange(type, angles) {
    const config = GEOMETRY_CONFIGS[type];
    if (!config || !config.vertices) return;
    const verts = {};
    Object.entries(config.vertices).forEach(([n, p]) => { verts[n] = new THREE.Vector3(p[0], p[1], p[2]); });
    const centroid = new THREE.Vector3();
    Object.values(verts).forEach(v => centroid.add(v));
    centroid.divideScalar(Object.values(verts).length);

    angles.forEach((angleData, i) => {
      const slider = document.getElementById(`angle-slider-${i}`);
      if (!slider) return;
      const newAngle = parseFloat(slider.value);
      const diff = (newAngle - angleData.angle) * Math.PI / 180;
      const [sn, en] = angleData.edge.split('');
      const edgeDir = verts[en].clone().sub(verts[sn]).normalize();
      const rotationAxis = edgeDir;
      const affectedFaces = Object.entries(config.faces).filter(([, vn]) => Array.isArray(vn) && vn.includes(sn) && vn.includes(en));
      if (affectedFaces.length === 0) return;
      const affectedVerts = new Set();
      affectedFaces.forEach(([, vn]) => vn.forEach(n => affectedVerts.add(n)));
      affectedVerts.delete(sn);
      affectedVerts.delete(en);
      const rotMatrix = new THREE.Matrix4().makeRotationAxis(rotationAxis, diff);
      affectedVerts.forEach(vn => {
        const v = verts[vn].clone().sub(centroid);
        v.applyMatrix4(rotMatrix);
        v.add(centroid);
        config.vertices[vn] = [parseFloat(v.x.toFixed(3)), parseFloat(v.y.toFixed(3)), parseFloat(v.z.toFixed(3))];
      });
    });
    this.createGeometry(type);
    this._refreshEditDialog();
  }

  _refreshEditDialog() {
    const overlay = document.querySelector('.settings-overlay');
    if (!overlay) return;
    const type = this.currentGeometryType;
    const config = GEOMETRY_CONFIGS[type];
    if (!config) return;
    const paramsSection = overlay.querySelector('#edit-params-section');
    if (paramsSection) {
      const defs = this._getEditableParams(type);
      paramsSection.innerHTML = defs.map(d =>
        `<div class="settings-item" style="flex-direction:column;align-items:stretch;gap:4px">
          <div style="display:flex;justify-content:space-between"><span class="settings-item-label">${d.label}</span><span class="settings-item-value" id="param-val-${d.key}">${(config.defaultParams[d.key] || 0).toFixed(1)}</span></div>
          <input type="range" id="param-${d.key}" min="${d.min}" max="${d.max}" step="${d.step}" value="${config.defaultParams[d.key] || 1}" style="width:100%;accent-color:var(--md-primary)">
        </div>`
      ).join('');
      defs.forEach(d => {
        document.getElementById(`param-${d.key}`)?.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          GEOMETRY_CONFIGS[type].defaultParams[d.key] = val;
          document.getElementById(`param-val-${d.key}`).textContent = val.toFixed(1);
          this.createGeometry(type);
          this._refreshEditDialog();
        });
      });
    }
    const anglesSection = overlay.querySelector('#edit-angles-section');
    if (anglesSection) {
      const angles = this._computeDihedralAngles(config);
      if (angles.length) {
        anglesSection.innerHTML = angles.map((a, i) =>
          `<div class="settings-item" style="flex-direction:column;align-items:stretch;gap:4px">
            <div style="display:flex;justify-content:space-between"><span class="settings-item-label">∠${a.edge}（${a.faces[0]}-${a.faces[1]}）</span><span class="settings-item-value" id="angle-val-${i}">${a.angle.toFixed(1)}°</span></div>
            <input type="range" id="angle-slider-${i}" min="0" max="180" step="0.5" value="${a.angle}" style="width:100%;accent-color:var(--md-primary)">
          </div>`
        ).join('');
        angles.forEach((_, i) => {
          document.getElementById(`angle-slider-${i}`)?.addEventListener('input', (e) => {
            document.getElementById(`angle-val-${i}`).textContent = `${parseFloat(e.target.value).toFixed(1)}°`;
          });
          document.getElementById(`angle-slider-${i}`)?.addEventListener('change', () => {
            this._onAngleChange(type, angles);
          });
        });
      } else {
        anglesSection.innerHTML = '<div style="font-size:12px;color:var(--md-on-surface-variant)">无可调二面角</div>';
      }
    }
    const coordsSection = overlay.querySelector('#edit-coords-section');
    if (coordsSection && config.vertices && Object.keys(config.vertices).length) {
      const verts = config.vertices;
      coordsSection.innerHTML = Object.entries(verts).map(([name, pos]) =>
        `<div class="settings-item" style="flex-direction:column;align-items:stretch;gap:4px">
          <div class="settings-item-label" style="font-weight:500">顶点 ${name}</div>
          <div style="display:flex;gap:8px;align-items:center">
            <label style="font-size:12px;color:var(--md-on-surface-variant)">X</label><input type="number" class="vertex-coord-input" data-vertex="${name}" data-axis="0" value="${pos[0].toFixed(2)}" step="0.1" style="width:60px;padding:4px;border:1px solid var(--md-outline-variant);border-radius:6px;font-size:12px;background:var(--md-surface);color:var(--md-on-surface)">
            <label style="font-size:12px;color:var(--md-on-surface-variant)">Y</label><input type="number" class="vertex-coord-input" data-vertex="${name}" data-axis="1" value="${pos[1].toFixed(2)}" step="0.1" style="width:60px;padding:4px;border:1px solid var(--md-outline-variant);border-radius:6px;font-size:12px;background:var(--md-surface);color:var(--md-on-surface)">
            <label style="font-size:12px;color:var(--md-on-surface-variant)">Z</label><input type="number" class="vertex-coord-input" data-vertex="${name}" data-axis="2" value="${pos[2].toFixed(2)}" step="0.1" style="width:60px;padding:4px;border:1px solid var(--md-outline-variant);border-radius:6px;font-size:12px;background:var(--md-surface);color:var(--md-on-surface)">
          </div>
        </div>`
      ).join('');
      coordsSection.querySelectorAll('.vertex-coord-input').forEach(input => {
        input.addEventListener('change', () => {
          const vn = input.dataset.vertex, axis = parseInt(input.dataset.axis);
          const newVerts = {};
          Object.entries(config.vertices).forEach(([n, p]) => { newVerts[n] = [...p]; });
          newVerts[vn][axis] = parseFloat(input.value);
          this._updateVertexCoords(type, newVerts);
        });
      });
    }
  }

  showEditDialog() {
    if (!this.currentGeometryType) { this.showToast('请先选择一个几何体', 'warning'); return; }
    const type = this.currentGeometryType;
    const config = GEOMETRY_CONFIGS[type];
    const name = GEOMETRY_NAMES[type] || type;
    const existing = document.querySelector('.settings-overlay');
    if (existing) existing.remove();

    const defs = this._getEditableParams(type);
    const angles = this._computeDihedralAngles(config);
    const hasVerts = config.vertices && Object.keys(config.vertices).length > 0;

    const paramHTML = defs.map(d =>
      `<div class="settings-item" style="flex-direction:column;align-items:stretch;gap:4px">
        <div style="display:flex;justify-content:space-between"><span class="settings-item-label">${d.label}</span><span class="settings-item-value" id="param-val-${d.key}">${(config.defaultParams[d.key] || 0).toFixed(1)}</span></div>
        <input type="range" id="param-${d.key}" min="${d.min}" max="${d.max}" step="${d.step}" value="${config.defaultParams[d.key] || 1}" style="width:100%;accent-color:var(--md-primary)">
      </div>`
    ).join('');

    const angleHTML = angles.length ? angles.map((a, i) =>
      `<div class="settings-item" style="flex-direction:column;align-items:stretch;gap:4px">
        <div style="display:flex;justify-content:space-between"><span class="settings-item-label">∠${a.edge}（${a.faces[0]}-${a.faces[1]}）</span><span class="settings-item-value" id="angle-val-${i}">${a.angle.toFixed(1)}°</span></div>
        <input type="range" id="angle-slider-${i}" min="0" max="180" step="0.5" value="${a.angle}" style="width:100%;accent-color:var(--md-primary)">
      </div>`
    ).join('') : '<div style="font-size:12px;color:var(--md-on-surface-variant)">无可调二面角</div>';

    const coordHTML = hasVerts ? Object.entries(config.vertices).map(([vname, pos]) =>
      `<div class="settings-item" style="flex-direction:column;align-items:stretch;gap:4px">
        <div class="settings-item-label" style="font-weight:500">顶点 ${vname}</div>
        <div style="display:flex;gap:8px;align-items:center">
          <label style="font-size:12px;color:var(--md-on-surface-variant)">X</label><input type="number" class="vertex-coord-input" data-vertex="${vname}" data-axis="0" value="${pos[0].toFixed(2)}" step="0.1" style="width:60px;padding:4px;border:1px solid var(--md-outline-variant);border-radius:6px;font-size:12px;background:var(--md-surface);color:var(--md-on-surface)">
          <label style="font-size:12px;color:var(--md-on-surface-variant)">Y</label><input type="number" class="vertex-coord-input" data-vertex="${vname}" data-axis="1" value="${pos[1].toFixed(2)}" step="0.1" style="width:60px;padding:4px;border:1px solid var(--md-outline-variant);border-radius:6px;font-size:12px;background:var(--md-surface);color:var(--md-on-surface)">
          <label style="font-size:12px;color:var(--md-on-surface-variant)">Z</label><input type="number" class="vertex-coord-input" data-vertex="${vname}" data-axis="2" value="${pos[2].toFixed(2)}" step="0.1" style="width:60px;padding:4px;border:1px solid var(--md-outline-variant);border-radius:6px;font-size:12px;background:var(--md-surface);color:var(--md-on-surface)">
        </div>
      </div>`
    ).join('') : '<div style="font-size:12px;color:var(--md-on-surface-variant)">曲面体无顶点坐标</div>';

    const overlay = document.createElement('div');
    overlay.className = 'settings-overlay';
    overlay.innerHTML = `
      <div class="settings-panel">
        <div class="settings-header">
          <h3>编辑 · ${name}</h3>
          <button class="btn btn-ghost btn-icon btn-sm" id="close-edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="settings-body">
          <div class="settings-group">
            <div class="settings-group-title">几何体参数</div>
            <div id="edit-params-section">${paramHTML}</div>
          </div>
          <div class="settings-group">
            <div class="settings-group-title">角度调整</div>
            <div id="edit-angles-section">${angleHTML}</div>
          </div>
          <div class="settings-group">
            <div class="settings-group-title">坐标显示</div>
            <div id="edit-coords-section">${coordHTML}</div>
          </div>
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
          <div style="padding:8px 0"><button class="btn btn-outline" id="btn-reset-params" style="width:100%">重置为默认值</button></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // 关闭
    overlay.querySelector('#close-edit').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // 参数滑块
    defs.forEach(d => {
      document.getElementById(`param-${d.key}`)?.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        GEOMETRY_CONFIGS[type].defaultParams[d.key] = val;
        document.getElementById(`param-val-${d.key}`).textContent = val.toFixed(1);
        this.createGeometry(type);
        this._refreshEditDialog();
      });
    });

    // 二面角滑块
    angles.forEach((_, i) => {
      document.getElementById(`angle-slider-${i}`)?.addEventListener('input', (e) => {
        document.getElementById(`angle-val-${i}`).textContent = `${parseFloat(e.target.value).toFixed(1)}°`;
      });
      document.getElementById(`angle-slider-${i}`)?.addEventListener('change', () => {
        this._onAngleChange(type, angles);
      });
    });

    // 顶点坐标输入
    overlay.querySelectorAll('.vertex-coord-input').forEach(input => {
      input.addEventListener('change', () => {
        const vn = input.dataset.vertex, axis = parseInt(input.dataset.axis);
        const newVerts = {};
        Object.entries(config.vertices).forEach(([n, p]) => { newVerts[n] = [...p]; });
        newVerts[vn][axis] = parseFloat(input.value);
        this._updateVertexCoords(type, newVerts);
      });
    });

    // 显示控制开关
    const toggleChild = (childName, visible) => {
      if (!this.geometryGroup) return;
      this.geometryGroup.children.forEach(child => {
        if (child.name === childName || (childName === 'labels' && (child.isCSS2DObject || child.userData?.isLabel))) {
          child.visible = visible;
        }
      });
    };
    overlay.querySelector('#edit-faces')?.addEventListener('click', (e) => { e.currentTarget.classList.toggle('active'); toggleChild('faces', e.currentTarget.classList.contains('active')); });
    overlay.querySelector('#edit-edges')?.addEventListener('click', (e) => { e.currentTarget.classList.toggle('active'); toggleChild('edges', e.currentTarget.classList.contains('active')); });
    overlay.querySelector('#edit-vertices')?.addEventListener('click', (e) => { e.currentTarget.classList.toggle('active'); toggleChild('vertices', e.currentTarget.classList.contains('active')); });
    overlay.querySelector('#edit-labels')?.addEventListener('click', (e) => { e.currentTarget.classList.toggle('active'); toggleChild('labels', e.currentTarget.classList.contains('active')); });

    // 颜色
    overlay.querySelector('#edit-face-color')?.addEventListener('input', (e) => {
      if (!this.geometryGroup) return;
      this.geometryGroup.traverse(child => { if (child.isMesh && !child.material.wireframe) child.material.color.set(e.target.value); });
    });
    overlay.querySelector('#edit-edge-color')?.addEventListener('input', (e) => {
      if (!this.geometryGroup) return;
      this.geometryGroup.traverse(child => { if (child.isLineSegments) child.material.color.set(e.target.value); });
    });

    // 重置按钮
    overlay.querySelector('#btn-reset-params')?.addEventListener('click', () => {
      const origConfig = GEOMETRY_CONFIGS[type];
      const origDefs = this._getEditableParams(type);
      origDefs.forEach(d => {
        const origVal = { cube: { size: 1 }, rectangularBox: { width: 1.5, height: 1, depth: 1 },
          triangularPrism: { radius: 1, height: 1.5 }, tetrahedron: { radius: 1 },
          squarePyramid: { baseSize: 1.5, height: 1.5 }, hexagonalPrism: { radius: 1, height: 1.5 },
          triangularPyramid: { baseRadius: 1, height: 1.5 }, cylinder: { radius: 1, height: 2 },
          cone: { radius: 1, height: 2 }, sphere: { radius: 1 }
        }[type]?.[d.key] || 1;
        origConfig.defaultParams[d.key] = origVal;
      });
      // 恢复原始顶点
      const origVerts = { cube: { A: [0,0,0], B: [1,0,0], C: [1,1,0], D: [0,1,0], E: [0,0,1], F: [1,0,1], G: [1,1,1], H: [0,1,1] },
        rectangularBox: { A: [0,0,0], B: [1.5,0,0], C: [1.5,1,0], D: [0,1,0], E: [0,0,1], F: [1.5,0,1], G: [1.5,1,1], H: [0,1,1] },
        tetrahedron: { A: [0,0,0], B: [1,0,0], C: [0.5,0.866,0], D: [0.5,0.289,0.816] },
        triangularPyramid: { A: [0,0,0], B: [1,0,0], C: [0.5,0.866,0], D: [0.5,0.289,1.5] },
        squarePyramid: { A: [0,0,0], B: [1.5,0,0], C: [1.5,0,1.5], D: [0,0,1.5], E: [0.75,1.5,0.75] }
      }[type];
      if (origVerts && origConfig.vertices) {
        Object.entries(origVerts).forEach(([n, p]) => { if (origConfig.vertices[n]) origConfig.vertices[n] = [...p]; });
      }
      this.createGeometry(type);
      this._refreshEditDialog();
      this.showToast('已重置为默认值', 'success');
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

    // 随机几何体练习模式：选择随机几何体后开始练习
    if (mode === 'randomGeometry') {
      const selectedType = document.getElementById('geometry-type')?.value;
      this.randomGeometry(selectedType);
      return;
    }

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

    // 根据题目geometry字段自动切换几何体
    if (question.geometry) {
      let targetType = question.geometry;
      // 如果geometry不是已知type，则当作中文名转换
      if (!GEOMETRY_CONFIGS[targetType]) {
        targetType = this.getGeometryTypeFromName(question.geometry);
      }
      if (targetType && targetType !== this.currentGeometryType) {
        this.createGeometry(targetType);
      }
    }

    const container = document.getElementById('question-container');
    if (!container) return;

    // 隐藏空状态
    const emptyState = document.getElementById('question-empty-state');
    if (emptyState) emptyState.style.display = 'none';

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

    // 答错时自动记录错题
    if (!result.isCorrect) {
      this.recordsManager.addWrongRecord({
        question: question.question || question.text || '',
        userAnswer: String(userAnswer),
        correctAnswer: String(result.correctAnswer),
        geometryType: question.geometry || this.currentGeometryType,
        difficulty: question.difficulty || 'medium',
        questionId: question.id || ''
      });
    }

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

  getGeometryTypeFromName(name) {
    const nameToType = {
      '正方体': 'cube', '长方体': 'rectangularBox', '三棱柱': 'triangularPrism',
      '正六棱柱': 'hexagonalPrism', '六棱柱': 'hexagonalPrism',
      '四棱锥': 'squarePyramid', '正四面体': 'tetrahedron',
      '斜三棱锥': 'triangularPyramid', '三棱锥': 'triangularPyramid',
      '圆柱': 'cylinder', '圆锥': 'cone', '球': 'sphere'
    };
    return nameToType[name] || null;
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

}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  window.app = new SolidGeometryApp();
});
