/**
 * OmaraPay Frontend - React Native App
 * Payment Processing Application (Frontend Only)
 * 
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import Main from './src/screens/Main';
import CompanyLogin from './src/screens/CompanyLogin';
import Cashiers from './src/screens/Cashiers';
import CashierLogin from './src/screens/CashierLogin';
import Currencies from './src/screens/Currencies';
import TransactionHistory from './src/screens/TransactionHistory';
import Logout from './src/screens/Logout';
import CardSelectedItem from './src/screens/Card/SelectedItem';

// Types
import { RootStackParamList } from './src/typings/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <Stack.Navigator 
          initialRouteName="Main"
          screenOptions={{
            headerShown: false, // Hide headers for custom design
          }}
        >
          {/* Main Flow */}
          <Stack.Screen name="Main" component={Main} />
          <Stack.Screen name="CompanyLogin" component={CompanyLogin} />
          <Stack.Screen name="Cashiers" component={Cashiers} />
          <Stack.Screen name="CashierLogin" component={CashierLogin} />
          <Stack.Screen name="Currencies" component={Currencies} />
          <Stack.Screen name="TransactionHistory" component={TransactionHistory} />
          <Stack.Screen name="Logout" component={Logout} />
          <Stack.Screen name="CardSelectedItem" component={CardSelectedItem} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
