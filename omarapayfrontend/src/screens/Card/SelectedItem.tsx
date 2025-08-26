import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CardSelectedItemScreenProp } from '../../typings/types';

const CardSelectedItem: React.FC<CardSelectedItemScreenProp> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);

  // Frontend-only: simulate loading
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const product = {
    name: 'Demo Product',
    price: 12.99,
    image: 'https://via.placeholder.com/200',
  };

  const handlePress = () => {
    navigation.navigate('CardInsert' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Confirmation</Text></View>

      <View style={styles.mainContainer}>
        <Text style={styles.navTitle}>Selected item</Text>

        {loading ? (
          <ActivityIndicator color="#adb5bd" style={styles.activityIndicator} size="large" />
        ) : (
          <View style={styles.itemContainer}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
            </View>

            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.price}>${product.price}</Text>

            <TouchableOpacity style={styles.cta} onPress={handlePress}>
              <Text style={styles.ctaText}>Proceed to payment</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flex: 1 },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#007DFF' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  mainContainer: { padding: 20, alignItems: 'center' },
  navTitle: { fontSize: 18, color: '#333', marginBottom: 12 },
  itemContainer: {
    backgroundColor: '#f5f6f8',
    borderRadius: 12,
    gap: 10,
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
    width: '100%',
    maxWidth: 520,
  },
  imageContainer: { alignItems: 'center' },
  image: { height: 200, width: 200, borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6' },
  title: { color: '#343a40', fontSize: 20, textAlign: 'center', fontWeight: '600' },
  price: { color: '#6c757d', fontSize: 18, textAlign: 'center' },
  cta: { backgroundColor: '#007DFF', paddingVertical: 14, borderRadius: 8, marginTop: 10 },
  ctaText: { color: 'white', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  activityIndicator: { marginTop: 100 },
});

export default CardSelectedItem;
