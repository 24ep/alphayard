import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Red/Coral color palette (matching signup page)
const colors = {
  // Background colors - Red/Coral gradient tones
  background: '#FA7272', // Primary red
  backgroundOverlay: 'rgba(255, 255, 255, 0.15)',
  
  // Text colors
  textPrimary: '#FFFFFF', // White text for contrast on gradient
  textSecondary: 'rgba(255, 255, 255, 0.9)', // Secondary text
  textTertiary: 'rgba(255, 255, 255, 0.7)', // Tertiary text
  textWhite: '#FFFFFF', // White text for dark backgrounds
  
  // Accent colors - Red/Coral tones
  accentRed: '#FA7272', // Primary red
  accentRedLight: '#FFBBB4',
  accentRedDark: '#bf4342',
  accentCoral: '#FFBBB4',
  
  // Input colors
  inputBackground: 'rgba(255, 255, 255, 0.15)',
  inputBorder: 'rgba(255, 255, 255, 0.3)',
  inputBorderFocused: 'rgba(255, 255, 255, 0.5)',
  inputPlaceholder: 'rgba(255, 255, 255, 0.7)',
  
  // Error colors
  error: '#FFFFFF',
  errorBackground: 'rgba(255, 255, 255, 0.1)',
  
  // Button colors
  buttonPrimary: '#FFFFFF',
  buttonPrimaryPressed: 'rgba(255, 255, 255, 0.9)',
  buttonDisabled: 'rgba(255, 255, 255, 0.5)',
  
  // Social button colors
  google: 'rgba(219, 68, 55, 0.8)',
  facebook: 'rgba(66, 103, 178, 0.8)',
  apple: 'rgba(0, 195, 0, 0.8)',
  
  // Divider
  divider: 'rgba(255, 255, 255, 0.3)',
  
  // Link colors
  link: '#FFFFFF',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    flex: 1,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.backgroundOverlay,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    ...Platform.select({
      ios: {
        shadowColor: '#FA7272',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textWhite,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'sans-serif-medium',
      default: 'system',
    }),
  },
  formContainer: {
    width: '100%',
  },
  formCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  formCardInner: {
    padding: 32,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
  },
  formTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.8,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'sans-serif',
      default: 'system',
    }),
  },
  formSubtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: 32,
    letterSpacing: -0.2,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif',
      default: 'system',
    }),
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    minHeight: 52,
    backdropFilter: 'blur(10px)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputWrapperFocused: {
    borderColor: colors.inputBorderFocused,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
    backgroundColor: colors.errorBackground,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    color: colors.textPrimary,
    padding: 0,
    fontWeight: '400',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif',
      default: 'system',
    }),
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
  },
  errorContainer: {
    marginTop: 6,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '400',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif',
      default: 'system',
    }),
  },
  apiErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  apiErrorIcon: {
    marginRight: 10,
  },
  apiErrorText: {
    flex: 1,
    fontSize: 14,
    color: colors.error,
    fontWeight: '500',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif-medium',
      default: 'system',
    }),
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 28,
    marginTop: -4,
  },
  forgotPasswordText: {
    fontSize: 15,
    color: colors.link,
    fontWeight: '500',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif',
      default: 'system',
    }),
  },
  loginButton: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    minHeight: 52,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  loginButtonDisabled: {
    opacity: 0.5,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.15,
      },
    }),
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#bf4342',
    letterSpacing: -0.2,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif-medium',
      default: 'system',
    }),
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: colors.textTertiary,
    fontWeight: '400',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif',
      default: 'system',
    }),
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  googleButton: {
    backgroundColor: colors.google,
  },
  facebookButton: {
    backgroundColor: colors.facebook,
  },
  appleButton: {
    backgroundColor: colors.apple,
  },
  lineButton: {
    backgroundColor: colors.apple,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signupText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '400',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif',
      default: 'system',
    }),
  },
  signupLink: {
    fontSize: 15,
    color: colors.link,
    fontWeight: '600',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif-medium',
      default: 'system',
    }),
  },
});
