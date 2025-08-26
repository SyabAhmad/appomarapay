import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { CashierLoginScreenProp } from '../typings/types';

const CashierLogin: React.FC<CashierLoginScreenProp> = ({ navigation, route }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { id } = route.params;

  useFocusEffect(
    useCallback(() => {
      setPassword('');
    }, [])
  );

  const handleKeyPress = (value: string) => {
    if (value === 'delete') setPassword(prev => prev.slice(0, -1));
    else if (password.length < 10) setPassword(prev => prev + value);
  };

  const renderKey = (value: string) => (
    <TouchableOpacity key={value} style={styles.keyButton} onPress={() => handleKeyPress(value)}>
      <Text style={styles.keyText}>{value === 'delete' ? '⌫' : value}</Text>
    </TouchableOpacity>
  );

  const handleLogin = async () => {
    if (password.length < 4) {
      Alert.alert('Error', 'Enter a valid PIN');
      return;
    }
    setLoading(true);
    try {
      // Frontend-only mock
      await AsyncStorage.multiSet([
        ['cashierLoggedIn', 'true'],
        ['cashierId', String(id)],
        ['cashierName', 'Demo Cashier'],
      ]);
      navigation.replace('Currencies');
    } catch {
      Alert.alert('Error', 'Failed to save login state');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}><Text style={styles.headerTitle}>Cashier Login</Text></View>
      <ScrollView contentContainerStyle={styles.contentWrapper}>
        <Text style={styles.subtitle}>Enter your cashier PIN</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>PIN</Text>
          <TextInput
            style={styles.input}
            value={password.replace(/./g, '•')}
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

        <TouchableOpacity
          style={[styles.loginButton, { opacity: loading || !password ? 0.5 : 1 }]}
          onPress={handleLogin}
          disabled={loading || !password}
        >
          <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Login'}</Text>
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

export default CashierLogin;