import React, { useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  ToastAndroid,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  FinalSuccess: {
    success?: boolean;
    chainName?: string;
    tokenSymbol?: string;
    tokenAmount?: string;
    usdAmount?: string;
    mobile?: string;
    receivingAddress?: string;
  } | undefined;
  PaymentMethod: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'CardSuccess'>;

const FinalSuccess: React.FC<Props> = ({ navigation, route }) => {
  const {
    success = true,
    chainName = 'Ethereum',
    tokenSymbol = 'ETH',
    tokenAmount = '0.00',
    usdAmount = '0.00',
    mobile = '-',
    receivingAddress = '-',
  } = route.params ?? {};

  const txId = useMemo(() => `TX-${Math.random().toString(36).slice(2, 9).toUpperCase()}`, []);
  const timestamp = useMemo(() => new Date().toLocaleString(), []);

  const topTitle = success ? 'Successful Payment' : 'Payment Failed';
  const subtitle = success ? 'Congratulations! Your payment is successful' : 'Something went wrong. Please try again';

  const onDone = () => {
    // return to PaymentMethod (start new flow)
    navigation.reset({ index: 0, routes: [{ name: 'PaymentMethod' as never }] });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>{topTitle}</Text>
        </View>

        <View style={styles.badgeWrap}>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>{success ? '✓' : '✕'}</Text>
          </View>
          <Text style={styles.success}>{subtitle}</Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity style={styles.verifyBtn}>
            <Text style={styles.verifyText}>Verify transaction on Blockchain</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ghostBtn} onPress={onDone}>
            <Text style={styles.ghostText}>New transaction</Text>
          </TouchableOpacity>

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
            <Text style={styles.smallLabel}>Receipt</Text>
            <Text style={styles.txId}>{txId}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.smsBtn} onPress={onDone}>
          <Text style={styles.smsText}>Send E-Receipt Via SMS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.printBtn} onPress={onDone}>
          <Text style={styles.printText}>Print E-Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.doneBtn} onPress={onDone}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fafc' },
  container: { alignItems: 'center', padding: 18, paddingBottom: 40 },
  headerRow: { width: '100%', maxWidth: 720, alignItems: 'center', marginBottom: 6 },
  header: { fontWeight: '800', fontSize: 18 },

  badgeWrap: { alignItems: 'center', marginVertical: 14 },
  badge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center' },
  badgeIcon: { fontSize: 40, color: '#10b981', fontWeight: '900' },
  success: { fontSize: 18, fontWeight: '800', marginTop: 8 },

  card: { width: '100%', maxWidth: 720, backgroundColor: '#fff', borderRadius: 12, padding: 16, marginVertical: 8 },
  verifyBtn: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginBottom: 8 },
  verifyText: { color: '#fff', fontWeight: '800' },
  ghostBtn: { backgroundColor: '#f1f5f9', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginBottom: 8 },
  ghostText: { fontWeight: '700' },

  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 1 },
  label: { color: '#6b7280', fontSize: 13 },
  value: { fontWeight: '800', marginTop: 6 },
  valueRight: { fontWeight: '800', marginTop: 6, textAlign: 'right' },

  sep: { height: 1, backgroundColor: '#eef2ff', marginVertical: 12 },

  center: { alignItems: 'center' },
  amountLabel: { color: '#6b7280' },
  amount: { fontSize: 36, fontWeight: '900', marginTop: 8 },
  tokenAmount: { marginTop: 6, color: '#6b7280' },

  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  smallLabel: { color: '#94a3b8', fontSize: 12 },
  smallValue: { fontWeight: '700', marginTop: 6 },

  txRow: { marginTop: 8 },
  txId: { fontWeight: '700', marginTop: 6 },

  smsBtn: { width: '100%', maxWidth: 720, backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  smsText: { color: '#fff', fontWeight: '800' },

  printBtn: { width: '100%', maxWidth: 720, backgroundColor: '#fff', paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#e6eef8', marginTop: 8 },
  printText: { fontWeight: '800' },

  doneBtn: { width: '100%', maxWidth: 720, backgroundColor: '#0f172a', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  doneText: { color: '#fff', fontWeight: '800' },
});

export default FinalSuccess;
