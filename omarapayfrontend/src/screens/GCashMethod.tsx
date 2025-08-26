import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const GCashMethod: React.FC = ({ navigation }: any) => {
  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>GCash Payment</Text>
          <View style={{ width: 60 }} />
        </View>

        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

        <View style={styles.card}>
          <Text style={styles.emoji}>📱</Text>
          <Text style={styles.title}>GCash</Text>
          <Text style={styles.sub}>Wallet checkout coming soon</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { paddingTop: 26, paddingBottom: 40, paddingHorizontal: 16, alignItems: 'center' },
  headerBar: { width: '100%', maxWidth: 560, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  back: { color: '#2563eb', fontWeight: '800' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  logo: { width: 140, height: 50, marginVertical: 10 },
  card: { width: '100%', maxWidth: 560, alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 24, marginTop: 16 },
  emoji: { fontSize: 30, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  sub: { marginTop: 4, color: '#6b7280' },
});

export default GCashMethod;