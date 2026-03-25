export type ActivityType =
  | "RUNNING"
  | "WALKING"
  | "CYCLING"
  | "SWIMMING"
  | "WEIGHT_TRAINING"
  | "YOGA"
  | "HIT"
  | "CARDIO"
  | "STRETCHING"
  | "OTHER";

export type ActivityRequest = {
  userId: string;
  type: ActivityType;
  duration: number;
  caloriesBurned: number;
  startTime: string;
  additionalMetrics: Record<string, unknown>;
};

export type ActivityResponse = {
  id: string;
  userId: string;
  type: ActivityType;
  duration: number;
  caloriesBurned: number;
  startTime: string;
  additionalMetrics: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type Recommendation = {
  id: string;
  activityId: string;
  userId: string;
  activityType: string;
  recommendation: string;
  improvements: string[];
  suggestions: string[];
  safety: string[];
  createdAt: string;
};

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  keyclockId: string;
  email: string;
  password: string;
};

export type UserProfile = {
  id: string;
  keyclockId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdDate: string;
  updatedDate: string;
};
