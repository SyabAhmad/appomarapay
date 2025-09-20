import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import settings from '../../settings';
import Header from '../components/Header';
import { TransactionHistoryScreenProp } from '../typings/types';

type Tx = { id: string; method: string; amount: number; currency: string; date: string };

const mockTx: Tx[] = [
  { id: 'TX-1001', method: 'Card', amount: 25.5, currency: 'USD', date: '2025-08-01 10:22' },
  { id: 'TX-1002', method: 'Crypto', amount: 12.0, currency: 'USDT', date: '2025-08-01 12:45' },
  { id: 'TX-1003', method: 'GCash', amount: 7.8, currency: 'USD', date: '2025-08-02 09:10' },
];

const TransactionHistory: React.FC<TransactionHistoryScreenProp> = () => {
  const [cashierName, setCashierName] = useState<string>('Unknown');
  const total = mockTx.reduce((s, t) => s + t.amount, 0);

  useEffect(() => {
    AsyncStorage.getItem('cashierName').then(n => n && setCashierName(n));
  }, []);

  return (
    <View style={styles.container}>
      <Header title='Transaction' />

      <View style={styles.topRow}>
        <Text style={styles.topText}>
          Cashier: <Text style={styles.topValue}>{cashierName}</Text>
        </Text>
        <Text style={styles.topText}>
          Sales volume: <Text style={styles.topValue}>${total.toFixed(2)}</Text>
        </Text>
      </View>

      <View style={styles.divider} />

      <ScrollView contentContainerStyle={styles.table}>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cell, styles.cellSm]}>ID</Text>
          <Text style={[styles.cell, styles.cellSm]}>Method</Text>
          <Text style={[styles.cell, styles.cellSm]}>Amount</Text>
          <Text style={[styles.cell, styles.cellLg]}>Date</Text>
        </View>
        {mockTx.map(t => (
          <View key={t.id} style={styles.row}>
            <Text style={[styles.cell, styles.cellSm]}>{t.id}</Text>
            <Text style={[styles.cell, styles.cellSm]}>{t.method}</Text>
            <Text style={[styles.cell, styles.cellSm]}>${t.amount.toFixed(2)} {t.currency}</Text>
            <Text style={[styles.cell, styles.cellLg]}>{t.date}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: settings.colors.white,
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  topText: {
    fontSize: 16,
    color: '#666',
  },
  topValue: {
    color: '#111',
    fontWeight: '700',
    fontSize: 20,
  },
  divider: {
    height: 2,
    backgroundColor: '#eee',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  table: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerRow: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  cell: {
    color: '#333',
  },
  cellSm: {
    width: 90,
  },
  cellLg: {
    flex: 1,
  },
});

export default TransactionHistory;
