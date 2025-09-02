import React, { useMemo } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  GCashSuccess: { success?: boolean; chainName?: string; phpAmount?: string; mobile?: string; receivingAddress?: string } | undefined;
  PaymentMethod: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'GCashSuccess'>;

const GCashSuccess: React.FC<Props> = ({ navigation, route }) => {
  const { success = true, chainName = 'GCash', phpAmount = '0.00', mobile = '-', receivingAddress = '-' } = route.params ?? {};
  const txId = useMemo(() => `TX-${Math.random().toString(36).slice(2, 9).toUpperCase()}`, []);
  const timestamp = useMemo(() => new Date().toLocaleString(), []);
  const onDone = () => navigation.reset({ index: 0, routes: [{ name: 'PaymentMethod' as never }] });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>{success ? 'Successful Payment' : 'Payment Failed'}</Text>
        </View>

        <View style={styles.badgeWrap}>
          <View style={styles.badge}><Text style={styles.badgeIcon}>✓</Text></View>
          <Text style={styles.success}>Congratulations! Your GCash payment is successful</Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity style={styles.ghostBtn} onPress={onDone}>
            <Text style={styles.ghostText}>New transaction</Text>
          </TouchableOpacity>

          <View style={styles.center}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amount}>₱{Number(phpAmount).toFixed(2)}</Text>
            <Text style={styles.method}>{chainName}</Text>
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
  success: { fontSize: 18, fontWeight: '800', marginTop: 8, textAlign: 'center' },
  card: { width: '100%', maxWidth: 720, backgroundColor: '#fff', borderRadius: 12, padding: 16, marginVertical: 8 },
  ghostBtn: { backgroundColor: '#f1f5f9', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginBottom: 8 },
  ghostText: { fontWeight: '700' },
  center: { alignItems: 'center' },
  amountLabel: { color: '#6b7280' },
  amount: { fontSize: 36, fontWeight: '900', marginTop: 8 },
  method: { marginTop: 6, color: '#6b7280' },
  sep: { height: 1, backgroundColor: '#eef2ff', marginVertical: 12 },
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

export default GCashSuccess;
