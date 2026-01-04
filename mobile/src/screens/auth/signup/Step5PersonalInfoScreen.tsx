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
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FONT_STYLES } from '../../../utils/fontUtils';
import { CountryPickerModal } from '../../../components/CountryPickerModal';
import { Country, configService } from '../../../services/api/config';
import { Calendar } from 'react-native-calendars';
import { Modal, TouchableWithoutFeedback } from 'react-native';

interface Step5PersonalInfoScreenProps {
  navigation: any;
  route: any;
}

const Step5PersonalInfoScreen: React.FC<Step5PersonalInfoScreenProps> = ({ navigation, route }) => {
  const { email, phone, password, familyOption, familyCode, familyName, familyDescription, inviteEmails, firstName, lastName, middleName, nickname } = route.params;

  // Helper to check if identifier is email
  const isEmail = (text: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
  };

  const initialIsEmail = isEmail(email);

  const [emailInput, setEmailInput] = useState(email || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    code: 'US', name: 'United States', dial_code: '+1', flag: '🇺🇸'
  });
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bio, setBio] = useState('');

  // Calendar State
  const [calendarView, setCalendarView] = useState<'day' | 'month' | 'year'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= 1900; i--) {
      years.push(i);
    }
    return years;
  };

  const years = generateYears();

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const selectYear = (year: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setCalendarView('month');
  };

  const selectMonth = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setCalendarView('day');
  };

  // Fetch countries and parse incoming phone number
  React.useEffect(() => {
    const init = async () => {
      const targetPhone = phone || (!initialIsEmail ? email : '');
      if (targetPhone) {
        try {
          const countries = await configService.getCountries();
          const sortedCountries = countries.sort((a, b) => b.dial_code.length - a.dial_code.length);
          const cleanPhone = targetPhone.startsWith('+') ? targetPhone : `+${targetPhone}`;
          const matchedCountry = sortedCountries.find(c => cleanPhone.startsWith(c.dial_code));

          if (matchedCountry) {
            setSelectedCountry(matchedCountry);
            const localNumber = cleanPhone.substring(matchedCountry.dial_code.length);
            setPhoneNumber(localNumber);
          } else {
            setPhoneNumber(targetPhone);
          }
        } catch (e) {
          console.error("Error matching country:", e);
          setPhoneNumber(targetPhone);
        }
      }
    };
    init();
  }, [email, phone, initialIsEmail]);

  const onDayPress = (day: any) => {
    setDateOfBirth(day.dateString);
    setShowDatePicker(false);
  };

  const handleNext = () => {
    navigation.navigate('Step6Survey', {
      email: emailInput,
      phone: phoneNumber ? `${selectedCountry.dial_code}${phoneNumber}` : phone,
      password,
      familyOption,
      familyCode,
      familyName,
      familyDescription,
      inviteEmails,
      firstName,
      lastName,
      middleName,
      nickname,
      phoneNumber: phoneNumber ? `${selectedCountry.dial_code}${phoneNumber}` : phone,
      dateOfBirth,
      bio,
    });
  };

  const handleSkip = () => {
    navigation.navigate('Step6Survey', {
      email: emailInput || email,
      phone: phoneNumber ? `${selectedCountry.dial_code}${phoneNumber}` : phone,
      password,
      familyOption,
      familyCode,
      familyName,
      familyDescription,
      inviteEmails,
      firstName,
      lastName,
      middleName,
      nickname,
      phoneNumber: phoneNumber ? `${selectedCountry.dial_code}${phoneNumber}` : phone,
      dateOfBirth: '',
      bio: '',
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
                <Text style={styles.stepText}>Step 3 of 4</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '75%' }]} />
                </View>
              </View>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Personal Information</Text>
              <Text style={styles.subtitle}>Tell us a bit about yourself (optional)</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Personal Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <Text style={styles.sectionSubtitle}>
                  Hi {firstName} {lastName}! Tell us a bit more about yourself.
                </Text>
              </View>

              {/* Optional Fields */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact & Details</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    value={emailInput}
                    onChangeText={setEmailInput}
                    placeholder="Email Address"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderBottomWidth: 2,
                        borderBottomColor: 'rgba(255, 255, 255, 0.5)',
                        paddingVertical: 16,
                        gap: 8,
                        minWidth: 80
                      }}
                      onPress={() => setShowCountryPicker(true)}
                    >
                      <Text style={{ fontSize: 20 }}>{selectedCountry.flag}</Text>
                      <Text style={{ fontSize: 16, color: '#FFFFFF', fontWeight: '500' }}>{selectedCountry.dial_code}</Text>
                      <Icon name="chevron-down" size={16} color="rgba(255, 255, 255, 0.7)" />
                    </TouchableOpacity>

                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="Phone number"
                      placeholderTextColor="rgba(255, 255, 255, 0.7)"
                      keyboardType="phone-pad"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Date of Birth</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <View pointerEvents="none">
                      <TextInput
                        style={styles.input}
                        value={dateOfBirth}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                        editable={false} // Make read-only
                      />
                    </View>
                    <Icon name="calendar" size={20} color="#FFFFFF" style={{ position: 'absolute', right: 0, bottom: 16 }} />
                  </TouchableOpacity>
                  {/* Calendar Modal */}
                  <Modal
                    visible={showDatePicker}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowDatePicker(false)}
                  >
                    <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
                      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableWithoutFeedback>
                          <View style={{ width: '90%', backgroundColor: 'white', borderRadius: 12, padding: 20, maxHeight: 500 }}>

                            {/* Custom Header */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                              {calendarView === 'day' && (
                                <TouchableOpacity onPress={() => changeMonth(-1)} style={{ padding: 10 }}>
                                  <Icon name="chevron-left" size={24} color="#FA7272" />
                                </TouchableOpacity>
                              )}

                              <TouchableOpacity onPress={() => setCalendarView(calendarView === 'day' ? 'year' : 'day')} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FA7272', marginRight: 4 }}>
                                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </Text>
                                <Icon name={calendarView === 'day' ? "chevron-down" : "chevron-up"} size={20} color="#FA7272" />
                              </TouchableOpacity>

                              {calendarView === 'day' && (
                                <TouchableOpacity onPress={() => changeMonth(1)} style={{ padding: 10 }}>
                                  <Icon name="chevron-right" size={24} color="#FA7272" />
                                </TouchableOpacity>
                              )}
                            </View>

                            {/* Views */}
                            {calendarView === 'day' && (
                              <Calendar
                                current={currentDate.toISOString().split('T')[0]} // Sync with state
                                onDayPress={onDayPress}
                                maxDate={new Date().toISOString().split('T')[0]}
                                renderHeader={() => null} // Hide default header
                                hideArrows={true} // Hide default arrows
                                theme={{
                                  selectedDayBackgroundColor: '#FA7272',
                                  todayTextColor: '#FA7272',
                                  arrowColor: '#FA7272',
                                  textDayFontFamily: FONT_STYLES.englishMedium,
                                  textMonthFontFamily: FONT_STYLES.englishSemiBold,
                                  textDayHeaderFontFamily: FONT_STYLES.englishMedium,
                                }}
                              />
                            )}

                            {calendarView === 'year' && (
                              <FlatList
                                data={years}
                                keyExtractor={(item) => item.toString()}
                                numColumns={4}
                                renderItem={({ item }) => (
                                  <TouchableOpacity
                                    style={{
                                      flex: 1,
                                      padding: 10,
                                      margin: 4,
                                      backgroundColor: currentDate.getFullYear() === item ? '#FA7272' : '#f0f0f0',
                                      borderRadius: 8,
                                      alignItems: 'center'
                                    }}
                                    onPress={() => selectYear(item)}
                                  >
                                    <Text style={{ color: currentDate.getFullYear() === item ? 'white' : 'black', fontWeight: '500' }}>
                                      {item}
                                    </Text>
                                  </TouchableOpacity>
                                )}
                                style={{ maxHeight: 300 }}
                              />
                            )}

                            {calendarView === 'month' && (
                              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                                {months.map((month, index) => (
                                  <TouchableOpacity
                                    key={month}
                                    style={{
                                      width: '30%',
                                      padding: 12,
                                      margin: '1.5%',
                                      backgroundColor: currentDate.getMonth() === index ? '#FA7272' : '#f0f0f0',
                                      borderRadius: 8,
                                      alignItems: 'center'
                                    }}
                                    onPress={() => selectMonth(index)}
                                  >
                                    <Text style={{ color: currentDate.getMonth() === index ? 'white' : 'black', fontWeight: '500' }}>
                                      {month.substring(0, 3)}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            )}

                          </View>
                        </TouchableWithoutFeedback>
                      </View>
                    </TouchableWithoutFeedback>
                  </Modal>
                </View>


                {/* Tell Us About Yourself - Textarea */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Tell us about yourself</Text>
                  <TextInput
                    style={styles.textArea}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Share a bit about yourself, your interests, hobbies, or anything you'd like others to know..."
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    multiline={true}
                    numberOfLines={4}
                    textAlignVertical="top"
                    autoCorrect={true}
                  />
                </View>

              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Next</Text>
                <Icon name="arrow-right" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      {/* Country Picker Modal */}
      <CountryPickerModal
        visible={showCountryPicker}
        onClose={() => setShowCountryPicker(false)}
        onSelect={(country) => setSelectedCountry(country)}
        selectedCountryCode={selectedCountry.code}
      />
    </SafeAreaView >
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: FONT_STYLES.englishSemiBold,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: FONT_STYLES.englishSemiBold,
  },
  input: {
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 0,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inputError: {
    // No border styling for error state
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
    color: '#FF5A5A',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONT_STYLES.englishSemiBold,
  },
});

export default Step5PersonalInfoScreen;
