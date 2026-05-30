/**
 * 主应用入口
 * 立体几何练习平台
 */

import { SceneManager } from './core/scene.js';
import { CameraManager } from './core/camera.js';
import { RendererManager } from './core/renderer.js';
import { GeometryFactory } from './geometry/factory.js';
import { ViewControlManager } from './features/viewControl.js';
import { CrossSectionManager } from './features/crossSection.js';
import { ToastManager } from './ui/toast.js';
import { InfoCardManager } from './ui/infoCard.js';
import { ToolbarManager } from './ui/toolbar.js';
import { GEOMETRY_TYPES, GEOMETRY_CONFIGS } from './utils/constants.js';

class App {
  constructor() {
    this.container = document.getElementById('scene-container');
    this.geometryList = document.getElementById('geometry-list');
    this.currentGeometry = null;
    this.currentType = null;
    this.init();
  }

  init() {
    this.sceneManager = new SceneManager(this.container);
    this.cameraManager = new CameraManager(this.container);
    this.rendererManager = new RendererManager(this.container);
    this.geometryFactory = new GeometryFactory();
    this.viewControl = new ViewControlManager(
      this.cameraManager.getCamera(),
      this.rendererManager.getRenderer()
    );
    this.crossSectionManager = new CrossSectionManager(this.sceneManager.getScene());
    this.toastManager = new ToastManager();
    this.infoCardManager = new InfoCardManager();
    this.toolbarManager = new ToolbarManager();
    this.initGeometryList();
    this.initToolbar();
    this.initEventListeners();
    this.selectGeometry(GEOMETRY_TYPES.CUBE);
    this.animate();
    this.toastManager.success('欢迎使用立体几何练习平台！');
  }

  initGeometryList() {
    this.geometryList.innerHTML = '';
    Object.entries(GEOMETRY_CONFIGS).forEach(([type, config]) => {
      const item = document.createElement('div');
      item.className = 'geometry-item';
      item.setAttribute('data-type', type);
      item.innerHTML = '<div class="geometry-item-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + this.getGeometryIcon(type) + '</svg></div><span class="geometry-item-name">' + config.name + '</span>';
      item.addEventListener('click', () => this.selectGeometry(type));
      this.geometryList.appendChild(item);
    });
  }

  getGeometryIcon(type) {
    const icons = {
      cube: '<rect x="4" y="4" width="16" height="16" rx="2"/>',
      rectangularBox: '<rect x="2" y="4" width="20" height="16" rx="2"/>',
      triangularPrism: '<polygon points="12,2 22,20 2,20"/>',
      tetrahedron: '<polygon points="12,2 22,20 2,20"/><line x1="12" y1="2" x2="12" y2="20"/>',
      squarePyramid: '<polygon points="12,2 22,20 2,20"/><line x1="2" y1="20" x2="22" y2="20"/>',
      hexagonalPrism: '<polygon points="12,2 22,8 22,16 12,22 2,16 2,8"/>',
      triangularPyramid: '<polygon points="12,2 22,20 2,20"/><line x1="12" y1="2" x2="7" y2="12"/><line x1="12" y1="2" x2="17" y2="12"/>',
      cylinder: '<ellipse cx="12" cy="6" rx="10" ry="4"/><line x1="2" y1="6" x2="2" y2="18"/><line x1="22" y1="6" x2="22" y2="18"/><ellipse cx="12" cy="18" rx="10" ry="4"/>',
      cone: '<ellipse cx="12" cy="18" rx="10" ry="4"/><line x1="12" y1="2" x2="2" y2="18"/><line x1="12" y1="2" x2="22" y2="18"/>',
      sphere: '<circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="10" ry="4"/>'
    };
    return icons[type] || icons.cube;
  }

  initToolbar() {
    this.toolbarManager.init([
      {
        action: 'resetView',
        label: '重置视角',
        tooltip: '重置相机视角',
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
        onClick: () => this.resetView()
      },
      {
        action: 'toggleWireframe',
        label: '线框',
        tooltip: '切换线框显示',
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg>',
        onClick: () => this.toggleWireframe()
      },
      {
        action: 'crossSection',
        label: '截面',
        tooltip: '显示截面',
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>',
        onClick: () => this.toggleCrossSection()
      },
      {
        action: 'info',
        label: '信息',
        tooltip: '显示几何体信息',
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        onClick: () => this.showInfo()
      }
    ]);
  }

  initEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
  }

  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.cameraManager.updateSize(width, height);
    this.rendererManager.updateSize(width, height);
  }

  onKeyDown(e) {
    switch (e.key) {
      case 'r': this.resetView(); break;
      case 'w': this.toggleWireframe(); break;
      case 'c': this.toggleCrossSection(); break;
      case 'i': this.showInfo(); break;
    }
  }

  selectGeometry(type) {
    if (this.currentGeometry) {
      this.sceneManager.remove('currentGeometry');
    }
    document.querySelectorAll('.geometry-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-type') === type);
    });
    const config = GEOMETRY_CONFIGS[type];
    const geometry = this.geometryFactory.create(type, config.defaultParams);
    if (geometry) {
      this.sceneManager.add('currentGeometry', geometry);
      this.currentGeometry = geometry;
      this.currentType = type;
      this.crossSectionManager.deactivate();
      this.infoCardManager.show(type, config.defaultParams);
      this.toastManager.info('已切换到' + config.name);
    }
  }

  resetView() {
    this.viewControl.reset();
    this.toastManager.info('视角已重置');
  }

  toggleWireframe() {
    if (!this.currentGeometry) return;
    const wireframe = this.currentGeometry.children.find(child => child.isLineSegments);
    if (wireframe) {
      wireframe.visible = !wireframe.visible;
      this.toastManager.info(wireframe.visible ? '线框已显示' : '线框已隐藏');
    }
  }

  toggleCrossSection() {
    if (!this.currentGeometry) return;
    if (this.crossSectionManager.isActive) {
      this.crossSectionManager.deactivate();
      this.toastManager.info('截面已隐藏');
    } else {
      this.crossSectionManager.activate(this.currentGeometry);
      this.toastManager.info('截面已显示');
    }
  }

  showInfo() {
    if (!this.currentType) return;
    const config = GEOMETRY_CONFIGS[this.currentType];
    this.infoCardManager.toggle(this.currentType, config.defaultParams);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.viewControl.update();
    this.sceneManager.update();
    this.crossSectionManager.update();
    this.rendererManager.render(
      this.sceneManager.getScene(),
      this.cameraManager.getCamera()
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
