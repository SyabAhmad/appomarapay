import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = { Home: undefined; Login: undefined };
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const Home: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState<string>('User');

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('auth_user');
      if (raw) {
        try {
          const u = JSON.parse(raw);
          setName(u.name || u.email || 'User');
        } catch {
          setName('User');
        }
      }
    })();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('auth_user');
      // Login screen was removed — reset to PinAuth instead
      navigation.reset({ index: 0, routes: [{ name: 'PinAuth' as never }] });
    } catch {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Home</Text></View>
      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome, {name}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={logout}>
          <Text style={styles.primaryText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flex: 1 },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#007DFF' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 20 },
  welcome: { fontSize: 20, fontWeight: '700', color: '#111' },
  primaryBtn: { backgroundColor: '#007DFF', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 10 },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default Home;