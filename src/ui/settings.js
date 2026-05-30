/**
 * SettingsManager
 * 设置面板管理 - Material You 风格
 * 支持显示/交互/练习/关于四大分区
 */

const STORAGE_KEY = 'solid-geometry-settings';

export class SettingsManager {
  constructor() {
    this.overlay = null;
    this.callbacks = {};
    this.settings = this.getDefaultSettings();
  }

  // ==================== 默认值 ====================
  getDefaultSettings() {
    return {
      // 显示
      showGrid: true,
      showAxes: true,
      showLabels: true,
      showCoordInfo: false,
      showEdgeLength: false,
      // 交互
      animationSpeed: 1,
      cameraSensitivity: 1,
      autoRotate: false,
      // 练习
      defaultQuestionCount: 5,
      showHints: true,
      showSolution: true,
    };
  }

  // ==================== 创建面板 ====================
  create() {
    this.loadSettings();
    this.overlay = document.createElement('div');
    this.overlay.className = 'settings-overlay';
    this.overlay.innerHTML = this.render();
    document.body.appendChild(this.overlay);
    this.bindEvents();
    return this.overlay;
  }

  // ==================== 渲染 HTML ====================
  render() {
    const s = this.settings;
    return `
      <div class="settings-panel">
        <div class="settings-header">
          <h3>设置</h3>
          <button class="btn btn-ghost btn-icon btn-sm" id="settings-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="settings-body">

          <!-- 显示 -->
          <div class="settings-group">
            <div class="settings-group-title">显示</div>
            ${this._switch('setting-grid', '网格', '显示/隐藏地面网格', s.showGrid)}
            ${this._switch('setting-axes', '坐标轴', '显示/隐藏XYZ坐标轴', s.showAxes)}
            ${this._switch('setting-labels', '顶点标签', '显示/隐藏顶点名称', s.showLabels)}
            ${this._switch('setting-coord-info', '坐标信息', '显示顶点三维坐标', s.showCoordInfo)}
            ${this._switch('setting-edge-length', '线段长度', '显示棱的长度数值', s.showEdgeLength)}
          </div>

          <!-- 交互 -->
          <div class="settings-group">
            <div class="settings-group-title">交互</div>
            <div class="settings-item">
              <div>
                <div class="settings-item-label">动画速度</div>
                <div class="settings-item-desc">展开/折叠等动画速率</div>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span id="anim-speed-label" style="font-size:13px;min-width:32px;text-align:right">${s.animationSpeed.toFixed(1)}x</span>
                <input type="range" class="slider" id="setting-anim-speed"
                  min="0.5" max="2" step="0.1" value="${s.animationSpeed}" style="width:120px">
              </div>
            </div>
            <div class="settings-item">
              <div>
                <div class="settings-item-label">相机灵敏度</div>
                <div class="settings-item-desc">鼠标/触屏旋转速度</div>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span id="cam-sens-label" style="font-size:13px;min-width:32px;text-align:right">${s.cameraSensitivity.toFixed(1)}x</span>
                <input type="range" class="slider" id="setting-cam-sens"
                  min="0.5" max="2" step="0.1" value="${s.cameraSensitivity}" style="width:120px">
              </div>
            </div>
            ${this._switch('setting-auto-rotate', '自动旋转', '相机围绕几何体自动旋转', s.autoRotate)}
          </div>

          <!-- 练习 -->
          <div class="settings-group">
            <div class="settings-group-title">练习</div>
            <div class="settings-item">
              <div>
                <div class="settings-item-label">默认题数</div>
                <div class="settings-item-desc">每次练习的题目数量</div>
              </div>
              <select class="select" id="setting-question-count" style="width:80px">
                ${this._option(3, s.defaultQuestionCount)}
                ${this._option(5, s.defaultQuestionCount)}
                ${this._option(10, s.defaultQuestionCount)}
                ${this._option(15, s.defaultQuestionCount)}
              </select>
            </div>
            ${this._switch('setting-show-hints', '显示提示', '练习时可查看分级提示', s.showHints)}
            ${this._switch('setting-show-solution', '显示解析', '提交后展示答案解析', s.showSolution)}
          </div>

          <!-- 关于 -->
          <div class="settings-group">
            <div class="settings-group-title">关于</div>
            <div class="settings-item" style="flex-direction:column;align-items:flex-start;gap:8px;cursor:default">
              <div style="display:flex;align-items:center;gap:8px">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--md-primary)" stroke-width="2" width="22" height="22">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
                <span style="font-size:16px;font-weight:500">立体几何交互练习平台</span>
              </div>
              <div style="font-size:13px;color:var(--md-on-surface-variant);line-height:1.8">
                <div>版本：v1.0</div>
                <div>作者：墨澜</div>
                <div>技术栈：Three.js + GSAP + Vite + Material You</div>
                <div>
                  <a href="https://github.com" target="_blank" rel="noopener"
                     style="color:var(--md-primary);text-decoration:none">
                    GitHub 仓库
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div style="display:flex;gap:12px;margin-top:24px;padding-bottom:24px">
            <button class="btn btn-outline" id="settings-reset" style="flex:1">重置默认</button>
            <button class="btn btn-primary" id="settings-save" style="flex:1">保存</button>
          </div>

        </div>
      </div>
    `;
  }

  // ==================== 模板辅助 ====================
  _switch(id, label, desc, checked) {
    return `
      <div class="settings-item">
        <div>
          <div class="settings-item-label">${label}</div>
          <div class="settings-item-desc">${desc}</div>
        </div>
        <div class="switch ${checked ? 'active' : ''}" id="${id}"></div>
      </div>`;
  }

  _option(value, current) {
    return `<option value="${value}" ${value === current ? 'selected' : ''}>${value}题</option>`;
  }

  // ==================== 事件绑定 ====================
  bindEvents() {
    const ov = this.overlay;
    if (!ov) return;

    // 关闭
    ov.querySelector('#settings-close')?.addEventListener('click', () => this.hide());
    ov.addEventListener('click', (e) => { if (e.target === this.overlay) this.hide(); });

    // 保存
    ov.querySelector('#settings-save')?.addEventListener('click', () => {
      this.collectFromUI();
      this.saveToStorage();
      this._fireChange();
      this.hide();
    });

    // 重置
    ov.querySelector('#settings-reset')?.addEventListener('click', () => {
      this.settings = this.getDefaultSettings();
      this.refreshUI();
      this.saveToStorage();
      this._fireChange();
    });

    // 开关实时回调
    this._bindSwitches();

    // 滑块实时回调
    ov.querySelector('#setting-anim-speed')?.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      const lbl = ov.querySelector('#anim-speed-label');
      if (lbl) lbl.textContent = v.toFixed(1) + 'x';
      this.settings.animationSpeed = v;
      this._fireChange();
    });
    ov.querySelector('#setting-cam-sens')?.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      const lbl = ov.querySelector('#cam-sens-label');
      if (lbl) lbl.textContent = v.toFixed(1) + 'x';
      this.settings.cameraSensitivity = v;
      this._fireChange();
    });

    // 选择框实时回调
    ov.querySelector('#setting-question-count')?.addEventListener('change', (e) => {
      this.settings.defaultQuestionCount = parseInt(e.target.value);
      this._fireChange();
    });
  }

  _bindSwitches() {
    const switchMap = {
      'setting-grid': 'showGrid',
      'setting-axes': 'showAxes',
      'setting-labels': 'showLabels',
      'setting-coord-info': 'showCoordInfo',
      'setting-edge-length': 'showEdgeLength',
      'setting-auto-rotate': 'autoRotate',
      'setting-show-hints': 'showHints',
      'setting-show-solution': 'showSolution',
    };
    Object.entries(switchMap).forEach(([elId, key]) => {
      const el = this.overlay?.querySelector(`#${elId}`);
      if (!el) return;
      el.addEventListener('click', () => {
        el.classList.toggle('active');
        this.settings[key] = el.classList.contains('active');
        this._fireChange();
      });
    });
  }

  // ==================== 从 DOM 收集当前值 ====================
  collectFromUI() {
    const ov = this.overlay;
    if (!ov) return;
    const q = (id) => ov.querySelector(`#${id}`);
    const sw = (id) => !!q(id)?.classList.contains('active');

    this.settings = {
      showGrid: sw('setting-grid'),
      showAxes: sw('setting-axes'),
      showLabels: sw('setting-labels'),
      showCoordInfo: sw('setting-coord-info'),
      showEdgeLength: sw('setting-edge-length'),
      animationSpeed: parseFloat(q('setting-anim-speed')?.value || 1),
      cameraSensitivity: parseFloat(q('setting-cam-sens')?.value || 1),
      autoRotate: sw('setting-auto-rotate'),
      defaultQuestionCount: parseInt(q('setting-question-count')?.value || 5),
      showHints: sw('setting-show-hints'),
      showSolution: sw('setting-show-solution'),
    };
  }

  // ==================== 刷新面板 UI 到当前 settings ====================
  refreshUI() {
    if (!this.overlay) return;
    const s = this.settings;
    const q = (id) => this.overlay.querySelector(`#${id}`);
    const setSw = (id, val) => {
      const el = q(id);
      if (el) el.classList.toggle('active', val);
    };

    setSw('setting-grid', s.showGrid);
    setSw('setting-axes', s.showAxes);
    setSw('setting-labels', s.showLabels);
    setSw('setting-coord-info', s.showCoordInfo);
    setSw('setting-edge-length', s.showEdgeLength);
    setSw('setting-auto-rotate', s.autoRotate);
    setSw('setting-show-hints', s.showHints);
    setSw('setting-show-solution', s.showSolution);

    const animSlider = q('setting-anim-speed');
    if (animSlider) animSlider.value = s.animationSpeed;
    const animLabel = q('anim-speed-label');
    if (animLabel) animLabel.textContent = s.animationSpeed.toFixed(1) + 'x';

    const camSlider = q('setting-cam-sens');
    if (camSlider) camSlider.value = s.cameraSensitivity;
    const camLabel = q('cam-sens-label');
    if (camLabel) camLabel.textContent = s.cameraSensitivity.toFixed(1) + 'x';

    const countSel = q('setting-question-count');
    if (countSel) countSel.value = s.defaultQuestionCount;
  }

  // ==================== 持久化 ====================
  loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.settings = { ...this.getDefaultSettings(), ...JSON.parse(raw) };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  // ==================== 回调 ====================
  onChange(callback) {
    this.callbacks.onChange = callback;
  }

  _fireChange() {
    if (typeof this.callbacks.onChange === 'function') {
      this.callbacks.onChange({ ...this.settings });
    }
  }

  // ==================== 访问器 ====================
  getSetting(key) {
    return this.settings[key];
  }

  setSetting(key, value) {
    this.settings[key] = value;
    this.saveToStorage();
    this._fireChange();
  }

  getAll() {
    return { ...this.settings };
  }

  // ==================== 显示 / 隐藏 ====================
  show() {
    if (!this.overlay) this.create();
    this.refreshUI();
    requestAnimationFrame(() => {
      this.overlay?.classList.add('visible');
    });
  }

  hide() {
    this.overlay?.classList.remove('visible');
  }

  toggle() {
    if (this.overlay?.classList.contains('visible')) {
      this.hide();
    } else {
      this.show();
    }
  }

  // ==================== 清理 ====================
  dispose() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    this.callbacks = {};
  }
}
