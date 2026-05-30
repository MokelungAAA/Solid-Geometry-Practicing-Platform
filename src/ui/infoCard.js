/**
 * InfoCardManager
 * 几何体信息卡片管理器
 */

import { GEOMETRY_CONFIGS } from '../utils/constants.js';
import { GEOMETRY_DETAILS } from '../geometry/configs.js';

export class InfoCardManager {
  constructor() {
    this.card = document.getElementById('geometry-info-card');
    this.currentGeometry = null;
  }

  show(type, params) {
    const config = GEOMETRY_CONFIGS[type];
    const details = GEOMETRY_DETAILS[type];
    
    if (!config || !details) return;

    this.currentGeometry = { type, params };
    
    // 计算属性
    const volume = details.volume(params);
    const surfaceArea = details.surfaceArea(params);
    
    // 构建卡片内容
    this.card.innerHTML = `
      <div class="info-card-header">
        <h3 class="info-card-title">${config.name}</h3>
        <button class="btn-icon btn-ghost" id="close-info-card">✕</button>
      </div>
      <div class="info-card-body">
        <p class="info-card-description">${config.description}</p>
        <div class="info-card-stats">
          <div class="stat-item">
            <span class="stat-value">${details.vertices === 0 ? '∞' : details.vertices}</span>
            <span class="stat-label">顶点</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${details.edges === 0 ? '∞' : details.edges}</span>
            <span class="stat-label">棱</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${details.faces}</span>
            <span class="stat-label">面</span>
          </div>
        </div>
        <div class="info-card-formulas">
          <div class="formula-item">
            <span class="formula-label">体积</span>
            <span class="formula-value">${volume.toFixed(2)}</span>
          </div>
          <div class="formula-item">
            <span class="formula-label">表面积</span>
            <span class="formula-value">${surfaceArea.toFixed(2)}</span>
          </div>
        </div>
        <div class="info-card-faces">
          <h4>面的构成</h4>
          <ul>
            ${details.faceTypes.map(face => `<li>${face}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
    
    // 显示卡片
    this.card.style.display = 'block';
    
    // 绑定关闭按钮
    const closeBtn = document.getElementById('close-info-card');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }
  }

  hide() {
    this.card.style.display = 'none';
    this.currentGeometry = null;
  }

  toggle(type, params) {
    if (this.currentGeometry && this.currentGeometry.type === type) {
      this.hide();
    } else {
      this.show(type, params);
    }
  }

  isVisible() {
    return this.card.style.display !== 'none';
  }
}
