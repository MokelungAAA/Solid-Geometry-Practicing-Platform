// ========================
// Toast通知管理器
// ========================

export class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.maxToasts = 3;

        this.init();
    }

    // ========================
    // 初始化
    // ========================
    init() {
        this.createContainer();
    }

    // ========================
    // 创建容器
    // ========================
    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    // ========================
    // 显示Toast
    // ========================
    show(message, type = 'info', duration = 3000) {
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // 触发动画
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // 自动移除
        if (duration > 0) {
            setTimeout(() => {
                this.hide(toast);
            }, duration);
        }

        // 限制最大数量
        this.limitToasts();

        return toast;
    }

    // ========================
    // 创建Toast元素
    // ========================
    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = this.getIcon(type);
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        return toast;
    }

    // ========================
    // 获取图标
    // ========================
    getIcon(type) {
        const icons = {
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌'
        };
        return icons[type] || icons.info;
    }

    // ========================
    // 隐藏Toast
    // ========================
    hide(toast) {
        toast.classList.remove('show');
        toast.classList.add('hide');

        setTimeout(() => {
            toast.remove();
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300);
    }

    // ========================
    // 限制Toast数量
    // ========================
    limitToasts() {
        while (this.toasts.length > this.maxToasts) {
            const oldest = this.toasts.shift();
            if (oldest) {
                oldest.remove();
            }
        }
    }

    // ========================
    // 快捷方法
    // ========================
    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    warning(message, duration = 3000) {
        return this.show(message, 'warning', duration);
    }

    error(message, duration = 3000) {
        return this.show(message, 'error', duration);
    }

    // ========================
    // 清除所有
    // ========================
    clearAll() {
        this.toasts.forEach(toast => toast.remove());
        this.toasts = [];
    }
}
