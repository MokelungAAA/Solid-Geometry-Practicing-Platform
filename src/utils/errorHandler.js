/**
 * ErrorHandler
 * 错误处理管理
 */

export class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.callbacks = {};
    this.init();
  }

  init() {
    window.addEventListener('error', (e) => this.handleError(e));
    window.addEventListener('unhandledrejection', (e) => this.handlePromiseError(e));
  }

  handleError(event) {
    const error = {
      type: 'javascript',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error ? event.error.stack : null,
      timestamp: Date.now()
    };
    this.logError(error);
    return true;
  }

  handlePromiseError(event) {
    const error = {
      type: 'promise',
      message: event.reason ? event.reason.message : 'Unknown promise rejection',
      stack: event.reason ? event.reason.stack : null,
      timestamp: Date.now()
    };
    this.logError(error);
    return true;
  }

  logError(error) {
    this.errors.push(error);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
    console.error(`[${error.type}] ${error.message}`, error);
    if (this.callbacks.onError) {
      this.callbacks.onError(error);
    }
  }

  getErrors() {
    return [...this.errors];
  }

  getErrorsByType(type) {
    return this.errors.filter(e => e.type === type);
  }

  getRecentErrors(count = 10) {
    return this.errors.slice(-count);
  }

  clearErrors() {
    this.errors = [];
  }

  onError(callback) {
    this.callbacks.onError = callback;
  }

  showErrorToast(error) {
    if (window.app && window.app.toastManager) {
      window.app.toastManager.error(error.message);
    }
  }

  wrapFunction(fn, context = null) {
    return function(...args) {
      try {
        return fn.apply(context, args);
      } catch (error) {
        const errorObj = {
          type: 'function',
          message: error.message,
          stack: error.stack,
          functionName: fn.name,
          timestamp: Date.now()
        };
        if (window.app && window.app.errorHandler) {
          window.app.errorHandler.logError(errorObj);
        }
        throw error;
      }
    };
  }

  async wrapAsync(fn, context = null) {
    return async function(...args) {
      try {
        return await fn.apply(context, args);
      } catch (error) {
        const errorObj = {
          type: 'async',
          message: error.message,
          stack: error.stack,
          functionName: fn.name,
          timestamp: Date.now()
        };
        if (window.app && window.app.errorHandler) {
          window.app.errorHandler.logError(errorObj);
        }
        throw error;
      }
    };
  }

  getErrorStats() {
    const stats = {
      total: this.errors.length,
      byType: {},
      recent: this.getRecentErrors(5)
    };
    this.errors.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
    });
    return stats;
  }

  exportErrors() {
    return JSON.stringify(this.errors, null, 2);
  }

  dispose() {
    window.removeEventListener('error', this.handleError);
    window.removeEventListener('unhandledrejection', this.handlePromiseError);
    this.errors = [];
    this.callbacks = {};
  }
}
