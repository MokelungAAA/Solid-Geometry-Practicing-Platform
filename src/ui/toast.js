/**
 * ToastManager
 * 消息提示管理器
 */

export class ToastManager {
  constructor() {
    this.container = document.getElementById('toast-container');
    this.toasts = [];
    this.maxToasts = 3;
  }

  show(message, type = 'info', duration = 3000) {
    const toast = this.createToast(message, type);
    this.container.appendChild(toast);
    this.toasts.push(toast);

    // 限制显示数量
    if (this.toasts.length > this.maxToasts) {
      this.remove(this.toasts[0]);
    }

    // 自动消失
    setTimeout(() => {
      this.remove(toast);
    }, duration);

    return toast;
  }

  createToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${this.getIcon(type)}</span>
        <span class="toast-message">${message}</span>
      </div>
    `;

    // 添加动画
    toast.style.animation = 'slideIn 0.3s ease-out';

    return toast;
  }

  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  remove(toast) {
    if (!toast || !toast.parentNode) return;

    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      const index = this.toasts.indexOf(toast);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    }, 300);
  }

  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }

  progress(message, progress = 0) {
    const toast = this.createProgressToast(message, progress);
    this.container.appendChild(toast);
    this.toasts.push(toast);
    return toast;
  }

  createProgressToast(message, progress) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-progress';
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-message">${message}</span>
        <div class="toast-progress-bar">
          <div class="toast-progress-fill" style="width: ${progress}%"></div>
        </div>
        <span class="toast-progress-text">${progress}%</span>
      </div>
    `;
    toast.style.animation = 'toast-slide-in 0.3s ease-out';
    return toast;
  }

  updateProgress(toast, progress) {
    if (!toast) return;
    const fill = toast.querySelector('.toast-progress-fill');
    const text = toast.querySelector('.toast-progress-text');
    if (fill) fill.style.width = `${progress}%`;
    if (text) text.textContent = `${progress}%`;
    if (progress >= 100) {
      setTimeout(() => this.remove(toast), 1000);
    }
  }

  dismissAll() {
    [...this.toasts].forEach(toast => this.remove(toast));
  }

  setPosition(position) {
    if (!this.container) return;
    const positions = {
      'top-right': { top: '20px', right: '20px', bottom: 'auto', left: 'auto' },
      'top-left': { top: '20px', left: '20px', bottom: 'auto', right: 'auto' },
      'bottom-right': { bottom: '20px', right: '20px', top: 'auto', left: 'auto' },
      'bottom-left': { bottom: '20px', left: '20px', top: 'auto', right: 'auto' },
      'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)', bottom: 'auto', right: 'auto' },
      'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%)', top: 'auto', right: 'auto' }
    };
    const pos = positions[position] || positions['top-right'];
    Object.assign(this.container.style, pos);
  }

  setMaxToasts(max) {
    this.maxToasts = max;
  }
}
