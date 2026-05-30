/**
 * 3D解析可视化管理器
 * 负责在答题后展示3D动态解析演示
 */

import * as THREE from 'three';
import gsap from 'gsap';

export class Solution3DManager {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        // 解析相关对象
        this.solutionGroup = null;
        this.highlightObjects = [];
        this.animationTimeline = null;

        // 标注对象
        this.labels = [];
    }

    /**
     * 显示3D解析
     */
    showSolution(geometryType, question, answer) {
        // 清除之前的解析
        this.clearSolution();

        // 创建解析组
        this.solutionGroup = new THREE.Group();
        this.solutionGroup.name = 'solution-group';
        this.scene.add(this.solutionGroup);

        // 根据几何体类型和题目类型生成解析
        switch (geometryType) {
            case 'cube':
                this.showCubeSolution(question, answer);
                break;
            case 'rectangularBox':
                this.showCuboidSolution(question, answer);
                break;
            case 'cylinder':
                this.showCylinderSolution(question, answer);
                break;
            case 'cone':
                this.showConeSolution(question, answer);
                break;
            case 'sphere':
                this.showSphereSolution(question, answer);
                break;
            case 'hexagonalPrism':
                this.showRegularPrismSolution(question, answer);
                break;
            case 'squarePyramid':
                this.showRegularPyramidSolution(question, answer);
                break;
            case 'triangularPyramid':
                this.showTriangularPyramidSolution(question, answer);
                break;
            default:
                this.showGenericSolution(question, answer);
        }
    }

    /**
     * 正方体解析
     */
    showCubeSolution(question, answer) {
        const a = 2; // 默认边长

        // 创建正方体线框
        const geometry = new THREE.BoxGeometry(a, a, a);
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x1976d2,
            linewidth: 2
        });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        this.solutionGroup.add(wireframe);

        // 高亮关键点
        this.highlightKeyPoints([
            new THREE.Vector3(-a/2, -a/2, -a/2),
            new THREE.Vector3(a/2, -a/2, -a/2),
            new THREE.Vector3(a/2, a/2, -a/2),
            new THREE.Vector3(-a/2, a/2, -a/2)
        ]);

        // 添加辅助线（体对角线）
        if (question.question.includes('体对角线') || question.question.includes('对角线')) {
            this.addDiagonalLine(
                new THREE.Vector3(-a/2, -a/2, -a/2),
                new THREE.Vector3(a/2, a/2, a/2)
            );
        }

        // 添加标注
        this.addLabel('A', new THREE.Vector3(-a/2, -a/2, -a/2));
        this.addLabel('B', new THREE.Vector3(a/2, -a/2, -a/2));
        this.addLabel('C', new THREE.Vector3(a/2, a/2, -a/2));
        this.addLabel('D', new THREE.Vector3(-a/2, a/2, -a/2));

        // 添加边长标注
        this.addEdgeLabel('a', new THREE.Vector3(0, -a/2, -a/2));

        // 动画
        this.animateSolution();
    }

    /**
     * 长方体解析
     */
    showCuboidSolution(question, answer) {
        const a = 3, b = 2, c = 1.5;

        const geometry = new THREE.BoxGeometry(a, b, c);
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x1976d2,
            linewidth: 2
        });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        this.solutionGroup.add(wireframe);

        // 高亮关键点
        this.highlightKeyPoints([
            new THREE.Vector3(-a/2, -b/2, -c/2),
            new THREE.Vector3(a/2, -b/2, -c/2),
            new THREE.Vector3(a/2, b/2, -c/2),
            new THREE.Vector3(-a/2, b/2, -c/2)
        ]);

        // 添加体对角线
        if (question.question.includes('体对角线') || question.question.includes('对角线')) {
            this.addDiagonalLine(
                new THREE.Vector3(-a/2, -b/2, -c/2),
                new THREE.Vector3(a/2, b/2, c/2)
            );
        }

        // 添加标注
        this.addLabel('a', new THREE.Vector3(0, -b/2, -c/2));
        this.addLabel('b', new THREE.Vector3(a/2, 0, -c/2));
        this.addLabel('c', new THREE.Vector3(a/2, -b/2, 0));

        this.animateSolution();
    }

    /**
     * 圆柱解析
     */
    showCylinderSolution(question, answer) {
        const r = 1, h = 2;

        // 创建圆柱线框
        const geometry = new THREE.CylinderGeometry(r, r, h, 16);
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x1976d2,
            linewidth: 2
        });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        this.solutionGroup.add(wireframe);

        // 添加底面圆
        const circleGeometry = new THREE.CircleGeometry(r, 32);
        const circleMaterial = new THREE.MeshBasicMaterial({
            color: 0x1976d2,
            transparent: true,
            opacity: 0.1
        });
        const circle = new THREE.Mesh(circleGeometry, circleMaterial);
        circle.rotation.x = -Math.PI / 2;
        circle.position.y = -h / 2;
        this.solutionGroup.add(circle);

        // 添加高和半径标注
        this.addLabel('h', new THREE.Vector3(0, 0, r + 0.3));
        this.addLabel('r', new THREE.Vector3(r / 2, -h / 2, 0));

        // 高亮底面圆心
        this.highlightKeyPoints([
            new THREE.Vector3(0, -h / 2, 0),
            new THREE.Vector3(0, h / 2, 0)
        ]);

        this.animateSolution();
    }

    /**
     * 圆锥解析
     */
    showConeSolution(question, answer) {
        const r = 1, h = 2;

        // 创建圆锥线框
        const geometry = new THREE.ConeGeometry(r, h, 16);
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x1976d2,
            linewidth: 2
        });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        this.solutionGroup.add(wireframe);

        // 添加母线
        if (question.question.includes('母线')) {
            const slantHeight = Math.sqrt(r * r + h * h);
            const points = [
                new THREE.Vector3(0, h / 2, 0),
                new THREE.Vector3(r, -h / 2, 0)
            ];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({
                color: 0xff5722,
                linewidth: 3
            }));
            this.solutionGroup.add(line);

            this.addLabel('l', new THREE.Vector3(r / 2 + 0.2, 0, 0));
        }

        // 高亮顶点和底面圆心
        this.highlightKeyPoints([
            new THREE.Vector3(0, h / 2, 0),
            new THREE.Vector3(0, -h / 2, 0)
        ]);

        this.addLabel('h', new THREE.Vector3(0.3, 0, 0));
        this.addLabel('r', new THREE.Vector3(r / 2, -h / 2, 0));

        this.animateSolution();
    }

    /**
     * 球解析
     */
    showSphereSolution(question, answer) {
        const r = 1.5;

        // 创建球体线框
        const geometry = new THREE.SphereGeometry(r, 16, 16);
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x1976d2,
            linewidth: 2
        });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        this.solutionGroup.add(wireframe);

        // 添加大圆
        const circleGeometry = new THREE.CircleGeometry(r, 32);
        const circleMaterial = new THREE.MeshBasicMaterial({
            color: 0x1976d2,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        const circle = new THREE.Mesh(circleGeometry, circleMaterial);
        this.solutionGroup.add(circle);

        // 高亮球心
        this.highlightKeyPoints([
            new THREE.Vector3(0, 0, 0)
        ]);

        // 添加半径标注
        this.addLabel('R', new THREE.Vector3(r / 2, 0, 0));

        this.animateSolution();
    }

    /**
     * 正棱柱解析
     */
    showRegularPrismSolution(question, answer) {
        // 创建正三棱柱
        const shape = new THREE.Shape();
        const a = 2;
        shape.moveTo(0, 0);
        shape.lineTo(a, 0);
        shape.lineTo(a / 2, Math.sqrt(3) * a / 2);
        shape.closePath();

        const extrudeSettings = {
            steps: 1,
            depth: 1.5,
            bevelEnabled: false
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x1976d2,
            linewidth: 2
        });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        this.solutionGroup.add(wireframe);

        // 高亮关键点
        this.highlightKeyPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(a, 0, 0),
            new THREE.Vector3(a / 2, Math.sqrt(3) * a / 2, 0)
        ]);

        // 添加标注
        this.addLabel('a', new THREE.Vector3(a / 2, -0.2, 0));
        this.addLabel('h', new THREE.Vector3(a + 0.2, 0, 0.75));

        this.animateSolution();
    }

    /**
     * 正棱锥解析
     */
    showRegularPyramidSolution(question, answer) {
        const a = 2, h = 2;

        // 创建正四棱锥
        const pyramidGeometry = new THREE.ConeGeometry(a * 0.7, h, 4);
        const edges = new THREE.EdgesGeometry(pyramidGeometry);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x1976d2,
            linewidth: 2
        });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        this.solutionGroup.add(wireframe);

        // 高亮顶点和底面中心
        this.highlightKeyPoints([
            new THREE.Vector3(0, h / 2, 0),
            new THREE.Vector3(0, -h / 2, 0)
        ]);

        // 添加高标注
        this.addLabel('h', new THREE.Vector3(0.3, 0, 0));

        this.animateSolution();
    }

    /**
     * 三棱锥解析
     */
    showTriangularPyramidSolution(question, answer) {
        const a = 2;

        // 创建正四面体
        const tetrahedronGeometry = new THREE.TetrahedronGeometry(a);
        const edges = new THREE.EdgesGeometry(tetrahedronGeometry);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x1976d2,
            linewidth: 2
        });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        this.solutionGroup.add(wireframe);

        // 高亮四个顶点
        const vertices = tetrahedronGeometry.attributes.position;
        const points = [];
        for (let i = 0; i < 4; i++) {
            points.push(new THREE.Vector3(
                vertices.getX(i),
                vertices.getY(i),
                vertices.getZ(i)
            ));
        }
        this.highlightKeyPoints(points);

        // 添加标注
        this.addLabel('A', points[0]);
        this.addLabel('B', points[1]);
        this.addLabel('C', points[2]);
        this.addLabel('D', points[3]);

        this.animateSolution();
    }

    /**
     * 通用解析
     */
    showGenericSolution(question, answer) {
        // 默认显示一个简单的立方体
        this.showCubeSolution(question, answer);
    }

    /**
     * 高亮关键点
     */
    highlightKeyPoints(points) {
        points.forEach(point => {
            const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            const sphereMaterial = new THREE.MeshBasicMaterial({
                color: 0xff5722,
                transparent: true,
                opacity: 0.8
            });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.copy(point);
            this.solutionGroup.add(sphere);
            this.highlightObjects.push(sphere);
        });
    }

    /**
     * 添加对角线
     */
    addDiagonalLine(start, end) {
        const points = [start, end];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xff5722,
            linewidth: 3
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        this.solutionGroup.add(line);
        this.highlightObjects.push(line);
    }

    /**
     * 添加标注
     */
    addLabel(text, position) {
        // 这里使用CSS2DRenderer来创建标注
        // 暂时使用简单的文本精灵
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;

        context.fillStyle = 'white';
        context.fillRect(0, 0, 64, 64);

        context.fillStyle = '#1976d2';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.copy(position);
        sprite.scale.set(0.3, 0.3, 0.3);
        this.solutionGroup.add(sprite);
        this.labels.push(sprite);
    }

    /**
     * 添加边长标注
     */
    addEdgeLabel(text, position) {
        this.addLabel(text, position);
    }

    /**
     * 动画展示
     */
    animateSolution() {
        if (!this.solutionGroup) return;

        // 创建动画时间线
        this.animationTimeline = gsap.timeline();

        // 初始状态：所有对象透明
        this.solutionGroup.children.forEach(child => {
            if (child.material) {
                child.material.opacity = 0;
                child.material.transparent = true;
            }
        });

        // 依次显示对象
        this.solutionGroup.children.forEach((child, index) => {
            this.animationTimeline.to(child.material, {
                opacity: 1,
                duration: 0.5,
                ease: 'power2.out'
            }, index * 0.1);
        });

        // 高亮对象闪烁动画
        this.highlightObjects.forEach(obj => {
            if (obj.material) {
                gsap.to(obj.material, {
                    opacity: 0.3,
                    duration: 0.8,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut'
                });
            }
        });
    }

    /**
     * 清除解析
     */
    clearSolution() {
        if (this.animationTimeline) {
            this.animationTimeline.kill();
            this.animationTimeline = null;
        }

        if (this.solutionGroup) {
            this.scene.remove(this.solutionGroup);
            this.solutionGroup = null;
        }

        this.highlightObjects = [];
        this.labels = [];
    }

    /**
     * 暂停动画
     */
    pauseAnimation() {
        if (this.animationTimeline) {
            this.animationTimeline.pause();
        }
    }

    /**
     * 恢复动画
     */
    resumeAnimation() {
        if (this.animationTimeline) {
            this.animationTimeline.resume();
        }
    }

    /**
     * 重置动画
     */
    resetAnimation() {
        if (this.animationTimeline) {
            this.animationTimeline.restart();
        }
    }
}
