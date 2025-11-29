import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height * 0.4,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  headerSection: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  formSection: {
    flex: 0.6,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 32,
    gap: 24,
  },
  loginFormCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
  },
  formContent: {
    gap: 20,
  },
  inputContainer: {
    gap: 16,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: colors.primary[500],
    fontWeight: '500',
  },
  signInButton: {
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonText: {
    color: colors.white[500],
    fontWeight: '600',
  },
  devBypassButton: {
    borderRadius: 12,
    marginTop: 8,
  },
  devBypassButtonText: {
    color: colors.secondary[600],
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  divider: {
    flex: 1,
  },
  dividerText: {
    color: colors.gray[500],
  },
  ssoButtonsContainer: {
    gap: 12,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 16,
  },
  footerText: {
    color: colors.gray[600],
  },
  signupLink: {
    color: colors.primary[500],
    fontWeight: '600',
  },
});

export default loginStyles;
