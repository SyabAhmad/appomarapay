import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';

export default function WalletStart({ navigation }) {
  const onLogout = () => navigation.reset({ index: 0, routes: [{ name: 'PinAuth' }] });

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>{'< Back'}</Text>
          </TouchableOpacity>

          <Text style={styles.topTitle}>Choose Wallet</Text>

          <TouchableOpacity style={styles.outlineBtn} onPress={onLogout}>
            <Text style={styles.outlineBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

        <Text style={styles.sectionSubtitle}>Select the wallet to receive payment</Text>

        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.walletCard}
            onPress={() => navigation.navigate('GCashAmountEntry', { chainId: 'gcash', chainName: 'GCash' })}
            activeOpacity={0.9}
          >
            <Text style={styles.walletEmoji}>📱</Text>
            <Text style={styles.walletName}>GCash</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.walletCard}
            onPress={() => navigation.navigate('GoogleWalletAmountEntry', { chainId: 'googlewallet', chainName: 'Google Wallet' })}
            activeOpacity={0.9}
          >
            <Text style={styles.walletEmoji}>🅖</Text>
            <Text style={styles.walletName}>Google Wallet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { paddingTop: 28, paddingBottom: 40, paddingHorizontal: 16, alignItems: 'center' },
  topRow: { width: '100%', maxWidth: 560, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  back: { color: '#2563eb', fontWeight: '800' },
  outlineBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  outlineBtnText: { color: '#111827', fontWeight: '700' },
  topTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  logo: { width: 150, height: 54, marginTop: 6, marginBottom: 12 },
  sectionSubtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 12 },
  grid: { width: '100%', maxWidth: 560, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  walletCard: { width: '48%', minHeight: 90, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 12, marginTop: 8 },
  walletEmoji: { fontSize: 28, marginBottom: 6 },
  walletName: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'center' },
});