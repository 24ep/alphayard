import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FONT_STYLES } from '../../../utils/fontUtils';

interface Step4InviteFamilyScreenProps {
  navigation: any;
  route: any;
}

const Step4InviteFamilyScreen: React.FC<Step4InviteFamilyScreenProps> = ({ navigation, route }) => {
  const { email, phone, password, familyName, familyDescription } = route.params;
  const [inviteEmails, setInviteEmails] = useState<string[]>(['']);
  const [errors, setErrors] = useState<{ emails?: string }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addEmailField = () => {
    if (inviteEmails.length < 5) {
      setInviteEmails([...inviteEmails, '']);
    }
  };

  const removeEmailField = (index: number) => {
    if (inviteEmails.length > 1) {
      const newEmails = inviteEmails.filter((_, i) => i !== index);
      setInviteEmails(newEmails);
    }
  };

  const updateEmail = (index: number, email: string) => {
    const newEmails = [...inviteEmails];
    newEmails[index] = email;
    setInviteEmails(newEmails);
  };

  const handleSkip = () => {
    navigation.navigate('Step4Name', {
      email,
      phone,
      password,
      familyOption: 'create',
      familyName,
      familyDescription,
      inviteEmails: []
    });
  };

  const handleNext = () => {
    const validEmails = inviteEmails.filter(email => email.trim() && validateEmail(email.trim()));
    const invalidEmails = inviteEmails.filter(email => email.trim() && !validateEmail(email.trim()));

    if (invalidEmails.length > 0) {
      setErrors({ emails: 'Please enter valid email addresses' });
      return;
    }

    setErrors({});
    navigation.navigate('Step4Name', {
      email,
      phone,
      password,
      familyOption: 'create',
      familyName,
      familyDescription,
      inviteEmails: validEmails
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FA7272', '#FFBBB4']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Icon name="arrow-left" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.stepIndicator}>
                <Text style={styles.stepText}>Step 1 of 4</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '35%' }]} />
                </View>
              </View>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Invite hourse Members</Text>
              <Text style={styles.subtitle}>Send invitations to join "{familyName}"</Text>
            </View>

            {/* Invite Form */}
            <View style={styles.form}>
              <View style={styles.inviteContainer}>
                {inviteEmails.map((email, index) => (
                  <View key={index} style={styles.emailInputContainer}>
                    <TextInput
                      style={[styles.emailInput, errors.emails && styles.inputError]}
                      value={email}
                      onChangeText={(text) => updateEmail(index, text)}
                      placeholder="Enter email address"
                      placeholderTextColor="rgba(255, 255, 255, 0.7)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {inviteEmails.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeEmailField(index)}
                      >
                        <Icon name="close" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {inviteEmails.length < 5 && (
                  <TouchableOpacity style={styles.addButton} onPress={addEmailField}>
                    <Icon name="plus" size={20} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>Add another email</Text>
                  </TouchableOpacity>
                )}

                {errors.emails && <Text style={styles.errorText}>{errors.emails}</Text>}
              </View>

            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Send Invitations</Text>
                <Icon name="arrow-right" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  stepIndicator: {
    flex: 1,
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: FONT_STYLES.englishMedium,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: FONT_STYLES.englishHeading,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: FONT_STYLES.englishBody,
  },
  form: {
    flex: 1,
  },
  inviteContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: FONT_STYLES.englishSemiBold,
  },
  sectionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
    lineHeight: 20,
    fontFamily: FONT_STYLES.englishBody,
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emailInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 0,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 12,
  },
  inputError: {
    // No border styling for error state
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONT_STYLES.englishMedium,
  },
  errorText: {
    color: '#FFE5E5',
    fontSize: 14,
    marginTop: 8,
    fontFamily: FONT_STYLES.englishBody,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONT_STYLES.englishSemiBold,
  },
  nextButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    color: '#bf4342',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONT_STYLES.englishSemiBold,
  },
});

export default Step4InviteFamilyScreen;
