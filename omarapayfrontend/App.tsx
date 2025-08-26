/**
 * OmaraPay Frontend - React Native App
 * Frontend-only auth flow
 */

import React from 'react';
import { StatusBar, useColorScheme, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AuthGate from './src/screens/AuthGate';
import Login from './src/screens/auth/Login';
import Signup from './src/screens/auth/Signup';
import Home from './src/screens/Home';
import PaymentMethod from './src/screens/PaymentMethod';
import BlockchainMethod from './src/screens/BlockchainMethod'; // NEW
import CardMethod from './src/screens/CardMethod'; // NEW
import GCashMethod from './src/screens/GCashMethod'; // NEW

type RootStackParamList = {
  AuthGate: undefined;
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  PaymentMethod: undefined;
  BlockchainMethod: undefined; // NEW
  CardMethod: undefined; // NEW
  GCashMethod: undefined; // NEW
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Simple error boundary to surface JS errors instead of a white screen
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error('ErrorBoundary caught:', error); }
  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff' }}>
          <Text style={{ fontWeight: '800', marginBottom: 8 }}>App error</Text>
          <Text>{this.state.error.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <NavigationContainer>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <Stack.Navigator initialRouteName="PaymentMethod" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="PaymentMethod" component={PaymentMethod} />
            <Stack.Screen name="BlockchainMethod" component={BlockchainMethod} />
            <Stack.Screen name="CardMethod" component={CardMethod} />
            <Stack.Screen name="GCashMethod" component={GCashMethod} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="AuthGate" component={AuthGate} />
          </Stack.Navigator>
        </NavigationContainer>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default App;
