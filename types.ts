
export enum CryptoTopic {
  BASICS = 'Basics of Encryption',
  SYMMETRIC = 'Symmetric Ciphers',
  ASYMMETRIC = 'Public Key Cryptography',
  HASHING = 'Data Integrity & Hashing',
  SIGNATURES = 'Digital Signatures',
  SALTS = 'Password Salting'
}

export enum PuzzleType {
  CAESAR = 'CAESAR',
  HASHING = 'HASHING',
  VIGENERE = 'VIGENERE',
  ASYMMETRIC = 'ASYMMETRIC',
  SUBSTITUTION = 'SUBSTITUTION'
}

export interface GemData {
  id: string;
  position: [number, number, number];
  topic: CryptoTopic;
  collected: boolean;
}

export interface MonolithData {
  id: string;
  position: [number, number, number];
  type: PuzzleType;
  label: string;
  solved: boolean;
}

export interface BuildingData {
  id: string;
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  style: 'modern' | 'classic' | 'industrial' | 'skyscraper';
  windowColor: string;
}

export interface NPCData {
  id: string;
  position: [number, number, number];
  color: string;
  gender: 'male' | 'female';
  hasHat: boolean;
  skinColor: string;
}

export interface TreeData {
  id: string;
  position: [number, number, number];
  scale: number;
}

export interface VehicleData {
  id: string;
  position: [number, number, number];
  rotation: number;
  color: string;
}

export interface Puzzle {
  id: string;
  topic: CryptoTopic;
  title: string;
  tutorial: string;
  task: string;
  correctAnswer: string;
  explanation: string;
}

export interface PlayerStats {
  gemsCollected: string[];
  score: number;
  level: number;
}
