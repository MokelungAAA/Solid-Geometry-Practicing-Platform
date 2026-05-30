/**
 * RecordsManager
 * 做题记录管理
 */

export class RecordsManager {
  constructor() {
    this.records = [];
    this.currentSession = null;
    this.loadFromStorage();
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

  addRecord(record) {
    if (!record) return false;
    record.id = Date.now();
    record.timestamp = new Date().toISOString();
    this.records.unshift(record);
    if (this.records.length > 100) {
      this.records = this.records.slice(0, 100);
    }
    this.saveToStorage();
    return true;
  }

  deleteRecord(index) {
    if (index >= 0 && index < this.records.length) {
      this.records.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  getRecords() {
    return this.records;
  }

  getStats() {
    const totalPractices = this.records.length;
    const totalQuestions = this.records.reduce((sum, r) => sum + (r.stats?.total || 0), 0);
    const totalCorrect = this.records.reduce((sum, r) => sum + (r.stats?.correct || 0), 0);
    const totalTime = this.records.reduce((sum, r) => sum + (r.totalTime || 0), 0);
    const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    return {
      totalPractices,
      totalQuestions,
      totalCorrect,
      totalTime,
      avgAccuracy
    };
  }

  getAccuracyTrend(days = 7) {
    const trend = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayRecords = this.records.filter(r => {
        const recordDate = new Date(r.date || r.timestamp).toISOString().split('T')[0];
        return recordDate === dateStr;
      });

      const totalQuestions = dayRecords.reduce((sum, r) => sum + (r.stats?.total || 0), 0);
      const totalCorrect = dayRecords.reduce((sum, r) => sum + (r.stats?.correct || 0), 0);
      const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

      trend.push({
        date: dateStr,
        totalQuestions,
        totalCorrect,
        accuracy
      });
    }
    return trend;
  }

  exportToJSON() {
    try {
      const data = JSON.stringify(this.records, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `geometry-records-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.error('Export failed:', e);
      return false;
    }
  }

  importFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (Array.isArray(data)) {
            this.records = [...data, ...this.records];
            if (this.records.length > 100) {
              this.records = this.records.slice(0, 100);
            }
            this.saveToStorage();
            resolve({ imported: data.length });
          } else {
            reject(new Error('无效的JSON格式'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
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

  clearRecords() {
    this.records = [];
    this.saveToStorage();
  }
}
