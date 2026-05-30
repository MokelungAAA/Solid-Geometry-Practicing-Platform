/**
 * CrossSectionManager
 * 截面管理器
 */

import * as THREE from 'three';
import { COLORS } from '../utils/constants.js';

export class CrossSectionManager {
  constructor(scene) {
    this.scene = scene;
    this.plane = null;
    this.crossSection = null;
    this.isActive = false;
    this.planePosition = 0;
    this.planeNormal = new THREE.Vector3(0, 1, 0);
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.selectedVertices = [];
    this.snapDistance = 0.2;
  }

  activate(geometry) {
    if (this.isActive) return;
    this.isActive = true;
    this.geometry = geometry;
    this.createPlane();
    this.updateCrossSection();
  }

  deactivate() {
    if (!this.isActive) return;
    this.isActive = false;
    this.clearPlane();
    this.clearCrossSection();
    this.clearVertices();
  }

  createPlane() {
    const planeGeometry = new THREE.PlaneGeometry(5, 5);
    const planeMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.highlight,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.plane.rotation.x = -Math.PI / 2;
    this.plane.position.y = this.planePosition;
    this.scene.add(this.plane);
  }

  clearPlane() {
    if (this.plane) {
      this.scene.remove(this.plane);
      this.plane.geometry.dispose();
      this.plane.material.dispose();
      this.plane = null;
    }
  }

  updateCrossSection() {
    if (!this.isActive || !this.geometry) return;
    this.clearCrossSection();
    const crossSectionGeometry = this.createCrossSectionGeometry();
    if (!crossSectionGeometry) return;
    const crossSectionMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.primaryLight,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    this.crossSection = new THREE.Mesh(crossSectionGeometry, crossSectionMaterial);
    this.crossSection.rotation.x = -Math.PI / 2;
    this.crossSection.position.y = this.planePosition;
    this.scene.add(this.crossSection);
  }

  clearCrossSection() {
    if (this.crossSection) {
      this.scene.remove(this.crossSection);
      this.crossSection.geometry.dispose();
      this.crossSection.material.dispose();
      this.crossSection = null;
    }
  }

  createCrossSectionGeometry() {
    const type = this.geometry.userData.type;
    const params = this.geometry.userData.params;
    const radius = 0.5;
    return new THREE.CircleGeometry(radius, 32);
  }

  detectVertices(event, camera) {
    if (!this.isActive || !this.geometry) return null;
    const rect = event.target.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, camera);
    const intersects = this.raycaster.intersectObject(this.geometry, true);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      return this.findNearestVertex(point);
    }
    return null;
  }

  findNearestVertex(point) {
    let nearest = null;
    let minDistance = this.snapDistance;
    this.geometry.traverse(child => {
      if (child.isMesh && child.geometry) {
        const positions = child.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const vertex = new THREE.Vector3(
            positions.getX(i),
            positions.getY(i),
            positions.getZ(i)
          );
          child.localToWorld(vertex);
          const distance = point.distanceTo(vertex);
          if (distance < minDistance) {
            minDistance = distance;
            nearest = vertex;
          }
        }
      }
    });
    return nearest;
  }

  selectVertex(vertex) {
    if (!vertex) return;
    this.selectedVertices.push(vertex);
    this.createVertexMarker(vertex);
    if (this.selectedVertices.length >= 3) {
      this.generateCrossSection();
    }
  }

  createVertexMarker(vertex) {
    const geometry = new THREE.SphereGeometry(0.05);
    const material = new THREE.MeshBasicMaterial({ color: COLORS.highlight });
    const marker = new THREE.Mesh(geometry, material);
    marker.position.copy(vertex);
    marker.userData.isVertexMarker = true;
    this.scene.add(marker);
  }

  clearVertices() {
    this.selectedVertices = [];
    const markers = [];
    this.scene.traverse(child => {
      if (child.userData.isVertexMarker) {
        markers.push(child);
      }
    });
    markers.forEach(marker => {
      this.scene.remove(marker);
      marker.geometry.dispose();
      marker.material.dispose();
    });
  }

  generateCrossSection() {
    if (this.selectedVertices.length < 3) return;
    this.clearCrossSection();
    const shape = new THREE.Shape();
    shape.moveTo(this.selectedVertices[0].x, this.selectedVertices[0].z);
    for (let i = 1; i < this.selectedVertices.length; i++) {
      shape.lineTo(this.selectedVertices[i].x, this.selectedVertices[i].z);
    }
    shape.closePath();
    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshStandardMaterial({
      color: COLORS.primaryLight,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    this.crossSection = new THREE.Mesh(geometry, material);
    this.crossSection.rotation.x = -Math.PI / 2;
    this.crossSection.position.y = this.planePosition;
    this.scene.add(this.crossSection);
    this.clearVertices();
  }

  getCrossSectionArea() {
    if (!this.crossSection) return 0;
    const geometry = this.crossSection.geometry;
    const positions = geometry.attributes.position;
    let area = 0;
    for (let i = 0; i < positions.count; i++) {
      const x1 = positions.getX(i);
      const y1 = positions.getY(i);
      const x2 = positions.getX((i + 1) % positions.count);
      const y2 = positions.getY((i + 1) % positions.count);
      area += x1 * y2 - x2 * y1;
    }
    return Math.abs(area) / 2;
  }

  setPlanePosition(position) {
    this.planePosition = position;
    if (this.plane) this.plane.position.y = position;
    if (this.crossSection) this.crossSection.position.y = position;
    this.updateCrossSection();
  }

  setPlaneNormal(normal) {
    this.planeNormal = normal;
    if (this.plane) this.plane.lookAt(normal);
    this.updateCrossSection();
  }

  update() {
    // 更新逻辑（如果需要）
  }

  dispose() {
    this.deactivate();
  }
}
