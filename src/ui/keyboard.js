/**
 * KeyboardManager
 * 键盘快捷键管理
 */

export class KeyboardManager {
  constructor() {
    this.shortcuts = {};
    this.isEnabled = true;
    this.init();
  }

  init() {
    this._boundHandleKeydown = (e) => this.handleKeydown(e);
    document.addEventListener('keydown', this._boundHandleKeydown);
  }

  register(key, callback, description = '') {
    this.shortcuts[key] = { callback, description };
  }

  unregister(key) {
    delete this.shortcuts[key];
  }

  handleKeydown(e) {
    if (!this.isEnabled) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      return;
    }
    const key = this.getKeyString(e);
    if (this.shortcuts[key]) {
      e.preventDefault();
      this.shortcuts[key].callback(e);
    }
  }

  getKeyString(e) {
    const parts = [];
    if (e.ctrlKey) parts.push('ctrl');
    if (e.altKey) parts.push('alt');
    if (e.shiftKey) parts.push('shift');
    if (e.metaKey) parts.push('meta');
    parts.push(e.key.toLowerCase());
    return parts.join('+');
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  getShortcuts() {
    return Object.entries(this.shortcuts).map(([key, value]) => ({
      key,
      description: value.description
    }));
  }

  showHelp() {
    const shortcuts = this.getShortcuts();
    const helpHtml = shortcuts.map(s => `<div><kbd>${s.key}</kbd>: ${s.description}</div>`).join('');
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--md-surface);
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      z-index: 10000;
      max-width: 400px;
      width: 90%;
    `;
    modal.innerHTML = `
      <h2 style="margin: 0 0 16px 0;">键盘快捷键</h2>
      ${helpHtml}
      <button id="keyboard-help-close" style="margin-top: 16px; padding: 8px 16px; border-radius: 8px; border: none; background: var(--md-primary); color: white; cursor: pointer;">关闭</button>
    `;
    document.body.appendChild(modal);
    document.getElementById('keyboard-help-close').addEventListener('click', () => modal.remove());
  }

  registerDefaults() {
    this.register('r', () => {
      if (window.app) window.app.resetCamera();
    }, '重置相机');
    this.register('w', () => {
      if (window.app) window.app.toggleWireframe();
    }, '切换线框');
    this.register('c', () => {
      if (window.app) window.app.toggleCrossSection();
    }, '切换截面');
    this.register('i', () => {
      if (window.app) window.app.toggleInfo();
    }, '切换信息');
    this.register('g', () => {
      if (window.app) window.app.toggleGrid();
    }, '切换网格');
    this.register('a', () => {
      if (window.app) window.app.toggleAxes();
    }, '切换坐标轴');
    this.register('l', () => {
      if (window.app) window.app.toggleLabels();
    }, '切换标签');
    this.register('f', () => {
      if (window.app) window.app.toggleFullscreen();
    }, '全屏');
    this.register('?', () => {
      this.showHelp();
    }, '显示帮助');
    this.register('escape', () => {
      if (window.app) window.app.closeAll();
    }, '关闭');
  }

  dispose() {
    if (this._boundHandleKeydown) {
      document.removeEventListener('keydown', this._boundHandleKeydown);
      this._boundHandleKeydown = null;
    }
    this.shortcuts = {};
  }
}
