/**
 * SceneManager
 * Three.js 场景管理器
 */

import * as THREE from 'three';
import { COLORS } from '../utils/constants.js';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.objects = new Map();
    
    this.init();
  }

  init() {
    // 设置背景色
    this.scene.background = new THREE.Color(COLORS.background);
    
    // 添加环境光
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);
    
    // 添加方向光
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(5, 10, 7);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(this.directionalLight);
    
    // 添加辅助光
    this.fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    this.fillLight.position.set(-5, 5, -5);
    this.scene.add(this.fillLight);
    
    // 添加网格地面
    this.addGrid();
  }

  addGrid() {
    const gridHelper = new THREE.GridHelper(10, 10, 0xcccccc, 0xeeeeee);
    gridHelper.position.y = -0.01;
    this.scene.add(gridHelper);
  }

  add(key, object) {
    this.objects.set(key, object);
    this.scene.add(object);
    return object;
  }

  remove(key) {
    const object = this.objects.get(key);
    if (object) {
      this.scene.remove(object);
      this.objects.delete(key);
    }
    return object;
  }

  get(key) {
    return this.objects.get(key);
  }

  clear() {
    this.objects.forEach((object, key) => {
      this.scene.remove(object);
    });
    this.objects.clear();
  }

  setBackground(color) {
    this.scene.background = new THREE.Color(color);
  }

  getScene() {
    return this.scene;
  }

  update() {
    // 更新逻辑（如果需要）
  }
}
