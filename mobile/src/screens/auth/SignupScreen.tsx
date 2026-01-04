import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { DynamicBackground } from '../../components/DynamicBackground';
import { useLoginBackground } from '../../hooks/useAppConfig';

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { signup, isLoading } = useAuth();
  const { background, loading: backgroundLoading } = useLoginBackground();

  // Get identifier passed from LoginScreen
  const { identifier: initialIdentifier } = (route.params as any) || {};

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(initialIdentifier && initialIdentifier.includes('@') ? initialIdentifier : '');
  const [phone, setPhone] = useState(initialIdentifier && !initialIdentifier.includes('@') ? initialIdentifier : '');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    if (!firstName || !lastName || !email) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create user and request OTP
      await signup({
        email,
        password: 'temp_password',
        firstName,
        lastName,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        userType: 'hourse'
      });

      // Navigate to Verification
      navigation.navigate('OtpVerification', { identifier: email, mode: 'signup' });

    } catch (error: any) {
      console.error('Signup failed:', error);
      Alert.alert('Signup Error', error.message || 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <DynamicBackground background={background} loading={backgroundLoading} style={styles.background}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#FA7272" />
            </TouchableOpacity>
            <Text style={styles.title}>Create Account</Text>
          </View>

          <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Doe"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="john@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="+1 234 567 8900"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="1990-01-01"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </DynamicBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  background: { flex: 1 },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  formContainer: { padding: 20, paddingBottom: 40, backgroundColor: '#FFF', margin: 20, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '500' },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#EEE'
  },
  button: {
    backgroundColor: '#FA7272',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});

export default SignupScreen;
