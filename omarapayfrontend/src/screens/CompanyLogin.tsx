import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { CompanyLoginScreenProp } from '../typings/types';

const CompanyLogin: React.FC<CompanyLoginScreenProp> = ({ navigation }) => {
  const [pin, setPin] = useState('');

  const handleLogin = async () => {
    if (pin.length < 4) {
      Alert.alert('Error', 'Enter a valid PIN');
      return;
    }
    await AsyncStorage.multiSet([
      ['companyLoggedIn', 'true'],
      ['companyId', '1'],
      ['companyName', 'Demo Company'],
    ]);
    navigation.replace('Cashiers');
  };

  const handleKeyPress = (value: string) => {
    if (value === 'delete') setPin(prev => prev.slice(0, -1));
    else if (pin.length < 10) setPin(prev => prev + value);
  };

  const renderKey = (value: string) => (
    <TouchableOpacity key={value} style={styles.keyButton} onPress={() => handleKeyPress(value)}>
      <Text style={styles.keyText}>{value === 'delete' ? '⌫' : value}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}><Text style={styles.headerTitle}>Company Login</Text></View>
      <ScrollView contentContainerStyle={styles.contentWrapper}>
        <Text style={styles.subtitle}>Enter your company PIN</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>PIN</Text>
          <TextInput
            style={styles.input}
            value={pin.replace(/./g, '•')}
            placeholder="Enter PIN"
            editable={false}
            secureTextEntry
          />
        </View>

        <View style={styles.keypadContainer}>
          <View style={styles.keypadRow}>{['1', '2', '3'].map(renderKey)}</View>
          <View style={styles.keypadRow}>{['4', '5', '6'].map(renderKey)}</View>
          <View style={styles.keypadRow}>{['7', '8', '9'].map(renderKey)}</View>
          <View style={styles.keypadRow}>
            <View style={styles.keyButton} />
            {renderKey('0')}
            {renderKey('delete')}
          </View>
        </View>

        <TouchableOpacity style={[styles.loginButton, { opacity: pin ? 1 : 0.5 }]} onPress={handleLogin} disabled={!pin}>
          <Text style={styles.loginButtonText}>Next</Text>
        </TouchableOpacity>

        <Text style={styles.helpText}>Demo PIN: any 4+ digits</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { padding: 20, paddingTop: 50, backgroundColor: '#007DFF' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  contentWrapper: { padding: 20, flexGrow: 1 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#666' },
  inputWrapper: { marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 8, fontSize: 18, textAlign: 'center' },
  keypadContainer: { marginVertical: 20 },
  keypadRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  keyButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  keyText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  loginButton: { backgroundColor: '#007DFF', paddingVertical: 15, borderRadius: 8, marginTop: 20 },
  loginButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  helpText: { textAlign: 'center', marginTop: 20, color: '#888', fontSize: 14 },
});

export default CompanyLogin;