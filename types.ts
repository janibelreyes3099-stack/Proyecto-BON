
export enum UserPersona {
  FAMILY = 'FAMILIA',
  STUDENT = 'ESTUDIANTE',
  TRADITIONAL = 'TRADICIONAL'
}

export enum FeatureSet {
  EXPLORADOR = 'EXPLORADOR',
  COPA = 'COPA',
  TRIVIA = 'TRIVIA',
  FAMILIA = 'FAMILIA'
}

// --- Family Circle Types ---
export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  points: number;
  isLead?: boolean;
}

export interface FamilyGoal {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  image: string;
}

export interface FamilyContribution {
  id: string;
  memberName: string;
  avatar: string;
  amount: number;
  time: string;
}

// --- Explorador de Sabores Types ---
export interface Stamp {
  id: string;
  name: string;
  collected: boolean;
  image: string;
  date?: string;
  rarity?: 'Común' | 'Rara' | 'Épica';
  popularity?: 'Baja' | 'Media' | 'Alta' | 'Muy Alta';
  description?: string;
  isSpecial?: boolean;
}

export interface Neighborhood {
  id: string;
  name: string;
  points: number;
  residents: number;
  isUserSector?: boolean;
}

export interface RankPlayer {
  rank: number;
  name: string;
  points: number;
  avatar: string;
  title?: string;
  isUser?: boolean;
  stampsCount?: number;
}

// --- Community Cup Types ---
export interface Finalist {
  id: string;
  name: string;
  author: string;
  description: string;
  votes: number;
  image: string;
  rank?: string;
  type: 'vaso' | 'cono';
}

export interface LabExperiment {
  base: string;
  fruit: string;
  topping: string;
  name?: string;
}

// --- Trivia Types ---
export interface TriviaCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  image: string;
  isRetro?: boolean;
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  image?: string;
  fact: string;
}

export interface TriviaHistoryItem {
  id: string;
  name: string;
  date: string;
  points: number;
  maxPoints: number;
  reward?: string;
  type: 'TBT' | 'SABORES' | 'TEMPORADA';
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  avatar: string;
  level: number;
  points: number;
  stampsCount: number;
  totalStampsNeeded: number;
  persona: UserPersona;
  sector: string;
  triviaPoints: number;
  password?: string;
  familyMembers?: FamilyMember[];
  collectedStamps?: string[];
  coupons?: Coupon[];
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  discount: string;
  code: string;
  expiresAt?: string;
  isWelcome?: boolean;
}

export interface CartItem {
  id: string; // unique (e.g. timestamp or random)
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category: string;
}

