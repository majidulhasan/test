
export interface Category {
  id: string;
  name: string;
  color?: string;
}

export interface PasswordEntry {
  id: string;
  categoryId: string;
  title: string;
  username: string;
  passwordValue: string;
  createdAt: number;
}

export interface SecurityQuestion {
  question: string;
  answer: string;
}

export interface AppState {
  passwords: PasswordEntry[];
  categories: Category[];
  customColors: string[];
  isDarkMode: boolean;
  masterPassword?: string;
  pinLength: number; // Support 4 or 6
  autoLockSeconds: number;
  lockOnExit: boolean;
  securityQuestions?: SecurityQuestion[];
}
