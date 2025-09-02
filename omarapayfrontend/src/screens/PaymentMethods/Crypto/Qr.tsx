import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Clipboard from '@react-native-clipboard/clipboard';

type RootStackParamList = {
  QrCodeScreen: { address?: string; chainName?: string } | undefined;
  PaymentMethod: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'QrCodeScreen'>;

const QrCodeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { address = '0x964a7DFb7AEf009B8f7Ed8743FF458e6ecd4bCA2', chainName = 'Ethereum' } = route.params ?? {};

  const onCopy = () => {
    Clipboard.setString(address);
    Alert.alert('Copied', 'Address copied to clipboard');
  };

  const onUseAddress = () => {
    console.info('Use address pressed — implement share/send flow');
    Alert.alert('Info', 'Use this address in wallet (stub)');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>‹ Back</Text></TouchableOpacity>
        <Text style={styles.title}>QR code</Text>
        <View style={{ width: 60 }} />
      </View>

      <Image source={require('../../../../assets/vaadin_qrcode.png')} style={styles.qr} resizeMode="contain" />

      <Text style={styles.note}>Scan QR Code using your Crypto wallet</Text>

      <View style={styles.addressBox}>
        <Text style={styles.addressText} numberOfLines={2}>{address}</Text>
        <TouchableOpacity style={styles.copyBtn} onPress={onCopy}><Text style={styles.copyText}>Copy</Text></TouchableOpacity>
      </View>

      <View style={styles.meta}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Cryptocurrency:</Text>
          <Text style={styles.metaValue}>{chainName}</Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onUseAddress}>
          <Text style={styles.primaryText}>I already paid / Use address</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 16, paddingBottom: 40, backgroundColor: '#f7fafc' },
  headerRow: { width: '100%', maxWidth: 640, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  back: { color: '#2563eb', fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '800', color: '#0f172a' },

  qr: { width: 260, height: 260, backgroundColor: '#fff', borderRadius: 8, padding: 12, marginVertical: 10 },

  note: { color: '#6b7280', textAlign: 'center', marginBottom: 12 },

  addressBox: { width: '100%', maxWidth: 560, backgroundColor: '#fff', borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#eef2ff' },
  addressText: { flex: 1, color: '#111827', fontWeight: '700', marginRight: 8 },
  copyBtn: { backgroundColor: '#eef2ff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  copyText: { color: '#2563eb', fontWeight: '800' },

  meta: { width: '100%', maxWidth: 560, marginTop: 16 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metaLabel: { color: '#6b7280' },
  metaValue: { fontWeight: '800' },

  primaryBtn: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '800' },
});

export default QrCodeScreen;
