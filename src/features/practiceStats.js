/**
 * PracticeStatsManager
 * 练习统计管理
 */

export class PracticeStatsManager {
  constructor() {
    this.sessions = [];
    this.currentSession = null;
  }

  startSession(geometryType) {
    this.currentSession = {
      geometryType,
      startTime: Date.now(),
      questions: [],
      correct: 0,
      wrong: 0,
      score: 0,
      hintsUsed: 0,
      timeSpent: 0
    };
    return this.currentSession;
  }

  recordQuestion(question, answer, isCorrect, hintUsed = false) {
    if (!this.currentSession) return null;
    const record = {
      questionId: question.id,
      questionType: question.type,
      geometryType: question.geometryType,
      answer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      hintUsed,
      timestamp: Date.now()
    };
    this.currentSession.questions.push(record);
    if (isCorrect) {
      this.currentSession.correct++;
      this.currentSession.score += 10;
    } else {
      this.currentSession.wrong++;
    }
    if (hintUsed) {
      this.currentSession.hintsUsed++;
      this.currentSession.score -= 2;
    }
    return record;
  }

  endSession() {
    if (!this.currentSession) return null;
    this.currentSession.endTime = Date.now();
    this.currentSession.timeSpent = this.currentSession.endTime - this.currentSession.startTime;
    this.currentSession.totalQuestions = this.currentSession.questions.length;
    this.currentSession.accuracy = this.currentSession.totalQuestions > 0
      ? (this.currentSession.correct / this.currentSession.totalQuestions * 100).toFixed(2)
      : 0;
    this.sessions.push(this.currentSession);
    const session = this.currentSession;
    this.currentSession = null;
    this.saveToStorage();
    return session;
  }

  getOverallStats() {
    const totalSessions = this.sessions.length;
    const totalQuestions = this.sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
    const totalCorrect = this.sessions.reduce((sum, s) => sum + s.correct, 0);
    const totalTime = this.sessions.reduce((sum, s) => sum + s.timeSpent, 0);
    const avgAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions * 100).toFixed(2) : 0;
    const avgTimePerQuestion = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0;
    return {
      totalSessions,
      totalQuestions,
      totalCorrect,
      totalWrong: totalQuestions - totalCorrect,
      avgAccuracy: parseFloat(avgAccuracy),
      totalTime,
      avgTimePerQuestion
    };
  }

  getStatsByGeometryType() {
    const stats = {};
    this.sessions.forEach(session => {
      if (!stats[session.geometryType]) {
        stats[session.geometryType] = {
          sessions: 0,
          questions: 0,
          correct: 0,
          wrong: 0
        };
      }
      stats[session.geometryType].sessions++;
      stats[session.geometryType].questions += session.totalQuestions;
      stats[session.geometryType].correct += session.correct;
      stats[session.geometryType].wrong += session.wrong;
    });
    Object.keys(stats).forEach(type => {
      const s = stats[type];
      s.accuracy = s.questions > 0 ? (s.correct / s.questions * 100).toFixed(2) : 0;
    });
    return stats;
  }

  getStatsByDate(date) {
    return this.sessions.filter(s => {
      const sessionDate = new Date(s.startTime).toDateString();
      return sessionDate === date.toDateString();
    });
  }

  getDailyStats(days = 7) {
    const dailyStats = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const sessions = this.getStatsByDate(date);
      const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
      const totalCorrect = sessions.reduce((sum, s) => sum + s.correct, 0);
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        sessions: sessions.length,
        questions: totalQuestions,
        correct: totalCorrect,
        accuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions * 100).toFixed(2) : 0
      });
    }
    return dailyStats;
  }

  getStreak() {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const sessions = this.getStatsByDate(date);
      if (sessions.length > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  clearStats() {
    this.sessions = [];
    this.saveToStorage();
  }

  saveToStorage() {
    try {
      localStorage.setItem('solid-geometry-practice-stats', JSON.stringify(this.sessions));
    } catch (e) {
      console.error('Failed to save practice stats:', e);
    }
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem('solid-geometry-practice-stats');
      if (data) {
        this.sessions = JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load practice stats:', e);
    }
  }

  exportStats() {
    return JSON.stringify(this.sessions, null, 2);
  }

  importStats(json) {
    try {
      const data = JSON.parse(json);
      if (Array.isArray(data)) {
        this.sessions = data;
        this.saveToStorage();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import practice stats:', e);
      return false;
    }
  }
}
