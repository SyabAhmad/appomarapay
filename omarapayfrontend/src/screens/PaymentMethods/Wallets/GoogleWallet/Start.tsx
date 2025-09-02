// Google Wallet placeholder (no reuse/import of GCashMethod)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const GoogleWalletStart: React.FC<any> = ({ navigation }) => {
  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Google Wallet</Text>
        <View style={{ width: 60 }} />
      </View>

      <Image source={require('../../../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

      <Text style={styles.subtitle}>Google Wallet flow coming soon</Text>

      <TouchableOpacity style={styles.primary} onPress={() => navigation.navigate('PaymentMethod' as never)}>
        <Text style={styles.primaryText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingTop: 28 },
  header: { width: '100%', maxWidth: 560, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  back: { color: '#2563eb', fontWeight: '800' },
  title: { fontSize: 16, fontWeight: '800' },
  logo: { width: 150, height: 54, marginTop: 6, marginBottom: 18 },
  subtitle: { color: '#6b7280' },
  primary: { marginTop: 18, backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  primaryText: { color: '#fff', fontWeight: '800' },
});

export default GoogleWalletStart;
