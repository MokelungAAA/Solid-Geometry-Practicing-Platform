/**
 * Solution3DManager
 * 3D解析显示
 */

import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export class Solution3DManager {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.solutionGroup = null;
    this.currentStep = 0;
    this.steps = [];
  }

  showSolution(geometryType, question, correctAnswer) {
    this.clearSolution();
    this.solutionGroup = new THREE.Group();
    this.solutionGroup.name = 'solution3d';

    this.steps = this.generateSteps(geometryType, question, correctAnswer);
    this.currentStep = 0;
    this.showCurrentStep();

    this.scene.add(this.solutionGroup);
  }

  generateSteps(geometryType, question, correctAnswer) {
    const config = question.config || {};
    const steps = [];

    steps.push({
      title: '题目分析',
      text: question.question || '分析题目',
      highlight: null
    });

    if (question.type === 'volume' || question.type === 'calculation') {
      steps.push({
        title: '公式选择',
        text: `使用${geometryType}的体积公式`,
        highlight: 'formula'
      });
      steps.push({
        title: '代入计算',
        text: `答案：${correctAnswer}`,
        highlight: 'calculation'
      });
    } else if (question.type === 'surfaceArea') {
      steps.push({
        title: '公式选择',
        text: `使用${geometryType}的表面积公式`,
        highlight: 'formula'
      });
      steps.push({
        title: '代入计算',
        text: `答案：${correctAnswer}`,
        highlight: 'calculation'
      });
    } else {
      steps.push({
        title: '答案',
        text: `正确答案：${correctAnswer}`,
        highlight: 'answer'
      });
    }

    return steps;
  }

  showCurrentStep() {
    if (!this.solutionGroup || this.currentStep >= this.steps.length) return;

    const step = this.steps[this.currentStep];
    const div = document.createElement('div');
    div.className = 'solution-step';
    div.innerHTML = `
      <div style="font-weight:bold;margin-bottom:4px">${step.title}</div>
      <div>${step.text}</div>
    `;
    div.style.cssText = 'background:rgba(255,255,255,0.9);padding:12px;border-radius:8px;border:1px solid #ddd;font-size:13px;max-width:200px;pointer-events:none;';

    const label = new CSS2DObject(div);
    label.position.set(0, 2, 0);
    this.solutionGroup.add(label);
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.clearLabels();
      this.showCurrentStep();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.clearLabels();
      this.showCurrentStep();
    }
  }

  clearLabels() {
    if (!this.solutionGroup) return;
    const labels = [];
    this.solutionGroup.traverse(child => {
      if (child.isCSS2DObject) {
        labels.push(child);
      }
    });
    labels.forEach(label => {
      label.element.remove();
      this.solutionGroup.remove(label);
    });
  }

  clearSolution() {
    if (this.solutionGroup) {
      this.clearLabels();
      this.scene.remove(this.solutionGroup);
      this.solutionGroup = null;
    }
    this.steps = [];
    this.currentStep = 0;
  }

  dispose() {
    this.clearSolution();
  }
}
