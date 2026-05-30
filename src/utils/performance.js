/**
 * PerformanceManager
 * 性能优化管理
 */

export class PerformanceManager {
  constructor() {
    this.metrics = {
      fps: 0,
      frameTime: 0,
      drawCalls: 0,
      triangles: 0,
      points: 0,
      lines: 0,
      memory: 0
    };
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsHistory = [];
    this.maxFpsHistory = 60;
    this.isMonitoring = false;
  }

  startMonitoring() {
    this.isMonitoring = true;
    this.update();
  }

  stopMonitoring() {
    this.isMonitoring = false;
  }

  update() {
    if (!this.isMonitoring) return;
    const now = performance.now();
    const delta = now - this.lastTime;
    this.frameCount++;
    if (delta >= 1000) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / delta);
      this.metrics.frameTime = Math.round(delta / this.frameCount);
      this.fpsHistory.push(this.metrics.fps);
      if (this.fpsHistory.length > this.maxFpsHistory) {
        this.fpsHistory.shift();
      }
      this.frameCount = 0;
      this.lastTime = now;
    }
    requestAnimationFrame(() => this.update());
  }

  getMetrics() {
    return { ...this.metrics };
  }

  getFps() {
    return this.metrics.fps;
  }

  getFrameTime() {
    return this.metrics.frameTime;
  }

  getAverageFps() {
    if (this.fpsHistory.length === 0) return 0;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  getMinFps() {
    if (this.fpsHistory.length === 0) return 0;
    return Math.min(...this.fpsHistory);
  }

  getMaxFps() {
    if (this.fpsHistory.length === 0) return 0;
    return Math.max(...this.fpsHistory);
  }

  getFpsHistory() {
    return [...this.fpsHistory];
  }

  updateRendererMetrics(renderer) {
    if (!renderer) return;
    const info = renderer.info;
    this.metrics.drawCalls = info.render.calls;
    this.metrics.triangles = info.render.triangles;
    this.metrics.points = info.render.points;
    this.metrics.lines = info.render.lines;
    if (info.memory) {
      this.metrics.memory = info.memory.geometries;
    }
  }

  getPerformanceLevel() {
    const avgFps = this.getAverageFps();
    if (avgFps >= 55) return 'high';
    if (avgFps >= 30) return 'medium';
    return 'low';
  }

  getRecommendedSettings() {
    const level = this.getPerformanceLevel();
    switch (level) {
      case 'high':
        return {
          antialias: true,
          shadows: true,
          pixelRatio: window.devicePixelRatio,
          maxLights: 8,
          textureQuality: 'high'
        };
      case 'medium':
        return {
          antialias: true,
          shadows: false,
          pixelRatio: Math.min(window.devicePixelRatio, 1.5),
          maxLights: 4,
          textureQuality: 'medium'
        };
      case 'low':
        return {
          antialias: false,
          shadows: false,
          pixelRatio: 1,
          maxLights: 2,
          textureQuality: 'low'
        };
      default:
        return {
          antialias: true,
          shadows: false,
          pixelRatio: window.devicePixelRatio,
          maxLights: 4,
          textureQuality: 'medium'
        };
    }
  }

  optimizeRenderer(renderer) {
    if (!renderer) return;
    const settings = this.getRecommendedSettings();
    renderer.setPixelRatio(settings.pixelRatio);
    renderer.antialias = settings.antialias;
    renderer.shadowMap.enabled = settings.shadows;
  }

  dispose() {
    this.isMonitoring = false;
    this.fpsHistory = [];
  }
}
