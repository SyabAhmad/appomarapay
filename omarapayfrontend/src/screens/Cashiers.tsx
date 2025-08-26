import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CashiersScreenProp } from '../typings/types';

const demoCashiers = [
  { id: 1, name: 'Alice Johnson' },
  { id: 2, name: 'Bob Smith' },
  { id: 3, name: 'Charlie Brown' },
];

const Cashiers: React.FC<CashiersScreenProp> = ({ navigation }) => {
  const handleCashierSelect = (id: number) => {
    navigation.navigate('CashierLogin', { id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Select Cashier</Text></View>
      <FlatList
        contentContainerStyle={{ padding: 20 }}
        data={demoCashiers}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.item} 
            onPress={() => handleCashierSelect(item.id)}
          >
            <Text style={styles.itemEmoji}>👤</Text>
            <Text style={styles.itemText}>{item.name}</Text>
            <Text style={styles.itemArrow}>→</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flex: 1 },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#007DFF' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  item: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 18, 
    marginBottom: 12, 
    borderRadius: 10, 
    backgroundColor: '#f8f9fa', 
    borderWidth: 1, 
    borderColor: '#e9ecef',
  },
  itemEmoji: { fontSize: 24 },
  itemText: { fontSize: 18, color: '#333', fontWeight: '600' },
  itemArrow: { fontSize: 18, color: '#007DFF' },
});

export default Cashiers;