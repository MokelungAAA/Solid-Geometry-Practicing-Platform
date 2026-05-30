/**
 * ExportImportManager
 * 导出导入管理
 */

export class ExportImportManager {
  constructor() {
    this.exportFormats = ['json', 'csv'];
  }

  exportData(data, format = 'json') {
    switch (format) {
      case 'json':
        return this.exportJSON(data);
      case 'csv':
        return this.exportCSV(data);
      default:
        return null;
    }
  }

  exportJSON(data) {
    return JSON.stringify(data, null, 2);
  }

  exportCSV(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }
    const headers = Object.keys(data[0]);
    const rows = data.map(item =>
      headers.map(h => {
        const value = item[h];
        return typeof value === 'string' && value.includes(',')
          ? `"${value}"`
          : String(value);
      }).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }

  importData(content, format = 'json') {
    switch (format) {
      case 'json':
        return this.importJSON(content);
      case 'csv':
        return this.importCSV(content);
      default:
        return null;
    }
  }

  importJSON(content) {
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to import JSON:', e);
      return null;
    }
  }

  importCSV(content) {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      if (lines.length < 2) return null;
      const headers = lines[0].split(',').map(h => h.trim());
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const item = {};
        headers.forEach((h, j) => {
          const value = values[j];
          item[h] = isNaN(value) ? value : parseFloat(value);
        });
        data.push(item);
      }
      return data;
    } catch (e) {
      console.error('Failed to import CSV:', e);
      return null;
    }
  }

  downloadFile(content, filename, format) {
    const mimeTypes = {
      json: 'application/json',
      csv: 'text/csv'
    };
    const blob = new Blob([content], { type: mimeTypes[format] || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  exportSettings(settings) {
    return this.exportJSON(settings);
  }

  importSettings(content) {
    return this.importJSON(content);
  }

  exportRecords(records) {
    return this.exportJSON(records);
  }

  importRecords(content) {
    return this.importJSON(content);
  }
}
