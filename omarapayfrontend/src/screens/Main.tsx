import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MainScreenProp } from '../typings/types';

const Main: React.FC<MainScreenProp> = ({ navigation }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const redirectUser = async () => {
      try {
        // small defer so NavigationContainer is ready
        await new Promise(res => setTimeout(res, 0));

        const [companyLoggedIn, cashierLoggedIn] = await Promise.all([
          AsyncStorage.getItem('companyLoggedIn'),
          AsyncStorage.getItem('cashierLoggedIn'),
        ]);

        console.log('Main redirect:', { companyLoggedIn, cashierLoggedIn });

        if (companyLoggedIn === 'true' && cashierLoggedIn === 'true') {
          navigation.reset({ index: 0, routes: [{ name: 'Currencies' }] });
        } else if (companyLoggedIn === 'true') {
          navigation.reset({ index: 0, routes: [{ name: 'Cashiers' }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'CompanyLogin' }] });
        }
      } catch (e) {
        console.warn('Redirect failed:', e);
        setFailed(true);
      }
    };

    redirectUser();
  }, [navigation]);

  if (failed) {
    return (
      <View style={styles.container}>
        <Button title="Go to Company Login" onPress={() => navigation.replace('CompanyLogin')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007DFF" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
});

export default Main;