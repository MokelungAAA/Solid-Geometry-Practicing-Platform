/**
 * PracticeManager
 * 练习系统管理器
 */

import { GEOMETRY_CONFIGS, GEOMETRY_TYPES } from '../utils/constants.js';

export class PracticeManager {
  constructor() {
    this.isPracticing = false;
    this.isPaused = false;
    this.currentQuestion = null;
    this.questions = [];
    this.currentIndex = 0;
    this.score = { correct: 0, total: 0 };
    this.startTime = null;
    this.mode = 'current';
    this.difficulty = 'medium';
    this.questionCount = 10;
  }

  startPractice(options = {}) {
    this.mode = options.mode || 'current';
    this.difficulty = options.difficulty || 'medium';
    this.questionCount = options.questionCount || 10;
    this.currentIndex = 0;
    this.score = { correct: 0, total: 0 };
    this.startTime = Date.now();
    this.isPracticing = true;
    this.isPaused = false;
    this.generateQuestions();
    return this.questions.length > 0;
  }

  stopPractice() {
    this.isPracticing = false;
    this.isPaused = false;
    const duration = Date.now() - this.startTime;
    return {
      score: this.score,
      duration,
      totalQuestions: this.questions.length
    };
  }

  pausePractice() {
    if (this.isPracticing) {
      this.isPaused = true;
    }
  }

  resumePractice() {
    if (this.isPracticing && this.isPaused) {
      this.isPaused = false;
    }
  }

  generateQuestions() {
    this.questions = [];
    const types = this.mode === 'random'
      ? Object.values(GEOMETRY_TYPES)
      : [this.mode];
    for (let i = 0; i < this.questionCount; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const config = GEOMETRY_CONFIGS[type];
      const question = this.generateQuestion(type, config);
      this.questions.push(question);
    }
  }

  generateQuestion(type, config) {
    const questionTypes = ['volume', 'surfaceArea', 'vertices', 'edges', 'faces'];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const params = config.defaultParams;
    let questionText = '';
    let correctAnswer = '';
    switch (questionType) {
      case 'volume':
        questionText = config.name + '的体积';
        correctAnswer = this.calculateVolume(type, params).toFixed(2);
        break;
      case 'surfaceArea':
        questionText = config.name + '的表面积';
        correctAnswer = this.calculateSurfaceArea(type, params).toFixed(2);
        break;
      case 'vertices':
        questionText = config.name + '有多少个顶点？';
        correctAnswer = String(this.getVertices(type));
        break;
      case 'edges':
        questionText = config.name + '有多少条棱？';
        correctAnswer = String(this.getEdges(type));
        break;
      case 'faces':
        questionText = config.name + '有多少个面？';
        correctAnswer = String(this.getFaces(type));
        break;
    }
    return {
      type: questionType,
      geometryType: type,
      questionText,
      correctAnswer,
      options: this.generateOptions(correctAnswer, questionType)
    };
  }

  generateOptions(correctAnswer, questionType) {
    const options = [correctAnswer];
    const correct = parseFloat(correctAnswer);
    if (questionType === 'volume' || questionType === 'surfaceArea') {
      while (options.length < 4) {
        const variation = correct * (0.5 + Math.random());
        const option = variation.toFixed(2);
        if (!options.includes(option)) {
          options.push(option);
        }
      }
    } else {
      while (options.length < 4) {
        const variation = Math.floor(correct * (0.5 + Math.random()));
        const option = String(variation);
        if (!options.includes(option)) {
          options.push(option);
        }
      }
    }
    return this.shuffleArray(options);
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  getCurrentQuestion() {
    if (this.currentIndex < this.questions.length) {
      return this.questions[this.currentIndex];
    }
    return null;
  }

  submitAnswer(answer) {
    const question = this.getCurrentQuestion();
    if (!question) return null;
    const isCorrect = answer === question.correctAnswer;
    if (isCorrect) {
      this.score.correct++;
    }
    this.score.total++;
    this.currentIndex++;
    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      score: this.score
    };
  }

  calculateVolume(type, params) {
    switch (type) {
      case 'cube': return Math.pow(params.a, 3);
      case 'rectangularBox': return params.a * params.b * params.c;
      case 'triangularPrism': return 0.5 * params.a * params.b * params.c;
      case 'tetrahedron': return (Math.pow(params.a, 3) * Math.sqrt(2)) / 12;
      case 'squarePyramid': return (params.a * params.a * params.h) / 3;
      case 'hexagonalPrism': return (3 * Math.sqrt(3) * Math.pow(params.a, 2) * params.h) / 2;
      case 'triangularPyramid': return (params.a * params.b * params.h) / 6;
      case 'cylinder': return Math.PI * Math.pow(params.r, 2) * params.h;
      case 'cone': return (Math.PI * Math.pow(params.r, 2) * params.h) / 3;
      case 'sphere': return (4 * Math.PI * Math.pow(params.r, 3)) / 3;
      default: return 0;
    }
  }

  calculateSurfaceArea(type, params) {
    switch (type) {
      case 'cube': return 6 * Math.pow(params.a, 2);
      case 'rectangularBox': return 2 * (params.a * params.b + params.b * params.c + params.a * params.c);
      case 'triangularPrism': return params.a * params.b + 2 * params.b * params.c + 2 * 0.5 * params.a * params.c;
      case 'tetrahedron': return Math.sqrt(3) * Math.pow(params.a, 2);
      case 'squarePyramid': return params.a * params.a + 2 * params.a * Math.sqrt(Math.pow(params.h, 2) + Math.pow(params.a / 2, 2));
      case 'hexagonalPrism': return 6 * params.a * params.h + 3 * Math.sqrt(3) * Math.pow(params.a, 2);
      case 'triangularPyramid': return 0.5 * params.a * params.b + 0.5 * params.a * params.h + 0.5 * params.b * params.h + 0.5 * params.a * Math.sqrt(Math.pow(params.h, 2) + Math.pow(params.b / 2, 2));
      case 'cylinder': return 2 * Math.PI * params.r * params.h + 2 * Math.PI * Math.pow(params.r, 2);
      case 'cone': return Math.PI * params.r * params.h + Math.PI * Math.pow(params.r, 2);
      case 'sphere': return 4 * Math.PI * Math.pow(params.r, 2);
      default: return 0;
    }
  }

  getVertices(type) {
    const vertices = {
      cube: 8, rectangularBox: 8, triangularPrism: 6, tetrahedron: 4,
      squarePyramid: 5, hexagonalPrism: 12, triangularPyramid: 4,
      cylinder: 0, cone: 0, sphere: 0
    };
    return vertices[type] || 0;
  }

  getEdges(type) {
    const edges = {
      cube: 12, rectangularBox: 12, triangularPrism: 9, tetrahedron: 6,
      squarePyramid: 8, hexagonalPrism: 18, triangularPyramid: 6,
      cylinder: 0, cone: 0, sphere: 0
    };
    return edges[type] || 0;
  }

  getFaces(type) {
    const faces = {
      cube: 6, rectangularBox: 6, triangularPrism: 5, tetrahedron: 4,
      squarePyramid: 5, hexagonalPrism: 8, triangularPyramid: 4,
      cylinder: 3, cone: 2, sphere: 1
    };
    return faces[type] || 0;
  }

  getProgress() {
    return {
      current: this.currentIndex,
      total: this.questions.length,
      percentage: this.questions.length > 0
        ? Math.round((this.currentIndex / this.questions.length) * 100)
        : 0
    };
  }

  getStats() {
    const duration = this.startTime ? Date.now() - this.startTime : 0;
    return {
      score: this.score,
      duration,
      accuracy: this.score.total > 0
        ? Math.round((this.score.correct / this.score.total) * 100)
        : 0
    };
  }
}
