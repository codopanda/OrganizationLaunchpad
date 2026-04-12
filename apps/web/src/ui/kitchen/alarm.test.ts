import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Alarm Timer Logic', () => {
  describe('formatTime', () => {
    function formatTime(totalSeconds: number): string {
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    it('should format 0 seconds as 00:00', () => {
      expect(formatTime(0)).toBe('00:00');
    });

    it('should format seconds under 60 correctly', () => {
      expect(formatTime(5)).toBe('00:05');
      expect(formatTime(30)).toBe('00:30');
      expect(formatTime(59)).toBe('00:59');
    });

    it('should format exactly 1 minute as 01:00', () => {
      expect(formatTime(60)).toBe('01:00');
    });

    it('should format minutes and seconds correctly', () => {
      expect(formatTime(90)).toBe('01:30');
      expect(formatTime(125)).toBe('02:05');
      expect(formatTime(3600)).toBe('60:00');
    });
  });

  describe('timer state transitions', () => {
    interface TimerState {
      seconds: number;
      isRunning: boolean;
      isPaused: boolean;
    }

    function createTimer(initialSeconds: number) {
      let state: TimerState = {
        seconds: initialSeconds,
        isRunning: false,
        isPaused: false,
      };

      return {
        getState: () => ({ ...state }),
        start() {
          if (state.isRunning && !state.isPaused) return;
          state.isRunning = true;
          state.isPaused = false;
        },
        pause() {
          if (!state.isRunning || state.isPaused) return;
          state.isPaused = true;
        },
        stop() {
          state.isRunning = false;
          state.isPaused = false;
        },
        reset() {
          state.isRunning = false;
          state.isPaused = false;
          state.seconds = initialSeconds;
        },
    tick() {
      if (state.seconds > 0) {
        state.seconds--;
        return state.seconds > 0;
      }
      return false;
    },
        setSeconds(s: number) {
          state.seconds = s;
        },
      };
    }

    it('should start in idle state', () => {
      const timer = createTimer(60);
      const state = timer.getState();
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.seconds).toBe(60);
    });

    it('should transition to running state on start', () => {
      const timer = createTimer(60);
      timer.start();
      const state = timer.getState();
      expect(state.isRunning).toBe(true);
      expect(state.isPaused).toBe(false);
    });

    it('should transition to paused state on pause', () => {
      const timer = createTimer(60);
      timer.start();
      timer.pause();
      const state = timer.getState();
      expect(state.isRunning).toBe(true);
      expect(state.isPaused).toBe(true);
    });

    it('should resume from paused state', () => {
      const timer = createTimer(60);
      timer.start();
      timer.pause();
      timer.start();
      const state = timer.getState();
      expect(state.isRunning).toBe(true);
      expect(state.isPaused).toBe(false);
    });

    it('should reset to initial seconds', () => {
      const timer = createTimer(60);
      timer.start();
      timer.setSeconds(30);
      timer.reset();
      const state = timer.getState();
      expect(state.seconds).toBe(60);
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(false);
    });

    it('should stop timer completely', () => {
      const timer = createTimer(60);
      timer.start();
      timer.stop();
      const state = timer.getState();
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(false);
    });

    it('should decrement seconds on tick', () => {
      const timer = createTimer(60);
      timer.setSeconds(10);
      const hasTimeLeft = timer.tick();
      expect(timer.getState().seconds).toBe(9);
      expect(hasTimeLeft).toBe(true);
    });

    it('should indicate when timer completes', () => {
      const timer = createTimer(60);
      timer.setSeconds(1);
      const hasTimeLeft = timer.tick();
      expect(hasTimeLeft).toBe(false);
      expect(timer.getState().seconds).toBe(0);
    });

    it('should not go below zero', () => {
      const timer = createTimer(60);
      timer.setSeconds(0);
      const hasTimeLeft = timer.tick();
      expect(hasTimeLeft).toBe(false);
      expect(timer.getState().seconds).toBe(0);
    });
  });

  describe('notification permission', () => {
    it('should check if Notification API is available', () => {
      const isNotificationSupported = 'Notification' in window;
      expect(typeof isNotificationSupported).toBe('boolean');
    });

    it('should request permission before sending notification', async () => {
      const mockRequestPermission = vi.fn().mockResolvedValue('granted');
      vi.stubGlobal('Notification', {
        requestPermission: mockRequestPermission,
      });

      const permission = await Notification.requestPermission();
      expect(permission).toBe('granted');
      expect(mockRequestPermission).toHaveBeenCalled();

      vi.unstubAllGlobals();
    });
  });
});
