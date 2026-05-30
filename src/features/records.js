/**
 * RecordsManager
 * 做题记录管理
 */

export class RecordsManager {
  constructor() {
    this.records = [];
    this.currentSession = null;
  }

  startSession(geometryType) {
    this.currentSession = {
      geometryType,
      startTime: Date.now(),
      questions: [],
      score: 0
    };
    return this.currentSession;
  }

  addQuestion(question, answer, isCorrect) {
    if (!this.currentSession) {
      return null;
    }
    const record = {
      questionId: question.id,
      questionText: question.questionText,
      answer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      timestamp: Date.now()
    };
    this.currentSession.questions.push(record);
    if (isCorrect) {
      this.currentSession.score++;
    }
    return record;
  }

  endSession() {
    if (!this.currentSession) {
      return null;
    }
    this.currentSession.endTime = Date.now();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
    this.currentSession.totalQuestions = this.currentSession.questions.length;
    this.currentSession.accuracy = this.currentSession.totalQuestions > 0
      ? (this.currentSession.score / this.currentSession.totalQuestions * 100).toFixed(2)
      : 0;
    this.records.push(this.currentSession);
    const session = this.currentSession;
    this.currentSession = null;
    this.saveToStorage();
    return session;
  }

  getRecords() {
    return this.records;
  }

  getRecordsByGeometryType(type) {
    return this.records.filter(r => r.geometryType === type);
  }

  getRecordsByDate(date) {
    return this.records.filter(r => {
      const recordDate = new Date(r.startTime).toDateString();
      return recordDate === date.toDateString();
    });
  }

  getStats() {
    const totalSessions = this.records.length;
    const totalQuestions = this.records.reduce((sum, r) => sum + r.totalQuestions, 0);
    const totalCorrect = this.records.reduce((sum, r) => sum + r.score, 0);
    const avgAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions * 100).toFixed(2) : 0;
    return {
      totalSessions,
      totalQuestions,
      totalCorrect,
      avgAccuracy: parseFloat(avgAccuracy)
    };
  }

  clearRecords() {
    this.records = [];
    this.saveToStorage();
  }

  saveToStorage() {
    try {
      localStorage.setItem('solid-geometry-records', JSON.stringify(this.records));
    } catch (e) {
      console.error('Failed to save records:', e);
    }
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem('solid-geometry-records');
      if (data) {
        this.records = JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load records:', e);
    }
  }

  exportRecords() {
    return JSON.stringify(this.records, null, 2);
  }

  importRecords(json) {
    try {
      const data = JSON.parse(json);
      if (Array.isArray(data)) {
        this.records = data;
        this.saveToStorage();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import records:', e);
      return false;
    }
  }
}
