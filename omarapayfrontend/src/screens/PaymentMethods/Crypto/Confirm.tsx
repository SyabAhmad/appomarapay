import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  CryptoConfirm: { chainId?: string; chainName?: string; tokenId?: string; tokenSymbol?: string; selectedAmount?: string } | undefined;
  CryptoOtp: {
    chainId?: string; chainName?: string; tokenId?: string; tokenSymbol?: string; selectedAmount?: string; phone?: string; otp?: string;
  } | undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'CryptoConfirm'>;

const mockRates: Record<string, number> = {
  ETH: 0.00035, BTC: 0.000012, SOL: 0.02, MATIC: 0.6, USDC: 1, BNB: 0.0015, AVAX: 0.005, TRON: 2,
};

const getTokenLogo = (symbol?: string, id?: string) => {
  const s = (symbol ?? id ?? '').toUpperCase();
  try {
    if (s.includes('ETH') || s === 'ETH') return require('../../../assets/Ethereum.png');
    if (s.includes('BTC') || s === 'BTC') return require('../../../../assets/Bitcoin.png');
    if (s.includes('SOL') || s === 'SOL') return require('../../../../assets/logo.png');
    if (s.includes('MATIC') || s === 'MATIC') return require('../../../../assets/Matic.png');
    if (s.includes('USDC') || s === 'USDC') return require('../../../../assets/USDCoin.png');
    if (s.includes('BNB') || s === 'BNB') return require('../../../../assets/Bnb.png');
    if (s.includes('AVAX') || s === 'AVAX') return require('../../../../assets/logo.png');
    if (s.includes('TRON') || s === 'TRON') return require('../../../../assets/Tron.png');
  } catch {}
  return require('../../../../assets/logo.png');
};

const ConfirmPayment: React.FC<Props> = ({ navigation, route }) => {
  const { chainId, chainName, tokenId, tokenSymbol, selectedAmount } = route.params ?? {};
  const usd = Number(selectedAmount ?? '0') || 0;
  const tokenKey = (tokenSymbol ?? '').toUpperCase() || (tokenId ?? '').toUpperCase();

  const [locked, setLocked] = useState(true);
  const [rate, setRate] = useState<number | null>(null);
  const [tokenAmount, setTokenAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [delta, setDelta] = useState<number | null>(null);

  const tokenLogo = useMemo(() => getTokenLogo(tokenSymbol, tokenId), [tokenSymbol, tokenId]);

  const fetchRate = (showLoading = true) => {
    setLocked(true);
    if (showLoading) setLoading(true);
    setTimeout(() => {
      const base = mockRates[tokenKey] ?? (Math.random() * 0.01 + 0.0001);
      const volatility = (Math.random() - 0.5) * base * 0.02;
      const next = Math.max(0.0000001, base + volatility);
      const prev = rate ?? next;
      setRate(next);
      setTokenAmount(Number((usd * next).toFixed(8)));
      setDelta(prev ? Number((((next - prev) / prev) * 100).toFixed(2)) : 0);
      setLastUpdated(Date.now());
      setLocked(false);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchRate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = () => fetchRate(true);

  const onConfirm = () => {
    // Route to the shared PhoneConfirmation screen so user can enter/confirm phone (OTP flow happens there)
    navigation.navigate('PhoneConfirmation' as never, {
      chainId,
      chainName,
      tokenId,
      tokenSymbol,
      selectedAmount: String(usd.toFixed(2)),
    } as never);
  };

  const formattedLastUpdated = lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : null;

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Confirm crypto payment</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.amountCard}>
          <Text style={styles.smallLabel}>Amount (USD)</Text>

          <View style={styles.amountRow}>
            <Text style={styles.currency}>$</Text>
            <Text style={styles.amount}>{usd.toFixed(2)}</Text>
          </View>

          <View style={styles.separator} />

          <View className="conversionRow" style={styles.conversionRow}>
            <View style={styles.tokenInfo}>
              <Image source={tokenLogo} style={styles.tokenLogo} resizeMode="contain" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.tokenSymbol}>{(tokenSymbol ?? tokenId ?? '').toUpperCase() || 'TOKEN'}</Text>
                <Text style={styles.tokenSub}>{chainName ?? 'Network'}</Text>
              </View>
            </View>

            <View style={styles.rateBox}>
              {locked ? (
                <View style={styles.lockedWrap}>
                  <ActivityIndicator size="small" color="#2563eb" />
                  <Text style={styles.lockedText}>Rate locked</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.tokenAmount}>{tokenAmount ?? '—'}</Text>
                  <Text style={styles.rateLine}>{rate ? `${rate}` : '—'} {tokenSymbol ? tokenSymbol.toUpperCase() : ''}</Text>
                  {delta !== null ? (
                    <Text style={[styles.delta, delta >= 0 ? styles.deltaUp : styles.deltaDown]}>
                      {delta >= 0 ? `+${delta}%` : `${delta}%`}
                    </Text>
                  ) : null}
                </>
              )}
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {formattedLastUpdated ? `Last updated ${formattedLastUpdated}` : 'Fetching rate…'}
            </Text>
            <TouchableOpacity style={styles.refresh} onPress={onRefresh} activeOpacity={0.85}>
              <Text style={styles.refreshText}>{loading ? 'Refreshing…' : 'Refresh'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.confirmBtn, locked ? { opacity: 0.6 } : null]}
          disabled={locked}
          onPress={onConfirm}
          activeOpacity={0.9}
        >
          <Text style={styles.confirmText}>Confirm & send OTP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fafc', paddingTop: Platform.OS === 'android' ? 12 : 26, alignItems: 'center' },
  header: { width: '100%', maxWidth: 560, alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 6 },
  back: { color: '#2563eb', fontWeight: '700' },
  title: { fontWeight: '700', fontSize: 16, color: '#0f172a' },
  content: { width: '100%', maxWidth: 560, paddingHorizontal: 16, marginTop: 18 },
  amountCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  smallLabel: { color: '#6b7280', marginBottom: 8, fontSize: 13 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' },
  currency: { color: '#9ca3af', fontSize: 26, marginRight: 8 },
  amount: { fontSize: 44, fontWeight: '800', color: '#0f172a' },
  separator: { height: 1, backgroundColor: '#eef2ff', marginVertical: 16 },
  conversionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tokenInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  tokenLogo: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#f3f4f6' },
  tokenSymbol: { fontWeight: '800', fontSize: 15, color: '#0f172a' },
  tokenSub: { color: '#6b7280', fontSize: 12, marginTop: 4 },
  rateBox: { minWidth: 140, alignItems: 'flex-end' },
  lockedWrap: { flexDirection: 'row', alignItems: 'center' },
  lockedText: { marginLeft: 8, color: '#6b7280' },
  tokenAmount: { fontWeight: '800', fontSize: 18, color: '#0f172a' },
  rateLine: { color: '#6b7280', marginTop: 6, fontSize: 12 },
  delta: { marginTop: 6, fontSize: 12, fontWeight: '700' },
  deltaUp: { color: '#10b981' },
  deltaDown: { color: '#ef4444' },
  metaRow: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaText: { color: '#94a3b8', fontSize: 13 },
  refresh: { backgroundColor: '#eef2ff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  refreshText: { color: '#2563eb', fontWeight: '800' },
  bottom: { position: 'absolute', left: 16, right: 16, bottom: 18, alignItems: 'center' },
  confirmBtn: { width: '100%', maxWidth: 560, backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '800' },
});

export default ConfirmPayment;
