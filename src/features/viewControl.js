/**
 * ViewControlManager
 * 视图控制器（轨道控制器）
 */

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as THREE from 'three';

export class ViewControlManager {
  constructor(camera, renderer) {
    this.camera = camera;
    this.renderer = renderer;
    this.controls = null;
    this.currentView = 'perspective';
    this.viewPresets = {
      front: { position: new THREE.Vector3(0, 0, 5), target: new THREE.Vector3(0, 0, 0) },
      side: { position: new THREE.Vector3(5, 0, 0), target: new THREE.Vector3(0, 0, 0) },
      top: { position: new THREE.Vector3(0, 5, 0), target: new THREE.Vector3(0, 0, 0) },
      perspective: { position: new THREE.Vector3(3, 2, 3), target: new THREE.Vector3(0, 0, 0) }
    };
    this.init();
  }

  init() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 20;
    this.controls.maxPolarAngle = Math.PI;
    this.controls.target.set(0, 0, 0);
  }

  update() {
    if (this.controls) {
      this.controls.update();
    }
  }

  reset() {
    if (this.controls) {
      this.controls.reset();
      this.currentView = 'perspective';
    }
  }

  setView(viewName, duration = 1) {
    const preset = this.viewPresets[viewName];
    if (!preset) return;
    this.currentView = viewName;
    if (typeof gsap !== 'undefined') {
      gsap.to(this.camera.position, {
        x: preset.position.x, y: preset.position.y, z: preset.position.z,
        duration, ease: 'power2.inOut',
        onUpdate: () => this.camera.lookAt(this.controls.target)
      });
      gsap.to(this.controls.target, {
        x: preset.target.x, y: preset.target.y, z: preset.target.z,
        duration, ease: 'power2.inOut'
      });
    } else {
      this.camera.position.copy(preset.position);
      this.controls.target.copy(preset.target);
      this.controls.update();
    }
  }

  getCurrentView() {
    return this.currentView;
  }

  setTarget(x, y, z) {
    if (this.controls) {
      this.controls.target.set(x, y, z);
    }
  }

  enable() {
    if (this.controls) {
      this.controls.enabled = true;
    }
  }

  disable() {
    if (this.controls) {
      this.controls.enabled = false;
    }
  }

  dispose() {
    if (this.controls) {
      this.controls.dispose();
    }
  }
}
