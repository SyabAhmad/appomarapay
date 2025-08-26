import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  CardMethod: undefined;
  CardNetworkSelection: undefined;
  CardDetails: { networkId: string; networkName: string } | undefined;
  PaymentMethod: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'CardMethod'>;

const CardMethod: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Card Payment</Text>
          <View style={{ width: 60 }} />
        </View>

        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

        <View style={styles.card}>
          <Text style={styles.emoji}>💳</Text>
          <Text style={styles.title}>Card payments</Text>
          <Text style={styles.sub}>Pay with a supported card network</Text>

          <TouchableOpacity style={styles.chooseBtn} onPress={() => navigation.navigate('CardNetworkSelection' as never)}>
            <Text style={styles.chooseBtnText}>Choose card network</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { paddingTop: 26, paddingBottom: 70, paddingHorizontal: 16, alignItems: 'center' },

  headerBar: {
    width: '100%', maxWidth: 560, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 8,
  },
  back: { color: '#2563eb', fontWeight: '800' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', textAlign: 'center' },

  logo: { width: 140, height: 50, marginVertical: 10 },

  card: {
    width: '100%', maxWidth: 560, alignItems: 'center',
    backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb',
    paddingVertical: 24, marginTop: 56,
  },
  emoji: { fontSize: 30, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  sub: { marginTop: 6, color: '#6b7280', textAlign: 'center', paddingHorizontal: 20 },

  chooseBtn: {
    marginTop: 18,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  chooseBtnText: { color: '#fff', fontWeight: '800' },
});

export default CardMethod;