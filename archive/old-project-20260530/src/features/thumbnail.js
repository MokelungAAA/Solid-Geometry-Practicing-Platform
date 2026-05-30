/**
 * 几何体缩略图生成器
 * 使用离屏渲染生成几何体的3D预览图
 */

import * as THREE from 'three';

export class ThumbnailGenerator {
    constructor() {
        // 创建离屏渲染器
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(120, 120);
        this.renderer.setClearColor(0x000000, 0);

        // 创建离屏场景
        this.scene = new THREE.Scene();

        // 创建相机
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        this.camera.position.set(3, 2, 3);
        this.camera.lookAt(0, 0, 0);

        // 添加光源
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // 缓存
        this.cache = new Map();
    }

    /**
     * 生成几何体缩略图
     * @param {string} geometryType - 几何体类型
     * @returns {string} - 图片的DataURL
     */
    generateThumbnail(geometryType) {
        // 检查缓存
        if (this.cache.has(geometryType)) {
            return this.cache.get(geometryType);
        }

        // 清除场景中的几何体
        this.clearScene();

        // 创建几何体
        const geometry = this.createGeometry(geometryType);
        if (!geometry) return null;

        // 创建线框
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x1976d2,
            linewidth: 2
        });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);

        // 创建半透明实体
        const meshMaterial = new THREE.MeshPhongMaterial({
            color: 0x1976d2,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geometry, meshMaterial);

        // 创建组
        const group = new THREE.Group();
        group.add(mesh);
        group.add(wireframe);
        this.scene.add(group);

        // 渲染
        this.renderer.render(this.scene, this.camera);

        // 获取图片数据
        const dataUrl = this.renderer.domElement.toDataURL('image/png');

        // 缓存
        this.cache.set(geometryType, dataUrl);

        return dataUrl;
    }

    /**
     * 创建几何体
     */
    createGeometry(type) {
        switch (type) {
            case 'cube':
                return new THREE.BoxGeometry(1.5, 1.5, 1.5);

            case 'rectangularBox':
                return new THREE.BoxGeometry(2, 1.2, 1);

            case 'cylinder':
                return new THREE.CylinderGeometry(0.8, 0.8, 1.5, 16);

            case 'cone':
                return new THREE.ConeGeometry(0.8, 1.5, 16);

            case 'sphere':
                return new THREE.SphereGeometry(1, 16, 16);

            case 'hexagonalPrism':
                // 正三棱柱
                return this.createTriangularPrism();

            case 'squarePyramid':
                // 正四棱锥
                return new THREE.ConeGeometry(0.8, 1.5, 4);

            case 'triangularPyramid':
                // 正四面体
                return new THREE.TetrahedronGeometry(1.2);

            case 'triangularPrism':
                // 三棱柱
                return this.createTriangularPrism();

            case 'frustum':
                // 圆台
                return new THREE.CylinderGeometry(0.8, 1.2, 1.5, 16);

            case 'torus':
                // 圆环
                return new THREE.TorusGeometry(0.8, 0.3, 16, 32);

            default:
                return null;
        }
    }

    /**
     * 创建三棱柱
     */
    createTriangularPrism() {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(1.5, 0);
        shape.lineTo(0.75, Math.sqrt(3) * 1.5 / 2);
        shape.closePath();

        const extrudeSettings = {
            steps: 1,
            depth: 1,
            bevelEnabled: false
        };

        return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    }

    /**
     * 清除场景
     */
    clearScene() {
        while (this.scene.children.length > 2) { // 保留两个光源
            const child = this.scene.children[2];
            this.scene.remove(child);
        }
    }

    /**
     * 销毁渲染器
     */
    dispose() {
        this.renderer.dispose();
        this.cache.clear();
    }
}

/**
 * 为几何体选择器生成缩略图
 */
export function generateGeometryThumbnails() {
    const generator = new ThumbnailGenerator();

    // 获取所有几何体卡片
    const cards = document.querySelectorAll('.geometry-card');

    cards.forEach(card => {
        const type = card.dataset.type;
        if (!type) return;

        // 生成缩略图
        const thumbnail = generator.generateThumbnail(type);
        if (!thumbnail) return;

        // 创建图片元素
        const img = document.createElement('img');
        img.src = thumbnail;
        img.alt = type;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';

        // 添加到卡片的缩略图区域
        const thumbnailContainer = card.querySelector('.geometry-thumbnail');
        if (thumbnailContainer) {
            thumbnailContainer.innerHTML = '';
            thumbnailContainer.appendChild(img);
        }
    });

    // 清理
    generator.dispose();
}
