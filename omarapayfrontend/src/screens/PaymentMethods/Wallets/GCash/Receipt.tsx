import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, Linking, ActivityIndicator, TouchableOpacity, Platform, ToastAndroid } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Clipboard from '@react-native-clipboard/clipboard';
import { API_BASE } from '../../../../config/env';

type RootStackParamList = {
  GCashReceipt: {
    chainName?: string; // GCash
    phpAmount?: string;
    mobile?: string;
    hosted_url?: string | null;
    chargeId?: string | null;
    txId?: string | null;
  } | undefined;
  PaymentMethod: undefined;
  GCashSuccess: any;
  GCashFailure: any;
};

type Props = NativeStackScreenProps<RootStackParamList, 'GCashReceipt'>;

const DetailedReceipt: React.FC<Props> = ({ navigation, route }) => {
  const {
    chainName = 'GCash',
    phpAmount = '0.00',
    mobile = '-',
    hosted_url = null,
    chargeId = null,
    txId = null,
  } = route.params ?? {};

  const [checking, setChecking] = useState(false);
  const txIdLocal = useMemo(() => txId ?? `TX-${Math.random().toString(36).slice(2, 9).toUpperCase()}`, [txId]);
  const timestamp = useMemo(() => new Date().toLocaleString(), []);

  const copyLink = () => {
    const url = hosted_url || '';
    if (!url) return;
    Clipboard.setString(url);
    if (Platform.OS === 'android') ToastAndroid.show('Copied', ToastAndroid.SHORT);
    else Alert.alert('Copied', 'Copied to clipboard');
  };

  const openHosted = async () => {
    const url = hosted_url || '';
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Cannot open link', url);
    } catch (e: any) {
      Alert.alert('Open failed', e?.message ?? 'Unable to open link');
    }
  };

  const checkGcashStatus = async () => {
    if (!chargeId) {
      Alert.alert('Missing id', 'Cannot check GCash status');
      return;
    }
    setChecking(true);
    try {
      const res = await fetch(`${API_BASE}/api/payments/gcash/${encodeURIComponent(chargeId)}`);
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        Alert.alert('Error', body?.message ?? `Status ${res.status}`);
        return;
      }
      const status = String(body?.status || '').toLowerCase();
      if (['succeeded', 'paid', 'completed'].includes(status)) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'GCashSuccess' as never, params: { success: true, chainName, phpAmount, mobile, receivingAddress: hosted_url ?? '-' } as never }],
        });
      } else if (['failed', 'canceled'].includes(status)) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'GCashFailure' as never, params: { chainName, phpAmount, mobile, errorMessage: `Payment ${status}` } as never }],
        });
      } else {
        Alert.alert('Status', `Payment status: ${status || 'pending'}`);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Unable to check status');
    } finally {
      setChecking(false);
    }
  };

  const onDone = () => {
    // default final is failure unless success confirmed
    navigation.reset({
      index: 0,
      routes: [{ name: 'GCashFailure' as never, params: { chainName, phpAmount, mobile, errorMessage: 'Payment not completed' } as never }],
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>GCash Payment</Text>
        <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: 'PaymentMethod' as never }] })}>
          <Text style={styles.logout}>Close</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.qrWrap}>
        <Text style={styles.qrTitle}>{hosted_url ? 'Checkout QR' : 'Receipt'}</Text>

        {hosted_url ? (
          <Image
            source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(hosted_url)}` }}
            style={styles.qrImage}
            resizeMode="contain"
          />
        ) : (
          <Text style={{ color: '#6b7280', marginBottom: 12 }}>No GCash checkout link yet</Text>
        )}

        {hosted_url ? (
          <>
            <View style={styles.linkRow}>
              <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="middle">
                {hosted_url}
              </Text>
              <TouchableOpacity style={styles.copyBtn} onPress={copyLink}>
                <Text style={styles.copyText}>Copy</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={openHosted}>
              <Text style={styles.primaryBtnText}>Open GCash checkout</Text>
            </TouchableOpacity>
          </>
        ) : null}

        <TouchableOpacity
          style={[styles.primaryBtn, { marginTop: 8 }]}
          onPress={checkGcashStatus}
          disabled={checking}
        >
          {checking ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Check GCash status</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.navigate('PaymentMethod' as never)}>
          <Text style={styles.ghostText}>New transaction</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Image source={require('../../../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.success}>Amount</Text>
        <Text style={styles.amount}>₱{Number(phpAmount || '0').toFixed(2)}</Text>

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

        <TouchableOpacity style={styles.primaryBtn} onPress={onDone}>
          <Text style={styles.primaryBtnText}>Send E-Receipt Via SMS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghostBtn}>
          <Text style={styles.ghostText}>Print E-Receipt</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.doneBtn} onPress={onDone}>
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
  qrWrap: { width: '100%', maxWidth: 720, alignItems: 'center', marginBottom: 14, backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6 },
  qrTitle: { fontWeight: '800', fontSize: 16, marginBottom: 8, color: '#0f172a' },
  qrImage: { width: 180, height: 180, backgroundColor: '#fff', borderRadius: 8, marginBottom: 12 },
  linkRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  linkText: { flex: 1, marginRight: 12, color: '#111827', fontWeight: '700' },
  copyBtn: { backgroundColor: '#eef2ff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  copyText: { color: '#2563eb', fontWeight: '800' },
  card: { width: '100%', maxWidth: 720, backgroundColor: '#fff', borderRadius: 12, padding: 18, marginTop: 6, marginBottom: 16, elevation: 4, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  logo: { width: 120, height: 36, marginBottom: 8, alignSelf: 'center' },
  success: { fontSize: 16, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  amount: { fontSize: 36, fontWeight: '900', marginTop: 8, textAlign: 'center' },
  primaryBtn: { backgroundColor: '#2563eb', padding: 12, borderRadius: 10, alignItems: 'center', marginVertical: 8, width: '100%', maxWidth: 720 },
  primaryBtnText: { color: '#fff', fontWeight: '800' },
  ghostBtn: { backgroundColor: '#f1f5f9', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginVertical: 6, width: '100%', maxWidth: 720 },
  ghostText: { color: '#0f172a', fontWeight: '700' },
  separator: { height: 1, backgroundColor: '#eef2ff', marginVertical: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  smallLabel: { color: '#94a3b8', fontSize: 12 },
  smallValue: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  receiptRow: { marginTop: 8 },
  txId: { fontSize: 13, fontWeight: '700', marginTop: 6, color: '#111827' },
  doneBtn: { backgroundColor: '#2563eb', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 16, width: '100%', maxWidth: 720 },
  doneText: { color: '#fff', fontWeight: '800' },
});

export default DetailedReceipt;
