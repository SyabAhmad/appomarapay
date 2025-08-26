import React, { useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
  ToastAndroid,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Clipboard from '@react-native-clipboard/clipboard';

type RootStackParamList = {
  ReceiptSuccess: {
    chainId?: string;
    chainName?: string;
    tokenId?: string;
    tokenSymbol?: string;
    selectedAmount?: string; // USD
    tokenAmount?: string; // token units (optional)
    receivingAddress?: string;
    phone?: string;
  } | undefined;
  QrCodeScreen: { address?: string; chainName?: string } | undefined;
  PaymentMethod: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'ReceiptSuccess'>;

const ReceiptSuccess: React.FC<Props> = ({ navigation, route }) => {
  const {
    chainName = 'Ethereum',
    tokenSymbol = 'ETH',
    selectedAmount = '0.00',
    tokenAmount,
    receivingAddress = '0x964a7DFb7AEf009B8f7Ed8743FF458e6ecd4bCA2',
    phone,
  } = route.params ?? {};

  const txId = useMemo(() => `TX-${Math.random().toString(36).slice(2, 9).toUpperCase()}`, []);
  const timestamp = useMemo(() => new Date().toLocaleString(), []);

  const onScanQr = () => {
    navigation.navigate('QrCodeScreen' as never, { address: receivingAddress, chainName } as never);
  };

  const onCopyAddress = () => {
    Clipboard.setString(receivingAddress);
    if (Platform.OS === 'android') ToastAndroid.show('Address copied', ToastAndroid.SHORT);
    else Alert.alert('Copied', 'Address copied to clipboard');
  };

  const onSendSms = () => {
    // stub: integrate SMS provider
    console.info('send e-receipt (stub)', { phone, txId });
    Alert.alert('Sent', 'E-Receipt sent via SMS (simulated)');
  };

  const onPrint = () => {
    // stub: implement print/PDF
    console.info('print e-receipt (stub)', { txId });
    Alert.alert('Print', 'Print dialog (simulated)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

        {/* QR section */}
        <View style={styles.qrWrap}>
          <Text style={styles.qrTitle}>Scan QR code to pay</Text>
          <Image source={require('../../assets/vaadin_qrcode.png')} style={styles.qrImage} resizeMode="contain" />
          <View style={styles.addressRow}>
            <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
              {receivingAddress}
            </Text>
            <TouchableOpacity style={styles.copyBtn} onPress={onCopyAddress} activeOpacity={0.85}>
              <Text style={styles.copyBtnText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment details card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.left}>
              <Text style={styles.label}>Network</Text>
              <Text style={styles.value}>{chainName}</Text>
            </View>

            <View style={styles.right}>
              <Text style={styles.label}>Token</Text>
              <Text style={styles.value}>{tokenSymbol.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.amountBlock}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amountText}>${Number(selectedAmount).toFixed(2)}</Text>
            {tokenAmount ? <Text style={styles.tokenAmount}>{tokenAmount} {tokenSymbol}</Text> : null}
          </View>

          <View style={styles.metaRow}>
            <View>
              <Text style={styles.smallLabel}>Customer</Text>
              <Text style={styles.smallValue}>{phone ?? '-'}</Text>
            </View>

            <View>
              <Text style={styles.smallLabel}>Date</Text>
              <Text style={styles.smallValue}>{timestamp}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.receiptRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.smallLabel}>Receipt</Text>
              <Text style={styles.txId}>{txId}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.smsBtn} onPress={onSendSms} activeOpacity={0.9}>
            <Text style={styles.smsText}>Send E-Receipt Via SMS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.printBtn} onPress={onPrint} activeOpacity={0.9}>
            <Text style={styles.printText}>Print E-Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'PaymentMethod' as never }] })}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fafc' },
  container: { alignItems: 'center', padding: 18, paddingBottom: 40 },
  logo: { width: 140, height: 44, marginBottom: 8 },

  qrWrap: { width: '100%', maxWidth: 640, alignItems: 'center', marginBottom: 14, backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 3 },
  qrTitle: { fontWeight: '800', fontSize: 16, marginBottom: 8, color: '#0f172a' },
  qrImage: { width: 180, height: 180, backgroundColor: '#fff', borderRadius: 8, marginBottom: 12 },

  addressRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  addressText: { flex: 1, marginRight: 12, color: '#111827', fontWeight: '700' },
  copyBtn: { backgroundColor: '#eef2ff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  copyBtnText: { color: '#2563eb', fontWeight: '800' },

  card: { width: '100%', maxWidth: 640, backgroundColor: '#fff', borderRadius: 12, padding: 18, marginTop: 6, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 4 },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  left: { flex: 1 },
  right: { alignItems: 'flex-end' },
  label: { color: '#6b7280', fontSize: 13 },
  value: { fontWeight: '800', fontSize: 15, marginTop: 4 },

  separator: { height: 1, backgroundColor: '#eef2ff', marginVertical: 12 },

  amountBlock: { alignItems: 'center' },
  amountLabel: { color: '#6b7280', fontSize: 13 },
  amountText: { fontSize: 36, fontWeight: '900', marginTop: 6, color: '#0f172a' },
  tokenAmount: { marginTop: 6, color: '#6b7280', fontWeight: '700' },

  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },

  smallLabel: { color: '#94a3b8', fontSize: 12 },
  smallValue: { fontSize: 13, fontWeight: '700', marginTop: 4 },

  receiptRow: { marginTop: 8 },
  txId: { fontSize: 13, fontWeight: '700', marginTop: 6, color: '#111827' },

  bottomActions: { width: '100%', maxWidth: 640, marginTop: 16, flexDirection: 'column', justifyContent: 'space-between', gap: 12 },
  smsBtn: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  smsText: { color: '#fff', fontWeight: '800' },
  printBtn: { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#e6eef8' },
  printText: { color: '#2563eb', fontWeight: '800' },
  doneBtn: { backgroundColor: '#0f172a', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  doneText: { color: '#fff', fontWeight: '800' },
});

export default ReceiptSuccess;