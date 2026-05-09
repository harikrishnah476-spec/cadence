'use client';

export interface PerformanceInsights {
  rhythmStability: number; // Variance in keystroke intervals
  fatigueIndex: number; // Slope of WPM decay
  consistencyScore: number; // Coefficient of variation across clusters
  weakPoints: string[]; // High-latency bigrams
}

class PerformanceAnalyzer {
  private sessionKeystrokes: { char: string; latency: number; isCorrect: boolean }[] = [];
  private speedSamples: number[] = [];
  private bigramLatencies: Record<string, number[]> = {};

  clearSessionData() {
    this.sessionKeystrokes = [];
    this.speedSamples = [];
    this.bigramLatencies = {};
  }

  recordKeystroke(prevChar: string, currentChar: string, latency: number, isCorrect: boolean) {
    this.sessionKeystrokes.push({ char: currentChar, latency, isCorrect });
    
    if (isCorrect) {
      const bigram = `${prevChar}${currentChar}`;
      if (!this.bigramLatencies[bigram]) this.bigramLatencies[bigram] = [];
      this.bigramLatencies[bigram].push(latency);
    }
  }

  recordSpeedSample(wpm: number) {
    this.speedSamples.push(wpm);
  }

  getInsights(): PerformanceInsights {
    return {
      rhythmStability: this.calculateRhythmStability(),
      fatigueIndex: this.calculateFatigueIndex(),
      consistencyScore: this.calculateConsistencyScore(),
      weakPoints: this.getWeakBigrams(10)
    };
  }

  private calculateRhythmStability(): number {
    if (this.sessionKeystrokes.length < 10) return 0;
    const latencies = this.sessionKeystrokes.map(k => k.latency);
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const variance = latencies.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / latencies.length;
    return Math.sqrt(variance) / avg; // Coefficient of Variation
  }

  private calculateFatigueIndex(): number {
    if (this.speedSamples.length < 4) return 0;
    // Simple slope calculation: (Last avg - First avg)
    const firstHalf = this.speedSamples.slice(0, Math.floor(this.speedSamples.length / 2));
    const secondHalf = this.speedSamples.slice(Math.floor(this.speedSamples.length / 2));
    const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    // Positive index means speed is dropping
    return Math.max(0, avg1 - avg2);
  }

  private calculateConsistencyScore(): number {
    if (this.speedSamples.length < 4) return 100;
    const avg = this.speedSamples.reduce((a, b) => a + b, 0) / this.speedSamples.length;
    const variance = this.speedSamples.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / this.speedSamples.length;
    const cv = Math.sqrt(variance) / avg;
    return Math.max(0, 100 - (cv * 100));
  }

  getWeakBigrams(limit: number): string[] {
    const averages = Object.entries(this.bigramLatencies).map(([bigram, latencies]) => ({
      bigram,
      avg: latencies.reduce((a, b) => a + b, 0) / latencies.length
    }));

    return averages
      .sort((a, b) => b.avg - a.avg)
      .slice(0, limit)
      .map(item => item.bigram);
  }
}

export const performanceAnalyzer = new PerformanceAnalyzer();
