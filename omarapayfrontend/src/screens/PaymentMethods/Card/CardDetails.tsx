import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CardDetails: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Card payments</Text>
      </View>

      <Image source={require('../../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

      <Text style={styles.subtitle}>Accept Visa, Mastercard, Amex and more</Text>

      <View style={styles.brands}>
        <Image source={require('../../../../assets/visa.png')} style={styles.brand} />
        <Image source={require('../../../../assets/mastercard.png')} style={styles.brand} />
        <Image source={require('../../../../assets/amex.png')} style={styles.brand} />
        <Image source={require('../../../../assets/discover.png')} style={styles.brand} />
        <Image source={require('../../../../assets/unionpay.png')} style={styles.brand} />
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => navigation.navigate('CardAmountEntry')}
        activeOpacity={0.9}
      >
        <Text style={styles.primaryText}>Enter amount</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.ghostBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.ghostText}>Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', paddingTop: 12, paddingHorizontal: 16 },
  header: { width: '100%', maxWidth: 560, alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  logo: { width: 140, height: 44, marginVertical: 8 },
  subtitle: { color: '#6b7280', marginTop: 6 },
  brands: { flexDirection: 'row', marginTop: 12, gap: 10 },
  brand: { width: 44, height: 28, resizeMode: 'contain', marginHorizontal: 4 },
  primaryBtn: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryText: { color: '#fff', fontWeight: '900' },
  ghostBtn: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  ghostText: { color: '#111827', fontWeight: '800' },
});

export default CardDetails;