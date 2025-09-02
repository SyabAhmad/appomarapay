import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  PaymentMethod: { selectedMethod?: 'Card' | 'Blockchain' | 'GCash' } | undefined;
  CardStart: undefined;
  CryptoStart: undefined;
  WalletStart: undefined;
  GCashStart: undefined;
  GoogleWalletStart: undefined;
  PinAuth: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'PaymentMethod'>;

const Panel: React.FC<{
  emoji: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  selected?: boolean;
}> = ({ emoji, title, subtitle, onPress, selected }) => (
  <TouchableOpacity
    style={[styles.card, selected ? styles.cardSelected : null]}
    onPress={onPress}
    activeOpacity={0.9}
  >
    <Text style={styles.cardEmoji}>{emoji}</Text>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardSubtitle}>{subtitle}</Text>
    <View style={[styles.cardCta, selected ? styles.cardCtaSelected : null]}>
      <Text style={styles.cardCtaText}>{selected ? 'Selected' : 'Select'}</Text>
    </View>
  </TouchableOpacity>
);

const PaymentMethod: React.FC<Props> = ({ navigation, route }) => {
  const onLogout = () => navigation.reset({ index: 0, routes: [{ name: 'PinAuth' as never }] });
  const selected = route?.params?.selectedMethod;

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <Text style={styles.topTitle}>Select Payment Method</Text>
          <TouchableOpacity style={styles.outlineBtn} onPress={onLogout}>
            <Text style={styles.outlineBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

        <Text style={styles.sectionTitle}>Select payment method</Text>

        <View style={styles.panels}>
          <Panel
            emoji="💳"
            title="Card"
            subtitle="Tap/Swipe or Enter Manualy"
            onPress={() => navigation.navigate('CardStart' as never)}
          />
          <Panel
            emoji="🪙"
            title="Crypto"
            subtitle="Pay with crypto"
            onPress={() => navigation.navigate('CryptoStart' as never)}
          />
          <Panel
            emoji="📱"
            title="Wallets"
            subtitle="GCash / Google Pay"
            onPress={() => navigation.navigate('WalletStart' as never)}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { paddingTop: 30, paddingBottom: 40, paddingHorizontal: 16, alignItems: 'center' },
  topRow: {
    width: '100%',
    maxWidth: 560,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 44,
  },
  outlineBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  outlineBtnText: { color: '#111827', fontWeight: '700' },
  topTitle: { fontSize: 16, fontWeight: '800', color: '#111827', textAlign: 'center' },
  logo: { width: 150, height: 54, marginTop: 6, marginBottom: 18 },
  sectionTitle: { paddingVertical: 16, fontSize: 16, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  panels: {
    marginTop: 12,
    width: '100%',
    maxWidth: 560,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardSelected: {
    backgroundColor: '#eef6ff',
    borderColor: '#2563eb',
  },
  cardEmoji: { fontSize: 28, marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  cardSubtitle: { marginTop: 4, color: '#6b7280', textAlign: 'center' },
  cardCta: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#2563eb', borderRadius: 999 },
  cardCtaSelected: {
    backgroundColor: '#0f172a',
  },
  cardCtaText: { color: '#fff', fontWeight: '700' },
});

export default PaymentMethod;