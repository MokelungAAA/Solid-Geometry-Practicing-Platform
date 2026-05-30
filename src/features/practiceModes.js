/**
 * PracticeModesManager
 * 练习模式管理
 */

export class PracticeModesManager {
  constructor() {
    this.modes = {
      normal: {
        name: '普通模式',
        description: '无时间限制，自由练习',
        timeLimit: 0,
        questionCount: 10,
        showHints: true,
        showSolution: true
      },
      timed: {
        name: '限时模式',
        description: '在规定时间内完成',
        timeLimit: 300,
        questionCount: 10,
        showHints: false,
        showSolution: false
      },
      challenge: {
        name: '挑战模式',
        description: '连续答对得分',
        timeLimit: 0,
        questionCount: 20,
        showHints: false,
        showSolution: false,
        streakBonus: true
      },
      review: {
        name: '复习模式',
        description: '复习错题',
        timeLimit: 0,
        questionCount: 0,
        showHints: true,
        showSolution: true,
        useWrongQuestions: true
      },
      random: {
        name: '随机模式',
        description: '随机题目类型',
        timeLimit: 0,
        questionCount: 15,
        showHints: true,
        showSolution: true,
        randomTypes: true
      }
    };
    this.currentMode = 'normal';
  }

  getMode(modeName) {
    return this.modes[modeName] || this.modes.normal;
  }

  setMode(modeName) {
    if (this.modes[modeName]) {
      this.currentMode = modeName;
      return true;
    }
    return false;
  }

  getCurrentMode() {
    return this.modes[this.currentMode];
  }

  getModeNames() {
    return Object.keys(this.modes);
  }

  addMode(name, config) {
    this.modes[name] = config;
  }

  removeMode(name) {
    if (name !== 'normal') {
      delete this.modes[name];
      if (this.currentMode === name) {
        this.currentMode = 'normal';
      }
    }
  }

  updateMode(name, config) {
    if (this.modes[name]) {
      this.modes[name] = { ...this.modes[name], ...config };
    }
  }

  getModeConfig(modeName) {
    const mode = this.getMode(modeName);
    return {
      timeLimit: mode.timeLimit,
      questionCount: mode.questionCount,
      showHints: mode.showHints,
      showSolution: mode.showSolution
    };
  }

  isTimeLimited() {
    return this.getCurrentMode().timeLimit > 0;
  }

  hasHints() {
    return this.getCurrentMode().showHints;
  }

  hasSolution() {
    return this.getCurrentMode().showSolution;
  }

  getQuestionCount() {
    return this.getCurrentMode().questionCount;
  }
}
