/**
 * TouchManager
 * 触摸支持管理
 */

export class TouchManager {
  constructor() {
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.isSwiping = false;
    this.callbacks = {};
    this.threshold = 50;
  }

  init(element) {
    if (!element) return;
    element.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: true });
    element.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });
    element.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: true });
    element.addEventListener('touchcancel', (e) => this.onTouchCancel(e), { passive: true });
  }

  onTouchStart(e) {
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.isSwiping = true;
    if (this.callbacks.onTouchStart) {
      this.callbacks.onTouchStart(touch);
    }
  }

  onTouchMove(e) {
    if (!this.isSwiping) return;
    const touch = e.touches[0];
    this.touchEndX = touch.clientX;
    this.touchEndY = touch.clientY;
    if (this.callbacks.onTouchMove) {
      this.callbacks.onTouchMove(touch);
    }
  }

  onTouchEnd(e) {
    if (!this.isSwiping) return;
    this.isSwiping = false;
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    if (Math.abs(deltaX) > this.threshold || Math.abs(deltaY) > this.threshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          this.triggerSwipe('right');
        } else {
          this.triggerSwipe('left');
        }
      } else {
        if (deltaY > 0) {
          this.triggerSwipe('down');
        } else {
          this.triggerSwipe('up');
        }
      }
    } else {
      this.triggerTap();
    }
    if (this.callbacks.onTouchEnd) {
      this.callbacks.onTouchEnd();
    }
  }

  onTouchCancel(e) {
    this.isSwiping = false;
    if (this.callbacks.onTouchCancel) {
      this.callbacks.onTouchCancel();
    }
  }

  triggerSwipe(direction) {
    if (this.callbacks.onSwipe) {
      this.callbacks.onSwipe(direction);
    }
  }

  triggerTap() {
    if (this.callbacks.onTap) {
      this.callbacks.onTap();
    }
  }

  onSwipe(callback) {
    this.callbacks.onSwipe = callback;
  }

  onTap(callback) {
    this.callbacks.onTap = callback;
  }

  onTouchStart(callback) {
    this.callbacks.onTouchStart = callback;
  }

  onTouchMove(callback) {
    this.callbacks.onTouchMove = callback;
  }

  onTouchEnd(callback) {
    this.callbacks.onTouchEnd = callback;
  }

  onTouchCancel(callback) {
    this.callbacks.onTouchCancel = callback;
  }

  setThreshold(value) {
    this.threshold = value;
  }

  isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  dispose() {
    this.callbacks = {};
    this.isSwiping = false;
  }
}
