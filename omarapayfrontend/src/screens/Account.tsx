import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AccountScreenProp } from '../typings/types';

const Account: React.FC<AccountScreenProp> = ({ navigation }) => {
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [cashierName, setCashierName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [cName, caName] = await AsyncStorage.multiGet(['companyName', 'cashierName']);
      setCompanyName(cName[1]);
      setCashierName(caName[1]);
    })();
  }, []);

  const handleCompanyLogout = () => {
    navigation.navigate('Logout', { logoutFrom: 'Company' });
  };

  const handleCashierLogout = () => {
    navigation.navigate('Logout', { logoutFrom: 'Cashier' });
  };

  const handleTransactionHistory = () => {
    navigation.navigate('TransactionHistory');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Account</Text></View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Company</Text>
          <Text style={styles.value}>{companyName ?? 'Not set'}</Text>
          <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={handleCompanyLogout}>
            <Text style={styles.btnTextPrimary}>Logout company</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Cashier</Text>
          <Text style={styles.value}>{cashierName ?? 'Not set'}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleTransactionHistory}>
              <Text style={styles.btnTextPrimary}>Transaction history</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={handleCashierLogout}>
              <Text style={styles.btnTextSecondary}>Logout cashier</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flex: 1 },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#007DFF' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  content: { padding: 20, gap: 20 },
  card: { backgroundColor: '#f8f9fa', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#e9ecef', gap: 10 },
  title: { color: '#333', fontSize: 16, fontWeight: '700' },
  value: { color: '#111', fontSize: 18, fontWeight: '600' },
  btn: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: '#007DFF' },
  btnSecondary: { backgroundColor: '#e9ecef' },
  btnDanger: { backgroundColor: '#ff4d4f' },
  btnTextPrimary: { color: '#fff', fontWeight: '700' },
  btnTextSecondary: { color: '#333', fontWeight: '700' },
});

export default Account;