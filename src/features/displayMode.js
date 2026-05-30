/**
 * DisplayModeManager
 * 显示模式管理器
 */

import * as THREE from 'three';

export class DisplayModeManager {
  constructor() {
    this.currentMode = 'solid';
    this.modes = {
      solid: { wireframe: false, opacity: 1.0, transparent: false },
      wireframe: { wireframe: true, opacity: 1.0, transparent: false },
      dashed: { wireframe: false, opacity: 1.0, transparent: false, dashed: true },
      points: { wireframe: false, opacity: 1.0, transparent: false, points: true }
    };
    this.opacity = 1.0;
  }

  getMode() {
    return this.currentMode;
  }

  setMode(mesh, mode) {
    if (!mesh || !this.modes[mode]) return;
    this.currentMode = mode;
    const config = this.modes[mode];
    mesh.traverse(child => {
      if (child.isMesh) {
        if (config.points) {
          child.material.wireframe = false;
          child.material.transparent = true;
          child.material.opacity = 0.8;
        } else if (config.dashed) {
          child.material.wireframe = false;
          child.material.transparent = true;
          child.material.opacity = 0.6;
        } else {
          child.material.wireframe = config.wireframe;
          child.material.transparent = config.transparent;
          child.material.opacity = config.opacity;
        }
        child.material.needsUpdate = true;
      }
    });
  }

  setOpacity(mesh, opacity) {
    if (!mesh) return;
    this.opacity = Math.max(0, Math.min(1, opacity));
    mesh.traverse(child => {
      if (child.isMesh && !child.material.wireframe) {
        child.material.transparent = this.opacity < 1;
        child.material.opacity = this.opacity;
        child.material.needsUpdate = true;
      }
    });
  }

  getOpacity() {
    return this.opacity;
  }

  cycleMode(mesh) {
    const modes = Object.keys(this.modes);
    const currentIndex = modes.indexOf(this.currentMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.setMode(mesh, modes[nextIndex]);
    return modes[nextIndex];
  }
}
