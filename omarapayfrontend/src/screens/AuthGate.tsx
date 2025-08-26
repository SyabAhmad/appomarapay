import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = { AuthGate: undefined; Login: undefined; Signup: undefined; Home: undefined };
type Props = NativeStackScreenProps<RootStackParamList, 'AuthGate'>;

const AuthGate: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const run = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) navigation.reset({ index: 0, routes: [{ name: 'Home' as never }] });
        else navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
      } catch {
        navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
      }
    };
    run();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007DFF" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
});

export default AuthGate;