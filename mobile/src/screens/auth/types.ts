export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email: string;
  password: string;
}

export interface LoginFormState {
  email: string;
  password: string;
  showPassword: boolean;
  isSSOLoading: boolean;
  emailError: string;
  passwordError: string;
  isFormValid: boolean;
}

export interface SSOProvider {
  id: 'google' | 'facebook' | 'apple';
  name: string;
  icon: string;
  color: string;
}

export interface LoginAnimationValues {
  fadeAnim: any;
  slideAnim: any;
  formOpacity: any;
}

export interface LoginHandlers {
  handleEmailLogin: () => Promise<void>;
  handleDevBypass: () => void;
  handleSSOLogin: (provider: 'google' | 'facebook' | 'apple') => Promise<void>;
  handleForgotPassword: () => void;
  handleSignup: () => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setShowPassword: (show: boolean) => void;
}

export interface LoginFormProps {
  email: string;
  password: string;
  showPassword: boolean;
  emailError: string;
  passwordError: string;
  isFormValid: boolean;
  isLoading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onShowPasswordToggle: () => void;
  onLogin: () => Promise<void>;
  onForgotPassword: () => void;
  onDevBypass?: () => void;
}

export interface SSOLoginSectionProps {
  isSSOLoading: boolean;
  onSSOLogin: (provider: 'google' | 'facebook' | 'apple') => Promise<void>;
}

export interface LoginHeaderProps {
  fadeAnim: any;
  slideAnim: any;
}

export interface LoginFooterProps {
  onSignup: () => void;
}
