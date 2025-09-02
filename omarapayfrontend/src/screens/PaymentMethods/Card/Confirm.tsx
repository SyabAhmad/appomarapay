import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  ConfirmPayment: {
    selectedAmount?: string;
  } | undefined;
  CardPhone: any;
};
type Props = NativeStackScreenProps<RootStackParamList, 'CardConfirm'>;

const ConfirmPayment: React.FC<Props> = ({ navigation, route }) => {
  const selectedAmount = route.params?.selectedAmount ?? '0.00';
  const usd = Number(selectedAmount) || 0;

  const onConfirm = () => {
    navigation.navigate('CardPhone' as never, {
      selectedAmount: String(usd.toFixed(2)),
    } as never);
  };

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Confirm payment</Text>
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

          <View style={styles.conversionRow}>
            <View style={styles.tokenInfo}>
              <Image
                source={require('../../../../assets/visa.png')}
                style={styles.tokenLogo}
                resizeMode="contain"
              />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.tokenSymbol}>Card Payment</Text>
                <Text style={styles.tokenSub}>USD Direct Payment</Text>
              </View>
            </View>

            <View style={styles.rateBox}>
              <Text style={styles.tokenAmount}>{usd.toFixed(2)} USD</Text>
              <Text style={styles.rateLine}>No conversion</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Card payment - USD direct</Text>
            <TouchableOpacity style={styles.refresh} onPress={() => { /* noop for card */ }}>
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.confirmBtn}
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
  safe: {
    flex: 1,
    backgroundColor: '#f7fafc',
    paddingTop: Platform.OS === 'android' ? 12 : 26,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  back: { color: '#2563eb', fontWeight: '700' },
  title: { fontWeight: '700', fontSize: 16, color: '#0f172a' },

  content: {
    width: '100%',
    maxWidth: 560,
    paddingHorizontal: 16,
    marginTop: 18,
  },

  amountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

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

  rateBox: {
    minWidth: 140,
    alignItems: 'flex-end',
  },

  tokenAmount: { fontWeight: '800', fontSize: 18, color: '#0f172a' },
  rateLine: { color: '#6b7280', marginTop: 6, fontSize: 12 },

  metaRow: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaText: { color: '#94a3b8', fontSize: 13 },
  refresh: {
    backgroundColor: '#eef2ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  refreshText: { color: '#2563eb', fontWeight: '800' },

  bottom: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    alignItems: 'center',
  },
  confirmBtn: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmText: { color: '#fff', fontWeight: '800' },
});

export default ConfirmPayment;
