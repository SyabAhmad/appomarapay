import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  PaymentMethod: undefined;
  Login: undefined;
  BlockchainMethod: undefined;
  CardSelectedItemLite: undefined;
  GCashMethod: undefined;
  CardMethod: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'BlockchainMethod'>;

const Panel: React.FC<{ emoji: string; title: string; subtitle: string; onPress: () => void }> = ({
  emoji,
  title,
  subtitle,
  onPress,
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
    <Text style={styles.cardEmoji}>{emoji}</Text>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardSubtitle}>{subtitle}</Text>
    <View style={styles.cardCta}>
      <Text style={styles.cardCtaText}>Select</Text>
    </View>
  </TouchableOpacity>
);

const BlockchainMethod: React.FC<Props> = ({ navigation }) => {
  const onLogout = () => navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });

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
            subtitle="Pay with debit/credit card"
            onPress={() => navigation.navigate('CardMethod' as never)}
          />
          <Panel
            emoji="🪙"
            title="Blockchain"
            subtitle="Pay using cryptocurrency"
            onPress={() => navigation.navigate('BlockchainMethod' as never)}
          />
          <Panel
            emoji="📱"
            title="GCash"
            subtitle="Pay with GCash wallet"
            onPress={() => navigation.navigate('GCashMethod' as never)}
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
    marginBottom: 14,
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
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
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
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardEmoji: { fontSize: 28, marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  cardSubtitle: { marginTop: 4, color: '#6b7280', textAlign: 'center' },
  cardCta: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#2563eb', borderRadius: 999 },
  cardCtaText: { color: '#fff', fontWeight: '700' },
});

export default BlockchainMethod;