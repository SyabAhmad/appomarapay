import React, { useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  FinalFailure: {
    chainName?: string;
    tokenSymbol?: string;
    tokenAmount?: string;
    usdAmount?: string;
    mobile?: string;
    receivingAddress?: string;
    errorMessage?: string;
  } | undefined;
  PaymentMethod: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'FinalFailure'>;

const FinalFailure: React.FC<Props> = ({ navigation, route }) => {
  const {
    chainName = 'Ethereum',
    tokenSymbol = 'ETH',
    tokenAmount = '0.00',
    usdAmount = '0.00',
    mobile = '-',
    receivingAddress = '-',
    errorMessage = 'Payment could not be completed',
  } = route.params ?? {};

  const txId = useMemo(() => `TX-${Math.random().toString(36).slice(2, 9).toUpperCase()}`, []);
  const timestamp = useMemo(() => new Date().toLocaleString(), []);

  const onRetry = () => {
    navigation.goBack();
  };

  const onDone = () => {
    navigation.reset({ index: 0, routes: [{ name: 'PaymentMethod' as never }] });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.badgeWrap}>
          <View style={[styles.badge, { backgroundColor: '#fee2e2' }]}>
            <Text style={[styles.badgeIcon, { color: '#ef4444' }]}>✕</Text>
          </View>
          <Text style={styles.title}>Payment Failed</Text>
          <Text style={styles.subtitle}>{errorMessage}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Cryptocurrency:</Text>
              <Text style={styles.value}>{chainName}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Token</Text>
              <Text style={styles.valueRight}>{tokenSymbol}</Text>
            </View>
          </View>

          <View style={styles.sep} />

          <View style={styles.center}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amount}>${Number(usdAmount).toFixed(2)}</Text>
            <Text style={styles.tokenAmount}>{tokenAmount} {tokenSymbol}</Text>
          </View>

          <View style={styles.sep} />

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

          <View style={styles.sep} />

          <View style={styles.txRow}>
            <Text style={styles.smallLabel}>Reference</Text>
            <Text style={styles.txId}>{txId}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.doneBtn} onPress={onDone}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { alignItems: 'center', padding: 18, paddingBottom: 40 },
  badgeWrap: { alignItems: 'center', marginVertical: 24 },
  badge: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  badgeIcon: { fontSize: 42, fontWeight: '900' },
  title: { fontSize: 20, fontWeight: '800', marginTop: 12, color: '#111827' },
  subtitle: { marginTop: 8, color: '#6b7280', textAlign: 'center', paddingHorizontal: 24 },

  card: { width: '100%', maxWidth: 720, backgroundColor: '#fff', borderRadius: 12, padding: 16, marginVertical: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 1 },
  label: { color: '#6b7280', fontSize: 13 },
  value: { fontWeight: '800', marginTop: 6 },
  valueRight: { fontWeight: '800', marginTop: 6, textAlign: 'right' },

  sep: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  center: { alignItems: 'center' },
  amountLabel: { color: '#6b7280' },
  amount: { fontSize: 32, fontWeight: '900', marginTop: 6, color: '#111827' },
  tokenAmount: { marginTop: 6, color: '#6b7280' },

  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  smallLabel: { color: '#94a3b8', fontSize: 12 },
  smallValue: { fontWeight: '700', marginTop: 6 },

  txRow: { marginTop: 8 },
  txId: { fontWeight: '700', marginTop: 6 },

  retryBtn: { width: '100%', maxWidth: 720, backgroundColor: '#ef4444', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  retryText: { color: '#fff', fontWeight: '800' },

  doneBtn: { width: '100%', maxWidth: 720, backgroundColor: '#0f172a', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  doneText: { color: '#fff', fontWeight: '800' },
});

export default FinalFailure;