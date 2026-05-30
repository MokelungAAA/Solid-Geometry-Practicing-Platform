/**
 * Solution3DManager
 * 3D解析显示
 */

import * as THREE from 'three';

export class Solution3DManager {
  constructor() {
    this.solutions = {};
    this.currentSolution = null;
    this.annotations = [];
  }

  createSolution(geometryType, question) {
    const solution = {
      type: geometryType,
      steps: this.generateSteps(geometryType, question),
      currentStep: 0
    };
    this.solutions[question.id] = solution;
    return solution;
  }

  generateSteps(geometryType, question) {
    const steps = [];
    steps.push({
      text: '分析题目要求',
      highlight: null
    });
    steps.push({
      text: '确定几何体类型',
      highlight: 'geometry'
    });
    steps.push({
      text: '应用相关公式',
      highlight: 'formula'
    });
    steps.push({
      text: '计算结果',
      highlight: 'calculation'
    });
    steps.push({
      text: '验证答案',
      highlight: 'verify'
    });
    return steps;
  }

  showStep(solutionId, stepIndex) {
    const solution = this.solutions[solutionId];
    if (!solution || stepIndex >= solution.steps.length) {
      return null;
    }
    solution.currentStep = stepIndex;
    return solution.steps[stepIndex];
  }

  addAnnotation(position, text) {
    const annotation = {
      position: position.clone(),
      text,
      sprite: null
    };
    this.annotations.push(annotation);
    return annotation;
  }

  clearAnnotations() {
    this.annotations = [];
  }

  getSolution(solutionId) {
    return this.solutions[solutionId];
  }

  dispose() {
    this.solutions = {};
    this.annotations = [];
    this.currentSolution = null;
  }
}
