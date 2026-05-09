'use client';

type EventType = 
  | 'session_start' 
  | 'session_complete' 
  | 'environment_change' 
  | 'recommendation_view' 
  | 'milestone_reached' 
  | 'quit_mid_session' 
  | 'calibration_complete';

class Analytics {
  private log: { type: EventType; timestamp: number; metadata?: any }[] = [];

  track(type: EventType, metadata?: any) {
    const event = { type, timestamp: Date.now(), metadata };
    this.log.push(event);
    
    // In a real production app, we would send this to a backend.
    // For this MVP, we log to console for debugging/validation preparation.
    console.log(`[Validation Analytics] ${type.toUpperCase()}`, metadata || '');
    
    // Persist to local storage for longitudinal review
    this.saveToStorage();
  }

  startSession(environment?: string) {
    this.track('session_start', { environment: environment ?? 'unknown' });
  }

  endSession(wpm: number, accuracy: number, environment?: string) {
    this.track('session_complete', { wpm, accuracy, environment: environment ?? 'unknown' });
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      const logs = JSON.parse(localStorage.getItem('cadence_analytics_v1') || '[]');
      logs.push(...this.log);
      localStorage.setItem('cadence_analytics_v1', JSON.stringify(logs.slice(-500)));
      this.log = [];
    }
  }

  getLogs() {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('elite_validation_logs') || '[]');
    }
    return [];
  }
}

export const analytics = new Analytics();
