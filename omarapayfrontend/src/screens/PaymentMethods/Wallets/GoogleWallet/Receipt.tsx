import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, Platform, ToastAndroid, Linking, ActivityIndicator, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Clipboard from '@react-native-clipboard/clipboard';
import { API_BASE } from '../../../../config/env';
type RootStackParamList = {
  GoogleWalletReceipt: {
    chainName?: string;
    tokenSymbol?: string;
    tokenAmount?: string;
    usdAmount?: string;
    mobile?: string;
    paymentIntentId?: string | null; // optional explicit PI id
    receivingAddress?: string | null; // we use this to carry PI id if provided
    txId?: string | null; // same as PI id for display
  } | undefined;
  WalletStart: undefined;
  GoogleWalletSuccess: undefined;
  GoogleWalletFailure: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'GoogleWalletReceipt'>;

const DetailedReceipt: React.FC<Props> = ({ navigation, route }) => {
  const {
    chainName = 'Google Wallet',
    tokenSymbol = 'USD',
    tokenAmount = undefined,
    usdAmount = '0.00',
    mobile = '-',
    receivingAddress = null,
    paymentIntentId = null,
    txId = null,
  } = route.params ?? {};

  const [checking, setChecking] = useState(false);

  const piId = useMemo(() => paymentIntentId || receivingAddress || txId || '', [paymentIntentId, receivingAddress, txId]);
  const txIdLocal = useMemo(() => piId || `TX-${Math.random().toString(36).slice(2, 9).toUpperCase()}`, [piId]);
  const timestamp = useMemo(() => new Date().toLocaleString(), []);

  const copyId = () => {
    if (!piId) return;
    Clipboard.setString(piId);
    if (Platform.OS === 'android') ToastAndroid.show('Copied', ToastAndroid.SHORT);
    else Alert.alert('Copied', 'Payment ID copied');
  };

  // Google Wallet (Stripe) status check using PaymentIntent id
  const checkGoogleWalletStatus = async () => {
    if (!piId) {
      Alert.alert('Missing id', 'Cannot check status');
      return;
    }
    setChecking(true);
    try {
      const res = await fetch(`${API_BASE}/api/payments/card/${encodeURIComponent(piId)}`);
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        Alert.alert('Error', body?.message ?? `Status ${res.status}`);
        return;
      }
      const status = String(body?.status || '').toUpperCase();
      if (['SUCCEEDED', 'COMPLETED'].includes(status)) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'GoogleWalletSuccess' as never, params: { success: true, chainName, tokenSymbol: 'USD', tokenAmount, usdAmount, mobile } as never }],
        });
      } else if (['CANCELED', 'FAILED', 'REQUIRES_PAYMENT_METHOD'].includes(status)) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'GoogleWalletFailure' as never, params: { chainName, tokenSymbol: 'USD', tokenAmount, usdAmount, mobile, errorMessage: `Payment ${status}` } as never }],
        });
      } else {
        Alert.alert('Status', `Payment status: ${status || 'PENDING'}`);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Unable to check status');
    } finally {
      setChecking(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Payment</Text>
        <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: 'PaymentMethod' as never }] })}>
          <Text style={styles.logout}>Close</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.qrWrap}>
        <Text style={styles.qrTitle}>Payment details</Text>
        <View style={styles.addressRow}>
          <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
            Payment ID: {txIdLocal}
          </Text>
          <TouchableOpacity style={styles.copyBtn} onPress={copyId}>
            <Text style={styles.copyText}>Copy</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.primaryBtn, { marginTop: 8 }]}
          onPress={checkGoogleWalletStatus}
          disabled={checking}
        >
          {checking ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Check Google Wallet status</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'WalletStart' as never }] })}>
          <Text style={styles.ghostText}>New transaction</Text>
        </TouchableOpacity>
      </View>

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

      <View style={styles.separator} />

      <View style={styles.metaRow}>
        <View>
          <Text style={styles.smallLabel}>Customer</Text>
          <Text style={styles.smallValue}>{mobile}</Text>
        </View>

        <View>
          <Text style={styles.smallLabel}>Date</Text>
          <Text style={styles.smallValue}>{timestamp}</Text>
        </View>
      </View>

      <View style={[styles.separator, { marginTop: 12 }]} />

      <View style={styles.receiptRow}>
        <Text style={styles.smallLabel}>Receipt</Text>
        <Text style={styles.txId}>{txIdLocal}</Text>
      </View>

      <TouchableOpacity style={styles.primaryBtn}>
        <Text style={styles.primaryBtnText}>Send E-Receipt Via SMS</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.ghostBtn}>
        <Text style={styles.ghostText}>Print E-Receipt</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.doneBtn}
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [
              {
                // Default to failure unless explicitly confirmed
                name: 'GoogleWalletFailure' as never,
                params: { chainName, tokenSymbol: 'USD', tokenAmount, usdAmount, mobile, errorMessage: 'Payment not completed' } as never,
              },
            ],
          })
        }
      >
        <Text style={styles.doneText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 40, backgroundColor: '#f7fafc', alignItems: 'center' },
  headerRow: { width: '100%', maxWidth: 720, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  header: { fontSize: 18, fontWeight: '800' },
  logout: { color: '#2563eb', fontWeight: '700' },

  qrWrap: { width: '100%', maxWidth: 720, alignItems: 'center', marginBottom: 14, backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 3 },
  qrTitle: { fontWeight: '800', fontSize: 16, marginBottom: 8, color: '#0f172a' },
  qrImage: { width: 180, height: 180, backgroundColor: '#fff', borderRadius: 8, marginBottom: 12 },

  addressRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  addressText: { flex: 1, marginRight: 12, color: '#111827', fontWeight: '700' },
  copyBtn: { backgroundColor: '#eef2ff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  copyText: { color: '#2563eb', fontWeight: '800' },

  card: { width: '100%', maxWidth: 720, backgroundColor: '#fff', borderRadius: 12, padding: 18, marginTop: 6, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 4 },
  topBadge: { alignItems: 'center', marginBottom: 12 },
  logo: { width: 120, height: 36, marginBottom: 8 },
  success: { fontSize: 16, fontWeight: '800', color: '#0f172a' },

  primaryBtn: { backgroundColor: '#2563eb', padding: 12, borderRadius: 10, alignItems: 'center', marginVertical: 8 },
  primaryBtnText: { color: '#fff', fontWeight: '800' },

  ghostBtn: { backgroundColor: '#f1f5f9', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginVertical: 6 },
  ghostText: { color: '#0f172a', fontWeight: '700' },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  infoCol: { flex: 1 },
  infoColRight: { flex: 1, alignItems: 'flex-end' },
  label: { color: '#6b7280', fontSize: 13 },
  value: { fontWeight: '800', fontSize: 14, marginTop: 4 },
  valueRight: { fontWeight: '800', fontSize: 14, marginTop: 4 },

  separator: { height: 1, backgroundColor: '#eef2ff', marginVertical: 12 },

  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  smallLabel: { color: '#94a3b8', fontSize: 12 },
  smallValue: { fontSize: 13, fontWeight: '700', marginTop: 4 },

  receiptRow: { marginTop: 8 },
  txId: { fontSize: 13, fontWeight: '700', marginTop: 6, color: '#111827' },

  doneBtn: { backgroundColor: '#2563eb', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  doneText: { color: '#fff', fontWeight: '800' },
});

export default DetailedReceipt;
