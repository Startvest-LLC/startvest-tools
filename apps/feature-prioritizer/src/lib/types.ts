export interface Feature {
  id: string;
  name: string;
  description: string;
  reach: number; // 1-10: How many users will this impact?
  impact: number; // 1-10: How much will it impact those users?
  confidence: number; // 1-10: How confident are you in your estimates?
  effort: number; // 1-10: How much effort to implement? (10 = minimal effort)
  riceScore: number;
  priority: 'high' | 'medium' | 'low';
}

export interface PrioritizationResult {
  features: Feature[];
  summary: {
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    quickWins: Feature[];
    bigBets: Feature[];
  };
}
