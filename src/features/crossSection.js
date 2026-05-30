/**
 * CrossSectionManager
 * 截面管理器
 */

import * as THREE from 'three';
import { COLORS } from '../utils/constants.js';

export class CrossSectionManager {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.isActive = false;
    this.faceMeshes = [];
    this.selectedVertices = [];
    this.previewPoint = null;
    this.previewMarker = null;
    this.sectionMesh = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.onModeChange = null;
    this.onVertexSelect = null;
  }

  setFaceMeshes(meshes) {
    this.faceMeshes = meshes;
  }

  toggleMode() {
    this.isActive = !this.isActive;
    if (!this.isActive) {
      this.clearSection();
      this.clearPreview();
    }
    if (this.onModeChange) {
      this.onModeChange(this.isActive);
    }
    return this.isActive;
  }

  toggleVertexSelection(name) {
    const index = this.selectedVertices.indexOf(name);
    if (index === -1) {
      this.selectedVertices.push(name);
    } else {
      this.selectedVertices.splice(index, 1);
    }
    if (this.onVertexSelect) {
      this.onVertexSelect({ index, name });
    }
  }

  handleClick(event) {
    if (!this.isActive) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.faceMeshes, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const vertex = this.findNearestVertex(point);
      if (vertex) {
        this.toggleVertexSelection(vertex.name);
      }
    }
  }

  updatePreviewPoint(event) {
    if (!this.isActive) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.faceMeshes, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      this.showPreview(point);
    } else {
      this.clearPreview();
    }
  }

  findNearestVertex(point) {
    let nearest = null;
    let minDist = 0.3;

    this.faceMeshes.forEach(mesh => {
      if (!mesh.geometry) return;
      const positions = mesh.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const v = new THREE.Vector3(
          positions.getX(i),
          positions.getY(i),
          positions.getZ(i)
        );
        mesh.localToWorld(v);
        const dist = point.distanceTo(v);
        if (dist < minDist) {
          minDist = dist;
          nearest = { name: String.fromCharCode(65 + i), position: v };
        }
      }
    });

    return nearest;
  }

  showPreview(point) {
    this.clearPreview();
    const geometry = new THREE.SphereGeometry(0.05, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff9800 });
    this.previewMarker = new THREE.Mesh(geometry, material);
    this.previewMarker.position.copy(point);
    this.scene.add(this.previewMarker);
  }

  clearPreview() {
    if (this.previewMarker) {
      this.scene.remove(this.previewMarker);
      this.previewMarker.geometry.dispose();
      this.previewMarker.material.dispose();
      this.previewMarker = null;
    }
  }

  createSection() {
    if (this.selectedVertices.length < 3) {
      return false;
    }

    this.clearSection();

    const points = [];
    this.selectedVertices.forEach(name => {
      const vertex = this.findVertexByName(name);
      if (vertex) {
        points.push(vertex);
      }
    });

    if (points.length < 3) return false;

    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].z);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i].x, points[i].z);
    }
    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff9800,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });

    this.sectionMesh = new THREE.Mesh(geometry, material);
    this.sectionMesh.rotation.x = -Math.PI / 2;
    this.scene.add(this.sectionMesh);

    return true;
  }

  findVertexByName(name) {
    for (const mesh of this.faceMeshes) {
      if (!mesh.geometry) continue;
      const positions = mesh.geometry.attributes.position;
      const charCode = name.charCodeAt(0) - 65;
      if (charCode >= 0 && charCode < positions.count) {
        const v = new THREE.Vector3(
          positions.getX(charCode),
          positions.getY(charCode),
          positions.getZ(charCode)
        );
        mesh.localToWorld(v);
        return v;
      }
    }
    return null;
  }

  clearSection() {
    if (this.sectionMesh) {
      this.scene.remove(this.sectionMesh);
      this.sectionMesh.geometry.dispose();
      this.sectionMesh.material.dispose();
      this.sectionMesh = null;
    }
    this.selectedVertices = [];
  }

  dispose() {
    this.clearSection();
    this.clearPreview();
  }
}
