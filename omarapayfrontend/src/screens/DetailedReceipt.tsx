import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, Platform, ToastAndroid, Linking, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Clipboard from '@react-native-clipboard/clipboard';

type RootStackParamList = {
  DetailedReceipt: {
    chainName?: string;
    tokenSymbol?: string;
    tokenAmount?: string;
    usdAmount?: string;
    mobile?: string;
    receivingAddress?: string; // used for hosted_url when provided
    hosted_url?: string | null;
    chargeId?: string | null;
    txId?: string | null;
  } | undefined;
  PaymentMethod: undefined;
  FinalSuccess: undefined;
  FinalFailure: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'DetailedReceipt'>;

const API_BASE = Platform.OS === 'android' ? 'http://192.168.0.109:5000' : 'http://localhost:5000';

const DetailedReceipt: React.FC<Props> = ({ navigation, route }) => {
  const {
    chainName = 'Ethereum',
    tokenSymbol = 'ETH',
    tokenAmount = '0.00819471',
    usdAmount = '25',
    mobile = '25869321789',
    receivingAddress = '0x964a7DFb7AEf009B8f7Ed8743FF458e6ecd4bCA2',
    hosted_url = null,
    chargeId = null,
    txId = null,
  } = route.params ?? {};

  const [checking, setChecking] = useState(false);

  const txIdLocal = useMemo(() => txId ?? `TX-${Math.random().toString(36).slice(2, 9).toUpperCase()}`, [txId]);
  const timestamp = useMemo(() => new Date().toLocaleString(), []);

  const copyAddress = () => {
    const toCopy = hosted_url ? hosted_url : receivingAddress;
    Clipboard.setString(toCopy);
    if (Platform.OS === 'android') ToastAndroid.show('Copied', ToastAndroid.SHORT);
    else Alert.alert('Copied', 'Copied to clipboard');
  };

  const openCheckout = async () => {
    const url = hosted_url ?? receivingAddress;
    if (!url) return;
    const ok = await Linking.canOpenURL(url);
    if (ok) Linking.openURL(url);
  };

  const checkCryptoStatus = async () => {
    if (!chargeId) {
      Alert.alert('No charge id', 'Unable to check status.');
      return;
    }
    setChecking(true);
    try {
      const res = await fetch(`${API_BASE}/api/payments/crypto/${chargeId}`);
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        Alert.alert('Error', body?.message ?? `Status ${res.status}`);
        setChecking(false);
        return;
      }
      const status = body?.charge?.timeline?.slice(-1)[0]?.status?.toUpperCase() ?? (body?.localTx?.status ?? '').toUpperCase();

      if (status === 'COMPLETED' || status === 'RESOLVED' || status === 'CONFIRMED') {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'FinalSuccess' as never,
              params: {
                success: true,
                chainName,
                tokenSymbol,
                tokenAmount,
                usdAmount,
                mobile,
                receivingAddress: hosted_url ?? receivingAddress,
              } as never,
            },
          ],
        });
        return;
      }

      if (status === 'EXPIRED' || status === 'CANCELED' || status === 'FAILED' || status === 'UNRESOLVED') {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'FinalFailure' as never,
              params: {
                chainName,
                tokenSymbol,
                tokenAmount,
                usdAmount,
                mobile,
                receivingAddress: hosted_url ?? receivingAddress,
                errorMessage: `Payment status: ${status}`,
              } as never,
            },
          ],
        });
        return;
      }

      Alert.alert('Status', `Current payment status: ${status || 'PENDING'}`);
    } catch (err) {
      console.error('checkCryptoStatus', err);
      Alert.alert('Error', 'Unable to check status');
    } finally {
      setChecking(false);
    }
  };

  const sendReceiptSms = () => {
    console.info('sendReceiptSms stub — implement SMS API');
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'FinalSuccess' as never,
          params: {
            success: true,
            chainName,
            tokenSymbol,
            tokenAmount,
            usdAmount,
            mobile,
            receivingAddress: hosted_url ?? receivingAddress,
          } as never,
        },
      ],
    });
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
        <Text style={styles.qrTitle}>{hosted_url ? 'Checkout QR' : 'Scan QR code to pay'}</Text>

        {hosted_url ? (
          <Image
            source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(hosted_url)}` }}
            style={styles.qrImage}
            resizeMode="contain"
          />
        ) : (
          <Image source={require('../../assets/vaadin_qrcode.png')} style={styles.qrImage} resizeMode="contain" />
        )}

        <View style={styles.addressRow}>
          <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
            {hosted_url ? hosted_url : receivingAddress}
          </Text>
          <TouchableOpacity style={styles.copyBtn} onPress={copyAddress}>
            <Text style={styles.copyText}>Copy</Text>
          </TouchableOpacity>
        </View>

        {hosted_url ? (
          <View style={{ marginTop: 10, width: '100%', alignItems: 'center' }}>
            <TouchableOpacity style={styles.primaryBtn} onPress={openCheckout}>
              <Text style={styles.primaryBtnText}>Open checkout</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 8 }]} onPress={checkCryptoStatus} disabled={checking}>
              {checking ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Check payment status</Text>}
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* Details card */}
      <View style={styles.card}>
        <View style={styles.topBadge}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.success}>Successful Payment</Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn}>
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

      <TouchableOpacity
        style={styles.doneBtn}
        onPress={() =>
          navigation.navigate('FinalSuccess' as never, {
            success: true,
            chainName,
            tokenSymbol,
            tokenAmount,
            usdAmount,
            mobile,
            receivingAddress: hosted_url ?? receivingAddress,
          } as never)
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

  separator: { height: 1, backgroundColor: '#eef2ff', marginVertical: 12 },

  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  smallLabel: { color: '#94a3b8', fontSize: 12 },
  smallValue: { fontSize: 13, fontWeight: '700', marginTop: 4 },

  receiptRow: { marginTop: 8 },
  txId: { fontSize: 13, fontWeight: '700', marginTop: 6, color: '#111827' },

  doneBtn: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  doneText: { color: '#fff', fontWeight: '800' },
});

export default DetailedReceipt;