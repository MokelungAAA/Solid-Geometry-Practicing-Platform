/**
 * UnfoldManager
 * 几何体展开/折叠管理器
 */

import * as THREE from 'three';
import gsap from 'gsap';

export class UnfoldManager {
  constructor(scene, geometryFactory) {
    this.scene = scene;
    this.geometryFactory = geometryFactory;
    this.unfoldGroup = null;
    this.isUnfolded = false;
    this.progress = 0;
    this.animation = null;
  }

  createUnfoldGroup(config, vertices) {
    this.clear();
    this.unfoldGroup = new THREE.Group();
    this.unfoldGroup.name = 'unfold';

    if (!config.faces || config.type === 'curved') {
      return;
    }

    const center = new THREE.Vector3();
    Object.values(vertices).forEach(v => center.add(v));
    if (Object.keys(vertices).length > 0) {
      center.divideScalar(Object.keys(vertices).length);
    }

    Object.entries(config.faces).forEach(([faceName, vertexNames]) => {
      if (!Array.isArray(vertexNames)) return;

      const points = vertexNames.map(name => vertices[name]).filter(v => v);
      if (points.length < 3) return;

      const faceCenter = new THREE.Vector3();
      points.forEach(p => faceCenter.add(p));
      faceCenter.divideScalar(points.length);

      const geometry = new THREE.BufferGeometry();
      const verts = [];
      const indices = [];

      points.forEach(p => verts.push(p.x, p.y, p.z));
      for (let i = 1; i < points.length - 1; i++) {
        indices.push(0, i, i + 1);
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();

      const material = new THREE.MeshStandardMaterial({
        color: 0x6c8ebf,
        metalness: 0.1,
        roughness: 0.6,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = `unfold_${faceName}`;
      mesh.userData = {
        faceName,
        originalPosition: faceCenter.clone(),
        vertexNames
      };
      this.unfoldGroup.add(mesh);
    });

    this.unfoldGroup.visible = false;
    this.scene.add(this.unfoldGroup);
  }

  clear() {
    if (this.unfoldGroup) {
      this.unfoldGroup.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.scene.remove(this.unfoldGroup);
      this.unfoldGroup = null;
    }
    this.isUnfolded = false;
    this.progress = 0;
    if (this.animation) {
      this.animation.kill();
      this.animation = null;
    }
  }

  animate(target) {
    if (!this.unfoldGroup) return;

    if (this.animation) {
      this.animation.kill();
    }

    const duration = 1;
    const ease = 'power2.inOut';

    if (target === 1) {
      this.unfoldGroup.visible = true;
      this.isUnfolded = true;

      this.animation = gsap.to(this, {
        progress: 1,
        duration,
        ease,
        onUpdate: () => this.updateUnfold()
      });
    } else {
      this.isUnfolded = false;

      this.animation = gsap.to(this, {
        progress: 0,
        duration,
        ease,
        onUpdate: () => this.updateUnfold(),
        onComplete: () => {
          if (this.unfoldGroup) {
            this.unfoldGroup.visible = false;
          }
        }
      });
    }
  }

  setProgress(progress) {
    this.progress = Math.max(0, Math.min(1, progress));
    if (this.unfoldGroup) {
      this.unfoldGroup.visible = this.progress > 0;
      this.isUnfolded = this.progress > 0.5;
      this.updateUnfold();
    }
  }

  updateUnfold() {
    if (!this.unfoldGroup) return;

    this.unfoldGroup.children.forEach(face => {
      const original = face.userData.originalPosition;
      if (!original) return;

      const direction = original.clone().normalize();
      const offset = direction.multiplyScalar(this.progress * 2);
      face.position.copy(original).add(offset);
      face.material.opacity = 0.3 + this.progress * 0.5;
    });
  }
}
