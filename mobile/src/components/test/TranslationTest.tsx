import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import localizationService from '../../services/localizationService';

const TranslationTest: React.FC = () => {
  const { t } = useTranslation();

  // Test various translation keys
  const testKeys = [
    'error',
    'success',
    'nav.home',
    'nav.settings',
    'ui.button.save',
    'ui.button.cancel',
    'Circle.loadError',
    'profile.circleSettings',
    'auth.login',
    'auth.register'
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Translation Test</Text>
      {testKeys.map((key) => (
        <View key={key} style={styles.row}>
          <Text style={styles.key}>{key}:</Text>
          <Text style={styles.value}>"{t(key)}"</Text>
        </View>
      ))}
      
      <Text style={styles.title}>Direct Service Test</Text>
      {testKeys.map((key) => (
        <View key={key} style={styles.row}>
          <Text style={styles.key}>{key}:</Text>
          <Text style={styles.value}>"{localizationService.t(key)}"</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  key: {
    flex: 1,
    fontWeight: 'bold',
  },
  value: {
    flex: 2,
    color: '#666',
  },
});

export default TranslationTest;

