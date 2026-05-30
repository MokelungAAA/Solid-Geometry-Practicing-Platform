/**
 * PracticeManager — 练习模式管理器（完整版）
 * 包含：练习流程、答题反馈、证明步骤、统计持久化、知识点筛选
 */

import { QuestionBank, HintManager, KNOWLEDGE_POINTS } from './questionBank.js';
import { STORAGE_KEYS } from '../utils/constants.js';

export class PracticeManager {
  constructor(app) {
    this.app = app;
    this.questionBank = new QuestionBank();
    this.hintManager = new HintManager();

    // 练习状态
    this.currentQuestion = null;
    this.selectedAnswer = null;
    this.proofSteps = [];
    this.currentProofStep = 0;
    this.isAnswered = false;
    this.isCorrect = false;

    // 统计
    this.stats = { correct: 0, total: 0, streak: 0, maxStreak: 0 };

    // 题目记录
    this.records = [];
    this.answeredIds = [];
    this.questionHistory = [];

    // 练习配置
    this.practiceConfig = {
      type: 'mixed',
      difficulty: 'mixed',
      knowledge: [],
      geometryType: 'mixed',
      autoNext: true,
      showHint: true
    };

    this._loadPersistedData();
  }

  // ========================
  // 练习流程
  // ========================

  /** 开始练习 */
  startPractice(config = {}) {
    Object.assign(this.practiceConfig, config);
    this.stats = { correct: 0, total: 0, streak: 0, maxStreak: 0 };
    this._nextQuestion();
  }

  /** 停止练习 */
  stopPractice() {
    this.currentQuestion = null;
    this.selectedAnswer = null;
    this.proofSteps = [];
    this.currentProofStep = 0;
    this.isAnswered = false;
  }

  /** 暂停练习 */
  pausePractice() {
    this._persistData();
  }

  /** 恢复练习 */
  resumePractice() {
    this._loadPersistedData();
  }

  /** 下一题 */
  nextQuestion() {
    if (this.practiceConfig.autoNext) {
      this._nextQuestion();
    }
  }

  /** 内部：获取下一题 */
  _nextQuestion() {
    this.selectedAnswer = null;
    this.proofSteps = [];
    this.currentProofStep = 0;
    this.isAnswered = false;
    this.isCorrect = false;

    let question;
    if (this.practiceConfig.type === 'random') {
      question = this.questionBank.randomQuestion(this.answeredIds);
    } else {
      question = this.questionBank.autoGenerateQuestion({
        type: this.practiceConfig.type,
        difficulty: this.practiceConfig.difficulty,
        knowledge: this.practiceConfig.knowledge,
        geometry: this.practiceConfig.geometryType
      });
    }

    this.currentQuestion = question;
    this._setupHints(question);
    return question;
  }

  /** 设置提示 */
  _setupHints(question) {
    if (question.hints && question.hints.length > 0) {
      this.hintManager.addHint(question.id, question.hints);
    } else if (question.type === 'proof' && question.proofSteps) {
      this.hintManager.addHint(question.id, question.proofSteps.map(s => s.reason));
    }
  }

  // ========================
  // 答题交互
  // ========================

  /** 选择答案（选择题） */
  selectAnswer(index) {
    if (this.isAnswered) return;
    this.selectedAnswer = index;
  }

  /** 提交答案 */
  submitAnswer(answer) {
    if (this.isAnswered) return null;
    this.isAnswered = true;

    const question = this.currentQuestion;
    let isCorrect = false;

    if (question.type === 'choice') {
      let correctIndex;
      if (question.correctIndex !== undefined) {
        correctIndex = question.correctIndex;
      } else if (typeof question.correct === 'number') {
        // 静态题库：correct 是数字索引
        correctIndex = question.correct;
      } else {
        // 动态题库：correct 是答案文本
        correctIndex = (question.options || []).indexOf(question.correct);
      }
      isCorrect = this.selectedAnswer === correctIndex;
    } else if (question.type === 'fill') {
      const answers = question.answers || [];
      isCorrect = answers.some(a =>
        String(a).toLowerCase().trim() === String(answer).toLowerCase().trim()
      );
    } else if (question.type === 'proof') {
      // 证明题：检查是否完成所有步骤
      const totalSteps = this.proofSteps.length;
      if (totalSteps > 0) {
        isCorrect = this.currentProofStep >= totalSteps - 1;
      } else {
        // 没有步骤的证明题，检查答案文本
        const correctAnswer = question.correct || '';
        isCorrect = String(answer).trim() === String(correctAnswer).trim();
      }
    }

    this.isCorrect = isCorrect;

    // 更新统计
    this.stats.total++;
    if (isCorrect) {
      this.stats.correct++;
      this.stats.streak++;
      if (this.stats.streak > this.stats.maxStreak) {
        this.stats.maxStreak = this.stats.streak;
      }
    } else {
      this.stats.streak = 0;
    }

    // 记录答题
    const record = {
      questionId: question.id,
      type: question.type,
      geometry: question.geometry,
      difficulty: question.difficulty,
      isCorrect,
      timestamp: Date.now(),
      answer: question.type === 'choice' ? this.selectedAnswer : answer
    };

    this.records.push(record);
    this.answeredIds.push(question.id);
    this.questionHistory.push({ question, record });

    this._persistData();

    return {
      isCorrect,
      correctAnswer: this._getCorrectAnswer(question),
      explanation: question.explanation || '',
      question
    };
  }

  /** 获取正确答案 */
  _getCorrectAnswer(question) {
    if (question.type === 'choice') {
      const idx = question.correctIndex !== undefined
        ? question.correctIndex
        : (question.options || []).indexOf(question.correct);
      return question.options ? question.options[idx] : question.correct;
    }
    if (question.type === 'fill') {
      return (question.answers || [])[0] || '';
    }
    return question.correct || '';
  }

  /** 获取提示 */
  getHint() {
    if (!this.currentQuestion) return null;
    return this.hintManager.getHint(this.currentQuestion.id);
  }

  /** 重置提示 */
  resetHints() {
    if (this.currentQuestion) {
      this.hintManager.resetHints(this.currentQuestion.id);
    }
  }

  /** 获取剩余提示数 */
  getRemainingHints() {
    if (!this.currentQuestion) return 0;
    const total = this.hintManager.getHintCount(this.currentQuestion.id);
    const used = this.hintManager.hintIndex[this.currentQuestion.id] || 0;
    return Math.max(0, total - used);
  }

  // ========================
  // 证明题步骤
  // ========================

  /** 初始化证明步骤 */
  initProofSteps(steps) {
    this.proofSteps = steps || [];
    this.currentProofStep = 0;
    return this.proofSteps;
  }

  /** 下一步证明 */
  nextProofStep() {
    if (this.currentProofStep < this.proofSteps.length - 1) {
      this.currentProofStep++;
      return this.proofSteps[this.currentProofStep];
    }
    return null;
  }

  /** 上一步证明 */
  prevProofStep() {
    if (this.currentProofStep > 0) {
      this.currentProofStep--;
      return this.proofSteps[this.currentProofStep];
    }
    return null;
  }

  /** 跳转到指定步骤 */
  gotoProofStep(index) {
    if (index >= 0 && index < this.proofSteps.length) {
      this.currentProofStep = index;
      return this.proofSteps[index];
    }
    return null;
  }

  /** 获取当前证明步骤 */
  getCurrentProofStep() {
    return this.proofSteps[this.currentProofStep] || null;
  }

  /** 获取证明进度 */
  getProofProgress() {
    return {
      current: this.currentProofStep + 1,
      total: this.proofSteps.length,
      percentage: this.proofSteps.length > 0
        ? Math.round(((this.currentProofStep + 1) / this.proofSteps.length) * 100)
        : 0
    };
  }

  // ========================
  // 统计与记录
  // ========================

  /** 获取当前统计 */
  getStats() {
    return {
      ...this.stats,
      accuracy: this.stats.total > 0
        ? Math.round((this.stats.correct / this.stats.total) * 100)
        : 0
    };
  }

  /** 获取历史记录 */
  getRecords() {
    return this.records;
  }

  /** 获取今日统计 */
  getTodayStats() {
    const today = new Date().toDateString();
    const todayRecords = this.records.filter(r =>
      new Date(r.timestamp).toDateString() === today
    );
    return {
      total: todayRecords.length,
      correct: todayRecords.filter(r => r.isCorrect).length,
      accuracy: todayRecords.length > 0
        ? Math.round((todayRecords.filter(r => r.isCorrect).length / todayRecords.length) * 100)
        : 0
    };
  }

  /** 获取按知识点统计 */
  getStatsByKnowledge() {
    const stats = {};
    for (const [key, kp] of Object.entries(KNOWLEDGE_POINTS)) {
      const records = this.records.filter(r => {
        const q = this.questionBank.getStaticQuestions().find(q => q.id === r.questionId);
        return q && q.knowledgePoints && q.knowledgePoints.includes(key);
      });
      stats[key] = {
        name: kp.name,
        color: kp.color,
        total: records.length,
        correct: records.filter(r => r.isCorrect).length,
        accuracy: records.length > 0
          ? Math.round((records.filter(r => r.isCorrect).length / records.length) * 100)
          : 0
      };
    }
    return stats;
  }

  /** 获取按几何体统计 */
  getStatsByGeometry() {
    const stats = {};
    const types = this.questionBank.getGeometryTypes();
    for (const type of types) {
      const records = this.records.filter(r => r.geometry === type);
      stats[type] = {
        total: records.length,
        correct: records.filter(r => r.isCorrect).length,
        accuracy: records.length > 0
          ? Math.round((records.filter(r => r.isCorrect).length / records.length) * 100)
          : 0
      };
    }
    return stats;
  }

  /** 重置统计 */
  resetStats() {
    this.stats = { correct: 0, total: 0, streak: 0, maxStreak: 0 };
    this.records = [];
    this.answeredIds = [];
    this.questionHistory = [];
    this._persistData();
  }

  // ========================
  // 数据持久化
  // ========================

  _persistData() {
    try {
      localStorage.setItem(STORAGE_KEYS.practice_stats, JSON.stringify(this.stats));
      localStorage.setItem(STORAGE_KEYS.practice_records, JSON.stringify(this.records.slice(-500)));
      localStorage.setItem(STORAGE_KEYS.practice_answered, JSON.stringify(this.answeredIds.slice(-1000)));
    } catch (e) {
      console.warn('PracticeManager: 数据持久化失败', e);
    }
  }

  _loadPersistedData() {
    try {
      const stats = localStorage.getItem(STORAGE_KEYS.practice_stats);
      if (stats) this.stats = JSON.parse(stats);

      const records = localStorage.getItem(STORAGE_KEYS.practice_records);
      if (records) this.records = JSON.parse(records);

      const answered = localStorage.getItem(STORAGE_KEYS.practice_answered);
      if (answered) this.answeredIds = JSON.parse(answered);
    } catch (e) {
      console.warn('PracticeManager: 数据加载失败', e);
    }
  }
}
