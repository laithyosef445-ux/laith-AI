
export enum Mode {
  CHAT = 'chat',
  IMAGE = 'image',
  VIDEO = 'video',
  VOICE = 'voice'
}

export type Language = 'ar' | 'en';
export type Theme = 'dark' | 'light';
export type ThemeColor = 'blue' | 'purple' | 'emerald' | 'amber' | 'rose';
export type AIPersona = 'creative' | 'professional' | 'friendly';
export type ResponseLength = 'concise' | 'balanced' | 'detailed';
export type FontSize = 'small' | 'medium' | 'large';

export interface User {
  name: string;
  age: number;
  gender: 'male' | 'female';
  provider: 'google' | 'facebook' | 'guest';
  avatar?: string;
  customAvatar?: string;
  profileBg?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'video';
  attachmentUrl?: string;
  attachmentType?: string;
  isThinking?: boolean;
  sources?: Array<{ title: string; uri: string }>;
}

export interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  messages: Message[];
}

export interface Settings {
  language: Language;
  theme: Theme;
  themeColor: ThemeColor;
  voiceName: string;
  searchEnabled: boolean;
  deepThinkingEnabled: boolean; // خاصية التفكير العميق
  highResolution: boolean;
  saveHistory: boolean;
  aiCreativity: number;
  persona: AIPersona;
  responseLength: ResponseLength;
  useEmojis: boolean;
  emojiIntensity: number;
  fontSize: FontSize;
  autoScroll: boolean;
  safeMode: boolean;
  glassOpacity: number;
}
