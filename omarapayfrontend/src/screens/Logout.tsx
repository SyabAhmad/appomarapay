import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { LogoutScreenProp } from '../typings/types';

const Logout: React.FC<LogoutScreenProp> = ({ navigation, route }) => {
  const { logoutFrom } = route.params;

  const handleConfirm = async () => {
    try {
      if (logoutFrom === 'Company') {
        await AsyncStorage.multiRemove(['companyLoggedIn', 'companyId', 'companyName', 'cashierLoggedIn', 'cashierId', 'cashierName']);
        navigation.reset({ index: 0, routes: [{ name: 'CompanyLogin' as never }] });
      } else {
        await AsyncStorage.multiRemove(['cashierLoggedIn', 'cashierId', 'cashierName']);
        navigation.reset({ index: 0, routes: [{ name: 'Cashiers' as never }] });
      }
    } catch {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Logout</Text></View>
      <View style={styles.content}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Are you sure that you want to log out?</Text>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleConfirm}>
            <Text style={styles.btnPrimaryText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => navigation.goBack()}>
            <Text style={styles.btnSecondaryText}>No</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#007DFF' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  logo: { height: 90, width: 200 },
  title: { color: '#111', fontSize: 20, fontWeight: '700', textAlign: 'center', marginVertical: 20 },
  row: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 8, minWidth: 120, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#007DFF' },
  btnPrimaryText: { color: 'white', fontSize: 16, fontWeight: '700' },
  btnSecondary: { backgroundColor: '#e9ecef' },
  btnSecondaryText: { color: '#333', fontSize: 16, fontWeight: '700' },
});

export default Logout;
