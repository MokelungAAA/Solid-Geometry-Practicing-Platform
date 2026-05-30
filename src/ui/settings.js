/**
 * SettingsManager
 * 设置面板管理
 */

export class SettingsManager {
  constructor() {
    this.panel = null;
    this.settings = this.getDefaultSettings();
    this.callbacks = {};
  }

  getDefaultSettings() {
    return {
      theme: 'light',
      language: 'zh-CN',
      showGrid: true,
      showAxes: true,
      showLabels: true,
      animationSpeed: 1,
      cameraSensitivity: 1,
      autoRotate: false,
      autoRotateSpeed: 1,
      practiceMode: 'normal',
      questionCount: 10,
      timeLimit: 300,
      showHints: true,
      showSolution: true,
      soundEnabled: true,
      notificationsEnabled: true
    };
  }

  create() {
    this.panel = document.createElement('div');
    this.panel.id = 'settings-panel';
    this.panel.style.cssText = `
      position: fixed;
      top: 0;
      right: -400px;
      width: 400px;
      height: 100%;
      background: var(--md-surface);
      box-shadow: -4px 0 16px rgba(0,0,0,0.1);
      z-index: 9000;
      transition: right 0.3s ease;
      overflow-y: auto;
    `;
    this.panel.innerHTML = this.renderSettings();
    document.body.appendChild(this.panel);
    this.bindEvents();
    this.loadSettings();
    return this.panel;
  }

  renderSettings() {
    return `
      <div style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <h2 style="margin: 0; font-size: 24px;">设置</h2>
          <button id="settings-close" style="background: none; border: none; cursor: pointer; color: var(--md-on-surface);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div class="settings-section">
            <h3 style="margin: 0 0 16px 0; font-size: 16px; color: var(--md-primary);">外观</h3>
            <div class="settings-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
              <label>主题</label>
              <select id="setting-theme" style="padding: 8px 12px; border-radius: 8px; border: 1px solid var(--md-outline);">
                <option value="light">浅色</option>
                <option value="dark">深色</option>
                <option value="auto">跟随系统</option>
              </select>
            </div>
          </div>
          <div class="settings-section">
            <h3 style="margin: 0 0 16px 0; font-size: 16px; color: var(--md-primary);">显示</h3>
            <div class="settings-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
              <label>显示网格</label>
              <input type="checkbox" id="setting-grid" ${this.settings.showGrid ? 'checked' : ''}>
            </div>
            <div class="settings-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
              <label>显示坐标轴</label>
              <input type="checkbox" id="setting-axes" ${this.settings.showAxes ? 'checked' : ''}>
            </div>
            <div class="settings-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
              <label>显示顶点标签</label>
              <input type="checkbox" id="setting-labels" ${this.settings.showLabels ? 'checked' : ''}>
            </div>
          </div>
          <div class="settings-section">
            <h3 style="margin: 0 0 16px 0; font-size: 16px; color: var(--md-primary);">交互</h3>
            <div class="settings-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
              <label>动画速度</label>
              <input type="range" id="setting-animation-speed" min="0.5" max="2" step="0.1" value="${this.settings.animationSpeed}" style="width: 150px;">
            </div>
            <div class="settings-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
              <label>相机灵敏度</label>
              <input type="range" id="setting-camera-sensitivity" min="0.5" max="2" step="0.1" value="${this.settings.cameraSensitivity}" style="width: 150px;">
            </div>
            <div class="settings-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
              <label>自动旋转</label>
              <input type="checkbox" id="setting-auto-rotate" ${this.settings.autoRotate ? 'checked' : ''}>
            </div>
          </div>
          <div class="settings-section">
            <h3 style="margin: 0 0 16px 0; font-size: 16px; color: var(--md-primary);">练习</h3>
            <div class="settings-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
              <label>题目数量</label>
              <input type="number" id="setting-question-count" min="1" max="50" value="${this.settings.questionCount}" style="width: 80px; padding: 8px; border-radius: 8px; border: 1px solid var(--md-outline);">
            </div>
            <div class="settings-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
              <label>显示提示</label>
              <input type="checkbox" id="setting-show-hints" ${this.settings.showHints ? 'checked' : ''}>
            </div>
            <div class="settings-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
              <label>显示解析</label>
              <input type="checkbox" id="setting-show-solution" ${this.settings.showSolution ? 'checked' : ''}>
            </div>
          </div>
          <div class="settings-section">
            <h3 style="margin: 0 0 16px 0; font-size: 16px; color: var(--md-primary);">其他</h3>
            <div class="settings-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
              <label>音效</label>
              <input type="checkbox" id="setting-sound" ${this.settings.soundEnabled ? 'checked' : ''}>
            </div>
            <div class="settings-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
              <label>通知</label>
              <input type="checkbox" id="setting-notifications" ${this.settings.notificationsEnabled ? 'checked' : ''}>
            </div>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 24px;">
            <button id="settings-reset" style="flex: 1; padding: 12px; border-radius: 12px; border: 1px solid var(--md-outline); background: var(--md-surface); color: var(--md-on-surface); cursor: pointer;">重置默认</button>
            <button id="settings-save" style="flex: 1; padding: 12px; border-radius: 12px; border: none; background: var(--md-primary); color: white; cursor: pointer;">保存</button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    document.getElementById('settings-close').addEventListener('click', () => this.hide());
    document.getElementById('settings-save').addEventListener('click', () => this.saveSettings());
    document.getElementById('settings-reset').addEventListener('click', () => this.resetSettings());
  }

  show() {
    if (!this.panel) this.create();
    this.panel.style.right = '0';
  }

  hide() {
    if (this.panel) {
      this.panel.style.right = '-400px';
    }
  }

  toggle() {
    if (this.panel && this.panel.style.right === '0px') {
      this.hide();
    } else {
      this.show();
    }
  }

  saveSettings() {
    this.settings = {
      theme: document.getElementById('setting-theme').value,
      showGrid: document.getElementById('setting-grid').checked,
      showAxes: document.getElementById('setting-axes').checked,
      showLabels: document.getElementById('setting-labels').checked,
      animationSpeed: parseFloat(document.getElementById('setting-animation-speed').value),
      cameraSensitivity: parseFloat(document.getElementById('setting-camera-sensitivity').value),
      autoRotate: document.getElementById('setting-auto-rotate').checked,
      questionCount: parseInt(document.getElementById('setting-question-count').value),
      showHints: document.getElementById('setting-show-hints').checked,
      showSolution: document.getElementById('setting-show-solution').checked,
      soundEnabled: document.getElementById('setting-sound').checked,
      notificationsEnabled: document.getElementById('setting-notifications').checked
    };
    this.saveToStorage();
    if (this.callbacks.onChange) {
      this.callbacks.onChange(this.settings);
    }
    this.hide();
  }

  resetSettings() {
    this.settings = this.getDefaultSettings();
    this.panel.innerHTML = this.renderSettings();
    this.bindEvents();
    this.saveToStorage();
  }

  loadSettings() {
    try {
      const data = localStorage.getItem('solid-geometry-settings');
      if (data) {
        this.settings = { ...this.getDefaultSettings(), ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('solid-geometry-settings', JSON.stringify(this.settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  getSetting(key) {
    return this.settings[key];
  }

  setSetting(key, value) {
    this.settings[key] = value;
    this.saveToStorage();
  }

  onChange(callback) {
    this.callbacks.onChange = callback;
  }

  dispose() {
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }
  }
}
