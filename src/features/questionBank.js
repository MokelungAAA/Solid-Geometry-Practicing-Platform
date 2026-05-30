/**
 * QuestionBank
 * 题库生成器
 */

import { GEOMETRY_CONFIGS, GEOMETRY_TYPES } from '../utils/constants.js';

export class QuestionBank {
  constructor() {
    this.templates = {
      fillBlank: this.generateFillBlank.bind(this),
      choice: this.generateChoice.bind(this),
      proof: this.generateProof.bind(this),
      calculation: this.generateCalculation.bind(this)
    };
    this.difficultyLevels = ['easy', 'medium', 'hard'];
  }

  generateQuestions(options = {}) {
    const {
      type = 'random',
      questionType = 'choice',
      difficulty = 'medium',
      count = 10
    } = options;
    const questions = [];
    const geometryTypes = type === 'random'
      ? Object.values(GEOMETRY_TYPES)
      : [type];
    for (let i = 0; i < count; i++) {
      const geometryType = geometryTypes[Math.floor(Math.random() * geometryTypes.length)];
      const config = GEOMETRY_CONFIGS[geometryType];
      const template = this.templates[questionType];
      if (template) {
        const question = template(geometryType, config, difficulty);
        questions.push(question);
      }
    }
    return questions;
  }

  generateFillBlank(type, config, difficulty) {
    const params = config.defaultParams;
    const questionTypes = ['volume', 'surfaceArea', 'vertices', 'edges', 'faces'];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let questionText = '';
    let correctAnswer = '';
    switch (questionType) {
      case 'volume':
        questionText = config.name + '的体积是______';
        correctAnswer = this.calculateVolume(type, params).toFixed(2);
        break;
      case 'surfaceArea':
        questionText = config.name + '的表面积是______';
        correctAnswer = this.calculateSurfaceArea(type, params).toFixed(2);
        break;
      case 'vertices':
        questionText = config.name + '有______个顶点';
        correctAnswer = String(this.getVertices(type));
        break;
      case 'edges':
        questionText = config.name + '有______条棱';
        correctAnswer = String(this.getEdges(type));
        break;
      case 'faces':
        questionText = config.name + '有______个面';
        correctAnswer = String(this.getFaces(type));
        break;
    }
    return {
      type: 'fillBlank',
      geometryType: type,
      questionText,
      correctAnswer,
      difficulty
    };
  }

  generateChoice(type, config, difficulty) {
    const params = config.defaultParams;
    const questionTypes = ['volume', 'surfaceArea', 'vertices', 'edges', 'faces'];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let questionText = '';
    let correctAnswer = '';
    switch (questionType) {
      case 'volume':
        questionText = config.name + '的体积是？';
        correctAnswer = this.calculateVolume(type, params).toFixed(2);
        break;
      case 'surfaceArea':
        questionText = config.name + '的表面积是？';
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
      type: 'choice',
      geometryType: type,
      questionText,
      correctAnswer,
      options: this.generateOptions(correctAnswer, questionType),
      difficulty
    };
  }

  generateProof(type, config, difficulty) {
    const params = config.defaultParams;
    return {
      type: 'proof',
      geometryType: type,
      questionText: '证明：' + config.name + '的体积公式',
      correctAnswer: 'proof',
      difficulty
    };
  }

  generateCalculation(type, config, difficulty) {
    const params = config.defaultParams;
    const questionTypes = ['volume', 'surfaceArea'];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let questionText = '';
    let correctAnswer = '';
    switch (questionType) {
      case 'volume':
        questionText = '计算' + config.name + '的体积';
        correctAnswer = this.calculateVolume(type, params).toFixed(2);
        break;
      case 'surfaceArea':
        questionText = '计算' + config.name + '的表面积';
        correctAnswer = this.calculateSurfaceArea(type, params).toFixed(2);
        break;
    }
    return {
      type: 'calculation',
      geometryType: type,
      questionText,
      correctAnswer,
      difficulty
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

  filterByDifficulty(questions, difficulty) {
    return questions.filter(q => q.difficulty === difficulty);
  }

  getQuestionCount(type, questionType) {
    return this.generateQuestions({ type, questionType, count: 1 }).length;
  }
}

export class HintManager {
  constructor() {
    this.hints = {};
    this.currentHint = null;
    this.maxHints = 3;
    this.hintIndex = {};
  }

  getHint(questionId) {
    if (!this.hintIndex[questionId]) {
      this.hintIndex[questionId] = 0;
    }
    const hint = this.hints[questionId];
    if (!hint) {
      return null;
    }
    const current = this.hintIndex[questionId];
    if (current >= hint.steps.length) {
      return null;
    }
    const step = hint.steps[current];
    this.hintIndex[questionId] = current + 1;
    return {
      step: current + 1,
      totalSteps: hint.steps.length,
      hint: step
    };
  }

  resetHints(questionId) {
    this.hintIndex[questionId] = 0;
  }

  addHint(questionId, steps) {
    this.hints[questionId] = { steps };
  }

  hasHints(questionId) {
    return !!this.hints[questionId];
  }

  getHintCount(questionId) {
    return this.hints[questionId] ? this.hints[questionId].steps.length : 0;
  }
}
