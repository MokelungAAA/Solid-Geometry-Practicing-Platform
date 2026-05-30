/**
 * UnfoldManager
 * 几何体展开/折叠管理器
 */

import * as THREE from 'three';

export class UnfoldManager {
  constructor() {
    this.isUnfolded = false;
    this.unfoldConfigs = {
      cube: [
        { face: 'front', position: new THREE.Vector3(0, 0, 1), rotation: new THREE.Euler(0, 0, 0) },
        { face: 'back', position: new THREE.Vector3(0, 0, -1), rotation: new THREE.Euler(0, Math.PI, 0) },
        { face: 'left', position: new THREE.Vector3(-1, 0, 0), rotation: new THREE.Euler(0, -Math.PI/2, 0) },
        { face: 'right', position: new THREE.Vector3(1, 0, 0), rotation: new THREE.Euler(0, Math.PI/2, 0) },
        { face: 'top', position: new THREE.Vector3(0, 1, 0), rotation: new THREE.Euler(-Math.PI/2, 0, 0) },
        { face: 'bottom', position: new THREE.Vector3(0, -1, 0), rotation: new THREE.Euler(Math.PI/2, 0, 0) }
      ]
    };
  }

  unfold(geometry, type) {
    if (!geometry || this.isUnfolded) return;
    this.isUnfolded = true;
    const config = this.unfoldConfigs[type];
    if (!config) return;
    const faces = [];
    geometry.traverse(child => {
      if (child.isMesh) {
        faces.push(child);
      }
    });
    faces.forEach((face, index) => {
      if (index < config.length) {
        const target = config[index];
        if (typeof gsap !== 'undefined') {
          gsap.to(face.position, {
            x: target.position.x * 1.5,
            y: target.position.y * 1.5,
            z: target.position.z * 1.5,
            duration: 1,
            ease: 'power2.out'
          });
          gsap.to(face.rotation, {
            x: target.rotation.x,
            y: target.rotation.y,
            z: target.rotation.z,
            duration: 1,
            ease: 'power2.out'
          });
        } else {
          face.position.copy(target.position).multiplyScalar(1.5);
          face.rotation.copy(target.rotation);
        }
      }
    });
  }

  fold(geometry) {
    if (!geometry || !this.isUnfolded) return;
    this.isUnfolded = false;
    geometry.traverse(child => {
      if (child.isMesh) {
        if (typeof gsap !== 'undefined') {
          gsap.to(child.position, { x: 0, y: 0, z: 0, duration: 1, ease: 'power2.inOut' });
          gsap.to(child.rotation, { x: 0, y: 0, z: 0, duration: 1, ease: 'power2.inOut' });
        } else {
          child.position.set(0, 0, 0);
          child.rotation.set(0, 0, 0);
        }
      }
    });
  }

  toggle(geometry, type) {
    if (this.isUnfolded) {
      this.fold(geometry);
    } else {
      this.unfold(geometry, type);
    }
    return this.isUnfolded;
  }

  canUnfold(type) {
    return !!this.unfoldConfigs[type];
  }
}
