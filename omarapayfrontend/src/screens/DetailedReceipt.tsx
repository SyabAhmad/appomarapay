import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Clipboard from '@react-native-clipboard/clipboard';

type RootStackParamList = {
  DetailedReceipt: {
    chainName?: string;
    tokenSymbol?: string;
    tokenAmount?: string;
    usdAmount?: string;
    mobile?: string;
    receivingAddress?: string;
  } | undefined;
  QrCodeScreen: { address?: string; chainName?: string } | undefined;
  PaymentMethod: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'DetailedReceipt'>;

const DetailedReceipt: React.FC<Props> = ({ navigation, route }) => {
  const {
    chainName = 'Ethereum',
    tokenSymbol = 'ETH',
    tokenAmount = '0.00819471',
    usdAmount = '25',
    mobile = '25869321789',
    receivingAddress = '0x964a7DFb7AEf009B8f7Ed8743FF458e6ecd4bCA2',
  } = route.params ?? {};

  const txId = useMemo(() => `TX-${Math.random().toString(36).slice(2, 9).toUpperCase()}`, []);

  const copyAddress = () => {
    Clipboard.setString(receivingAddress);
    Alert.alert('Copied', 'Address copied to clipboard');
  };

  const sendReceiptSms = () => {
    console.info('sendReceiptSms stub — implement SMS API');
    Alert.alert('Sent', 'E-receipt (simulated) sent via SMS');
  };

  const verifyTransaction = () => {
    console.info('verifyTransaction stub — open block explorer / call API');
    Alert.alert('Verify', 'Open explorer (stub)');
  };

  const printReceipt = () => {
    console.info('printReceipt stub');
    Alert.alert('Print', 'Print (simulated)');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Successful Payment</Text>
        <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: 'PaymentMethod' as never }] })}>
          <Text style={styles.logout}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.topBadge}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.success}>Successful Payment</Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={verifyTransaction}>
          <Text style={styles.primaryBtnText}>Verify transaction on Blockchain</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.navigate('PaymentMethod' as never)}>
          <Text style={styles.ghostText}>New transaction</Text>
        </TouchableOpacity>

        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Cryptocurrency:</Text>
            <Text style={styles.value}>{chainName}</Text>
          </View>
          <View style={styles.infoColRight}>
            <Text style={styles.label}>Amount:</Text>
            <Text style={styles.valueRight}>{tokenAmount} {tokenSymbol}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.label}>In USD rate:</Text>
            <Text style={styles.value}>${usdAmount}</Text>
          </View>
          <View style={styles.infoColRight}>
            <Text style={styles.label}>Mobile number:</Text>
            <Text style={styles.valueRight}>{mobile}</Text>
          </View>
        </View>

        <View style={styles.addressRow}>
          <Text style={styles.label}>Receiving Address:</Text>
          <Text style={styles.address} numberOfLines={2}>{receivingAddress}</Text>

          <View style={styles.addressActions}>
            <TouchableOpacity style={styles.copyBtn} onPress={copyAddress}>
              <Text style={styles.copyText}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.qrBtn} onPress={() => navigation.navigate('QrCodeScreen' as never, { address: receivingAddress, chainName } as never)}>
              <Text style={styles.qrText}>Show QR</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={sendReceiptSms}>
          <Text style={styles.primaryBtnText}>Send E-Receipt Via SMS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghostBtn} onPress={printReceipt}>
          <Text style={styles.ghostText}>Print E-Receipt</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 40, backgroundColor: '#f7fafc' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  header: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  logout: { color: '#2563eb', fontWeight: '700' },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },

  topBadge: { alignItems: 'center', marginBottom: 12 },
  logo: { width: 120, height: 36, marginBottom: 8 },
  success: { fontSize: 16, fontWeight: '800', color: '#0f172a' },

  primaryBtn: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginVertical: 8 },
  primaryBtnText: { color: '#fff', fontWeight: '800' },

  ghostBtn: { backgroundColor: '#f1f5f9', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginVertical: 6 },
  ghostText: { color: '#0f172a', fontWeight: '700' },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  infoCol: { flex: 1 },
  infoColRight: { flex: 1, alignItems: 'flex-end' },
  label: { color: '#6b7280', fontSize: 13 },
  value: { fontWeight: '800', fontSize: 14, marginTop: 4 },
  valueRight: { fontWeight: '800', fontSize: 14, marginTop: 4 },

  addressRow: { marginTop: 12 },
  address: { marginTop: 6, color: '#111827', fontWeight: '700' },
  addressActions: { flexDirection: 'row', marginTop: 10 },
  copyBtn: { backgroundColor: '#eef2ff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginRight: 8 },
  copyText: { color: '#2563eb', fontWeight: '800' },
  qrBtn: { backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e6eef8' },
  qrText: { color: '#2563eb', fontWeight: '800' },
});

export default DetailedReceipt;