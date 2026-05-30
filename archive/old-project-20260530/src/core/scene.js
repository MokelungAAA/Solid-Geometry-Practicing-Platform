/**
 * 场景管理器
 * 负责Three.js场景的创建和管理
 */

import * as THREE from 'three';

export class SceneManager {
    constructor() {
        this.scene = null;
        this.gridHelper = null;
        this.axesGroup = null;  // 坐标轴组（包含线条、箭头、标签）
        this.groundPlane = null;
        this.gridVisible = true;
        this.axesVisible = true;

        this.init();
    }

    /**
     * 初始化场景
     */
    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1e1e2e);

        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // 添加方向光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // 添加辅助元素
        this.createGrid();
        this.createAxes();
        this.createGroundPlane();
    }

    /**
     * 创建地面网格
     */
    createGrid() {
        this.gridHelper = new THREE.GridHelper(10, 10, 0x3a3a50, 0x2a2a3e);
        this.gridHelper.position.y = -2;
        this.scene.add(this.gridHelper);
    }

    /**
     * 创建坐标轴
     */
    createAxes() {
        const axisLength = 4;
        const arrowSize = 0.15;

        // 创建坐标轴组
        this.axesGroup = new THREE.Group();

        // X轴 (红色)
        const xMaterial = new THREE.LineBasicMaterial({ color: 0xe68a8a, linewidth: 2 });
        const xPoints = [new THREE.Vector3(-axisLength, 0, 0), new THREE.Vector3(axisLength, 0, 0)];
        const xGeometry = new THREE.BufferGeometry().setFromPoints(xPoints);
        const xLine = new THREE.Line(xGeometry, xMaterial);
        this.axesGroup.add(xLine);

        // Y轴 (绿色)
        const yMaterial = new THREE.LineBasicMaterial({ color: 0x8ae6a0, linewidth: 2 });
        const yPoints = [new THREE.Vector3(0, -axisLength, 0), new THREE.Vector3(0, axisLength, 0)];
        const yGeometry = new THREE.BufferGeometry().setFromPoints(yPoints);
        const yLine = new THREE.Line(yGeometry, yMaterial);
        this.axesGroup.add(yLine);

        // Z轴 (蓝色)
        const zMaterial = new THREE.LineBasicMaterial({ color: 0x89cff0, linewidth: 2 });
        const zPoints = [new THREE.Vector3(0, 0, -axisLength), new THREE.Vector3(0, 0, axisLength)];
        const zGeometry = new THREE.BufferGeometry().setFromPoints(zPoints);
        const zLine = new THREE.Line(zGeometry, zMaterial);
        this.axesGroup.add(zLine);

        // 箭头
        const arrowXGeo = new THREE.ConeGeometry(arrowSize, arrowSize * 2, 8);
        const arrowX = new THREE.Mesh(arrowXGeo, new THREE.MeshBasicMaterial({ color: 0xe68a8a }));
        arrowX.position.set(axisLength, 0, 0);
        arrowX.rotation.z = -Math.PI / 2;
        this.axesGroup.add(arrowX);

        const arrowY = new THREE.Mesh(arrowXGeo.clone(), new THREE.MeshBasicMaterial({ color: 0x8ae6a0 }));
        arrowY.position.set(0, axisLength, 0);
        this.axesGroup.add(arrowY);

        const arrowZ = new THREE.Mesh(arrowXGeo.clone(), new THREE.MeshBasicMaterial({ color: 0x89cff0 }));
        arrowZ.position.set(0, 0, axisLength);
        arrowZ.rotation.x = Math.PI / 2;
        this.axesGroup.add(arrowZ);

        // 标签
        this.axisLabels = {
            x: this.createAxisLabel('X', 0xe68a8a, [axisLength + 0.3, 0, 0]),
            y: this.createAxisLabel('Y', 0x8ae6a0, [0, axisLength + 0.3, 0]),
            z: this.createAxisLabel('Z', 0x89cff0, [0, 0, axisLength + 0.3])
        };

        // 将坐标轴组添加到场景
        this.scene.add(this.axesGroup);
    }

    /**
     * 创建轴标签
     */
    createAxisLabel(text, color, position) {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 16, 16);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(...position);
        sprite.scale.set(0.5, 0.5, 1);
        this.axesGroup.add(sprite);  // 添加到坐标轴组

        return sprite;
    }

    /**
     * 创建地面平面
     */
    createGroundPlane() {
        const geometry = new THREE.PlaneGeometry(20, 20);
        const material = new THREE.MeshStandardMaterial({
            color: 0x1e1e2e,
            roughness: 0.8,
            metalness: 0.2,
            transparent: true,
            opacity: 0.5
        });
        this.groundPlane = new THREE.Mesh(geometry, material);
        this.groundPlane.rotation.x = -Math.PI / 2;
        this.groundPlane.position.y = -2;
        this.groundPlane.receiveShadow = true;
        this.scene.add(this.groundPlane);
    }

    /**
     * 切换网格显示
     */
    toggleGrid() {
        if (this.gridHelper) {
            this.gridHelper.visible = !this.gridHelper.visible;
            this.gridVisible = this.gridHelper.visible;
        }
    }

    /**
     * 切换坐标轴显示
     */
    toggleAxes() {
        if (this.axesGroup) {
            this.axesGroup.visible = !this.axesGroup.visible;
            this.axesVisible = this.axesGroup.visible;
        }
    }

    /**
     * 获取场景
     */
    getScene() {
        return this.scene;
    }
}
