/**
 * ResponsiveManager
 * 响应式布局管理
 */

export class ResponsiveManager {
  constructor() {
    this.breakpoints = {
      mobile: 600,
      tablet: 900,
      desktop: 1200,
      large: 1800
    };
    this.currentBreakpoint = this.getBreakpoint();
    this.callbacks = {};
    this.init();
  }

  init() {
    window.addEventListener('resize', () => {
      const newBreakpoint = this.getBreakpoint();
      if (newBreakpoint !== this.currentBreakpoint) {
        const oldBreakpoint = this.currentBreakpoint;
        this.currentBreakpoint = newBreakpoint;
        this.onBreakpointChange(oldBreakpoint, newBreakpoint);
      }
    });
  }

  getBreakpoint() {
    const width = window.innerWidth;
    if (width < this.breakpoints.mobile) return 'mobile';
    if (width < this.breakpoints.tablet) return 'tablet';
    if (width < this.breakpoints.desktop) return 'desktop';
    return 'large';
  }

  isMobile() {
    return this.currentBreakpoint === 'mobile';
  }

  isTablet() {
    return this.currentBreakpoint === 'tablet';
  }

  isDesktop() {
    return this.currentBreakpoint === 'desktop' || this.currentBreakpoint === 'large';
  }

  isLarge() {
    return this.currentBreakpoint === 'large';
  }

  onBreakpointChange(oldBreakpoint, newBreakpoint) {
    if (this.callbacks.onChange) {
      this.callbacks.onChange(oldBreakpoint, newBreakpoint);
    }
    this.applyResponsiveLayout(newBreakpoint);
  }

  applyResponsiveLayout(breakpoint) {
    const leftPanel = document.getElementById('sidebar-left');
    const toolbar = document.getElementById('toolbar');
    const canvas = document.getElementById('canvas-wrapper');
    if (!leftPanel || !toolbar || !canvas) return;
    switch (breakpoint) {
      case 'mobile':
        leftPanel.style.display = 'none';
        toolbar.style.flexDirection = 'column';
        toolbar.style.top = '10px';
        toolbar.style.right = '10px';
        toolbar.style.left = 'auto';
        canvas.style.width = '100%';
        break;
      case 'tablet':
        leftPanel.style.display = 'block';
        leftPanel.style.width = '200px';
        toolbar.style.flexDirection = 'column';
        toolbar.style.top = '80px';
        toolbar.style.right = '10px';
        toolbar.style.left = 'auto';
        canvas.style.width = 'calc(100% - 200px)';
        break;
      case 'desktop':
        leftPanel.style.display = 'block';
        leftPanel.style.width = '280px';
        toolbar.style.flexDirection = 'row';
        toolbar.style.top = '80px';
        toolbar.style.right = 'auto';
        toolbar.style.left = '50%';
        toolbar.style.transform = 'translateX(-50%)';
        canvas.style.width = 'calc(100% - 280px)';
        break;
      case 'large':
        leftPanel.style.display = 'block';
        leftPanel.style.width = '320px';
        toolbar.style.flexDirection = 'row';
        toolbar.style.top = '80px';
        toolbar.style.right = 'auto';
        toolbar.style.left = '50%';
        toolbar.style.transform = 'translateX(-50%)';
        canvas.style.width = 'calc(100% - 320px)';
        break;
    }
  }

  onChange(callback) {
    this.callbacks.onChange = callback;
  }

  getOptimalColumns() {
    switch (this.currentBreakpoint) {
      case 'mobile': return 1;
      case 'tablet': return 2;
      case 'desktop': return 3;
      case 'large': return 4;
      default: return 3;
    }
  }

  getOptimalFontSize() {
    switch (this.currentBreakpoint) {
      case 'mobile': return 14;
      case 'tablet': return 15;
      case 'desktop': return 16;
      case 'large': return 18;
      default: return 16;
    }
  }

  getOptimalSpacing() {
    switch (this.currentBreakpoint) {
      case 'mobile': return 8;
      case 'tablet': return 12;
      case 'desktop': return 16;
      case 'large': return 24;
      default: return 16;
    }
  }

  dispose() {
    window.removeEventListener('resize', this.onResize);
  }
}
