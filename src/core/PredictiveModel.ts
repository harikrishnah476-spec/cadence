'use client';

export interface PerformanceForecast {
  instabilityRisk: boolean;
  performanceDegradation: boolean;
  consistencyWarning: boolean;
  recommendedAction: 'slow_down' | 'maintain' | 'push' | 'break';
}

export class PredictiveModel {
  private lastLatencies: number[] = [];
  private lastErrors: number[] = [];
  private windowSize = 15;

  recordKeystroke(latency: number, isCorrect: boolean) {
    this.lastLatencies.push(latency);
    this.lastErrors.push(isCorrect ? 0 : 1);
    
    if (this.lastLatencies.length > this.windowSize) {
      this.lastLatencies.shift();
      this.lastErrors.shift();
    }
  }

  predict(): PerformanceForecast {
    if (this.lastLatencies.length < 10) {
      return { instabilityRisk: false, performanceDegradation: false, consistencyWarning: false, recommendedAction: 'maintain' };
    }

    // 1. Performance Degradation: Increasing trend in moving average latency
    const firstHalf = this.lastLatencies.slice(0, 5);
    const secondHalf = this.lastLatencies.slice(-5);
    const avg1 = firstHalf.reduce((a, b) => a + b, 0) / 5;
    const avg2 = secondHalf.reduce((a, b) => a + b, 0) / 5;
    const performanceDegradation = avg2 > avg1 * 1.3;

    // 2. Rhythm Instability: Increasing variance
    const avg = this.lastLatencies.reduce((a, b) => a + b, 0) / this.lastLatencies.length;
    const variance = this.lastLatencies.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / this.lastLatencies.length;
    const stdev = Math.sqrt(variance);
    const instabilityRisk = stdev > avg * 0.6;

    // 3. Consistency Warning: Recent errors clustering
    const recentErrors = this.lastErrors.reduce((a, b) => a + b, 0);
    const consistencyWarning = recentErrors >= 2;

    let recommendedAction: PerformanceForecast['recommendedAction'] = 'maintain';
    if (instabilityRisk || consistencyWarning) recommendedAction = 'slow_down';
    else if (performanceDegradation) recommendedAction = 'break';
    else if (stdev < avg * 0.15) recommendedAction = 'push';

    return {
      instabilityRisk,
      performanceDegradation,
      consistencyWarning,
      recommendedAction
    };
  }

  reset() {
    this.lastLatencies = [];
    this.lastErrors = [];
  }
}

export const predictiveModel = new PredictiveModel();
