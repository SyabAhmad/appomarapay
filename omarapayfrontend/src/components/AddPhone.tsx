import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  showAmount?: boolean;
  tabletTitle: string;
  mobileTitle: string;
}

const AddPhone: React.FC<Props> = ({ showAmount, tabletTitle, mobileTitle }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      return () => setPhoneNumber('');
    }, []),
  );

  const handleKeyPress = (value: string) => {
    if (value === 'delete') setPhoneNumber(prev => prev.slice(0, -1));
    else if (value === 'clear') setPhoneNumber('');
    else if (phoneNumber.length < 15) setPhoneNumber(prev => prev + value);
  };

  const renderKey = (value: string, flex?: number) => (
    <TouchableOpacity
      key={value}
      style={[styles.keyButton, flex ? { flex } : null]}
      onPress={() => handleKeyPress(value)}
    >
      <Text style={styles.keyText}>{value === 'delete' ? '⌫' : value === 'clear' ? 'Clear' : value}</Text>
    </TouchableOpacity>
  );

  const handleConfirm = async () => {
    if (!phoneNumber || phoneNumber.length < 4) return;
    setLoading(true);
    try {
      await AsyncStorage.setItem('receiptPhone', phoneNumber);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const title = mobileTitle || tabletTitle;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.subtitle}>
            {showAmount ? 'Add your phone number to receive receipt via SMS' : 'Enter phone number'}
          </Text>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            placeholder='Enter phone via keypad'
            editable={false}
          />
        </View>

        <View style={styles.keypadContainer}>
          <View style={styles.keypadRow}>{['1', '2', '3'].map(renderKey)}</View>
          <View style={styles.keypadRow}>{['4', '5', '6'].map(renderKey)}</View>
          <View style={styles.keypadRow}>{['7', '8', '9'].map(renderKey)}</View>
          <View style={styles.keypadRow}>
            {renderKey('clear')}
            {renderKey('0')}
            {renderKey('delete')}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.confirmBtn, { opacity: loading || !phoneNumber ? 0.5 : 1 }]}
          onPress={handleConfirm}
          disabled={loading || !phoneNumber}
        >
          <Text style={styles.confirmText}>{loading ? 'Saving…' : 'Continue'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flex: 1 },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#007DFF' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: '#e6f0ff', textAlign: 'center', marginTop: 6 },
  inputWrapper: { padding: 20 },
  label: { fontSize: 16, marginBottom: 8, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: '#fafafa',
  },
  keypadContainer: { paddingHorizontal: 20, marginTop: 10 },
  keypadRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  keyButton: {
    flex: 1,
    height: 56,
    marginHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#f1f3f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  keyText: { fontSize: 20, fontWeight: '700', color: '#333' },
  confirmBtn: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#007DFF',
    alignItems: 'center',
  },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default AddPhone;
