import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, Platform, ToastAndroid, Linking, ActivityIndicator, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Clipboard from '@react-native-clipboard/clipboard';
import { API_BASE } from '../config/env';

type RootStackParamList = {
  DetailedReceipt: {
    chainName?: string;
    tokenSymbol?: string;
    tokenAmount?: string;
    usdAmount?: string;
    mobile?: string;
    receivingAddress?: string;
    chargeId?: string | null;
    txId?: string | null;
  } | undefined;
  PaymentMethod: undefined;
  FinalSuccess: undefined;
  FinalFailure: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'CardReceipt'>;

const DetailedReceipt: React.FC<Props> = ({ navigation, route }) => {
  const {
    chainName = 'Card',
    tokenSymbol = 'USD',
    tokenAmount = '0.00',
    usdAmount = '0.00',
    mobile = '-',
    receivingAddress = '-',
    chargeId = null,
    txId = null,
  } = route.params ?? {};

  const [checking, setChecking] = useState(false);

  const txIdLocal = useMemo(() => txId ?? `TX-${Math.random().toString(36).slice(2, 9).toUpperCase()}`, [txId]);
  const timestamp = useMemo(() => new Date().toLocaleString(), []);

  const copyAddress = () => {
    const toCopy = receivingAddress ?? '-';
    Clipboard.setString(toCopy);
    if (Platform.OS === 'android') ToastAndroid.show('Copied', ToastAndroid.SHORT);
    else Alert.alert('Copied', 'Copied to clipboard');
  };

  const checkCardStatus = async () => {
    const paymentIntentId = txId ?? receivingAddress;
    if (!paymentIntentId) {
      Alert.alert('No payment id', 'Unable to check card payment status.');
      return;
    }
    setChecking(true);
    try {
      const res = await fetch(`${API_BASE}/api/payments/card/${encodeURIComponent(paymentIntentId)}`);
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        Alert.alert('Error', body?.message ?? `Status ${res.status}`);
        setChecking(false);
        return;
      }
      const status = (body?.status || '').toUpperCase();
      if (status === 'SUCCEEDED' || status === 'COMPLETED') {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'FinalSuccess' as never,
              params: {
                success: true,
                chainName: 'Card',
                tokenSymbol: 'USD',
                tokenAmount,
                usdAmount,
                mobile,
                receivingAddress,
              } as never,
            },
          ],
        });
        return;
      }

      if (['REQUIRES_PAYMENT_METHOD', 'CANCELED', 'REQUIRES_ACTION', 'FAILED', 'REQUIRES_CAPTURE'].includes(status)) {
        Alert.alert('Status', `Payment status: ${status}`);
        if (status === 'CANCELED' || status === 'FAILED') {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'FinalFailure' as never,
                params: {
                  chainName: 'Card',
                  tokenSymbol: 'USD',
                  usdAmount,
                  mobile,
                  receivingAddress,
                  errorMessage: `Payment status: ${status}`,
                } as never,
              },
            ],
          });
          return;
        }
      } else {
        Alert.alert('Status', `Current payment status: ${status || 'PENDING'}`);
      }
    } catch (err) {
      console.error('checkCardStatus', err);
      Alert.alert('Error', 'Unable to check card payment status');
    } finally {
      setChecking(false);
    }
  };

  const sendReceiptSms = () => {
    // stub — implement SMS API if required
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'FinalSuccess' as never,
          params: {
            success: true,
            chainName: 'Card',
            tokenSymbol: 'USD',
            tokenAmount,
            usdAmount,
            mobile,
            receivingAddress,
          } as never,
        },
      ],
    });
  };

  const onDone = () => navigation.reset({ index: 0, routes: [{ name: 'PaymentMethod' as never }] });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Payment</Text>
        <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: 'PaymentMethod' as never }] })}>
          <Text style={styles.logout}>Close</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.qrWrap}>
        <Text style={styles.qrTitle}>Receipt / Payment details</Text>

        <Image source={require('../../../../assets/vaadin_qrcode.png')} style={styles.qrImage} resizeMode="contain" />

        <View style={styles.addressRow}>
          <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
            {receivingAddress}
          </Text>
          <TouchableOpacity style={styles.copyBtn} onPress={copyAddress}>
            <Text style={styles.copyText}>Copy</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={checkCardStatus} disabled={checking}>
          {checking ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Check payment status</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.navigate('PaymentMethod' as never)}>
          <Text style={styles.ghostText}>New transaction</Text>
        </TouchableOpacity>

        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Payment method:</Text>
            <Text style={styles.value}>{chainName}</Text>
          </View>
          <View style={styles.infoColRight}>
            <Text style={styles.label}>Amount:</Text>
            <Text style={styles.valueRight}>{usdAmount} {tokenSymbol}</Text>
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

        <TouchableOpacity style={styles.primaryBtn} onPress={sendReceiptSms}>
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

  qrWrap: { width: '100%', maxWidth: 720, alignItems: 'center', marginBottom: 14, backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 3 },
  qrTitle: { fontWeight: '800', fontSize: 16, marginBottom: 8, color: '#0f172a' },
  qrImage: { width: 180, height: 180, backgroundColor: '#fff', borderRadius: 8, marginBottom: 12 },

  addressRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  addressText: { flex: 1, marginRight: 12, color: '#111827', fontWeight: '700' },
  copyBtn: { backgroundColor: '#eef2ff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  copyText: { color: '#2563eb', fontWeight: '800' },

  card: { width: '100%', maxWidth: 720, backgroundColor: '#fff', borderRadius: 12, padding: 18, marginTop: 6, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 4 },

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

  doneBtn: { backgroundColor: '#2563eb', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 16, width: '100%', maxWidth: 720 },
  doneText: { color: '#fff', fontWeight: '800' },
});

export default DetailedReceipt;
