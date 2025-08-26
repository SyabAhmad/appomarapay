import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CurrenciesScreenProp } from '../typings/types';

const Currencies: React.FC<CurrenciesScreenProp> = ({ navigation }) => {
  const paymentMethods = [
    { id: 'card', name: 'Card', emoji: '💳' },
    { id: 'crypto', name: 'Crypto', emoji: '🪙' },
    { id: 'gcash', name: 'GCash', emoji: '📱' },
    { id: 'aliwepay', name: 'Ali/WePay', emoji: '💸' },
  ];

  const onSelect = (id: string) => {
    if (id === 'card') {
      // Navigate to existing Card flow screen if present
      navigation.navigate('CardSelectedItem' as never);
      return;
    }
    Alert.alert('Coming soon', 'This payment method will be available later.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Mode of payment</Text></View>

      <ScrollView contentContainerStyle={styles.list}>
        <Text style={styles.subtitle}>Select mode of payment</Text>
        {paymentMethods.map(pm => (
          <TouchableOpacity key={pm.id} style={styles.item} onPress={() => onSelect(pm.id)}>
            <Text style={styles.itemEmoji}>{pm.emoji}</Text>
            <Text style={styles.itemText}>{pm.name}</Text>
            <Text style={styles.itemArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#007DFF' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  list: { padding: 20 },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 20, fontSize: 16 },
  item: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 18, marginBottom: 12, borderRadius: 10, backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#e9ecef',
  },
  itemEmoji: { fontSize: 24 },
  itemText: { fontSize: 18, color: '#333', fontWeight: '600' },
  itemArrow: { fontSize: 18, color: '#007DFF' },
});

export default Currencies;
