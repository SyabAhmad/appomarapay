import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  GCashDetails: { walletId: string; walletName: string } | undefined;
  AmountEntry: { chainId: string; chainName?: string; tokenId?: string; tokenSymbol?: string } | undefined;
  Login: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'GCashDetails'>;

const GCashDetails: React.FC<Props> = ({ navigation, route }) => {
  const walletId = route.params?.walletId ?? 'gcash';
  const walletName = route.params?.walletName ?? 'Wallet';

  const proceed = () => {
    navigation.navigate(
      'AmountEntry' as never,
      {
        chainId: walletId,
        chainName: walletName,
        tokenId: walletId,
        tokenSymbol: walletName,
      } as never
    );
  };

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>{'< Back'}</Text></TouchableOpacity>
          <Text style={styles.topTitle}>{walletName}</Text>
          <View style={{ width: 88 }} />
        </View>

        {/* Info only — phone will be collected on PhoneConfirmation */}
        <Text style={styles.helper}>
          You’ll enter the customer’s phone and verify OTP on the next step.
        </Text>

        <TouchableOpacity style={styles.proceedBtn} onPress={proceed} activeOpacity={0.9}>
          <Text style={styles.proceedText}>Enter amount</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { paddingTop: 26, paddingBottom: 40, paddingHorizontal: 16, alignItems: 'center' },
  topRow: { width: '100%', maxWidth: 560, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  back: { color: '#2563eb', fontWeight: '800' },
  topTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  helper: { color: '#6b7280', marginBottom: 16, textAlign: 'center' },
  proceedBtn: { marginTop: 8, width: '100%', maxWidth: 560, backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  proceedText: { color: '#fff', fontWeight: '800' },
});

export default GCashDetails;