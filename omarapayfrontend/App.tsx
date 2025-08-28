/**
 * OmaraPay Frontend - React Native App
 * Frontend-only auth flow
 */

import React from 'react';
import { StatusBar, useColorScheme, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from './src/config/env';
// screens used in your flow
import AuthGate from './src/screens/AuthGate';
import PinAuth from './src/screens/PinAuth';
import PaymentMethod from './src/screens/PaymentMethod';
import BlockchainMethod from './src/screens/BlockchainMethod';
import TokenSelection from './src/screens/TokenSelection';
import AmountEntry from './src/screens/AmountEntry';
import ConfirmPayment from './src/screens/ConfirmPayment';
import PhoneConfirmation from './src/screens/PhoneConfirmation';
import OtpVerification from './src/screens/OtpVerification';
import CryptoPay from './src/screens/CryptoPay';
import CardMethod from './src/screens/CardMethod';
import GCashMethod from './src/screens/GCashMethod';
import DetailedReceipt from './src/screens/DetailedReceipt';
import FinalSuccess from './src/screens/FinalSuccess';
import FinalFailure from './src/screens/FinalFailure';
import Login from './src/screens/auth/Login';
import Signup from './src/screens/auth/Signup';
import Home from './src/screens/Home';
import Logout from './src/screens/Logout';
import CardPayment from './src/screens/CardPayment';

type RootStackParamList = {
  AuthGate: undefined;
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  PaymentMethod: { selectedMethod?: 'Card' | 'Blockchain' | 'GCash'; selectedToken?: string; chainId?: string } | undefined;
  BlockchainMethod: undefined; // NEW
  CardMethod: undefined; // NEW
  GCashMethod: undefined; // NEW
  TokenSelection: { chainId: string; chainName?: string } | undefined; // NEW
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
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
          <NavigationContainer>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <Stack.Navigator initialRouteName="AuthGate" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="AuthGate" component={AuthGate} />
              <Stack.Screen name="PinAuth" component={PinAuth} />
              {/* <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Signup" component={Signup} */}
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="PaymentMethod" component={PaymentMethod} />
              <Stack.Screen name="BlockchainMethod" component={BlockchainMethod} />
              <Stack.Screen name="TokenSelection" component={TokenSelection} />
              <Stack.Screen name="AmountEntry" component={AmountEntry} />
              <Stack.Screen name="ConfirmPayment" component={ConfirmPayment} />
              <Stack.Screen name="PhoneConfirmation" component={PhoneConfirmation} />
              <Stack.Screen name="OtpVerification" component={OtpVerification} />
              <Stack.Screen name="CryptoPay" component={CryptoPay} />
              <Stack.Screen name="CardMethod" component={CardMethod} />
              <Stack.Screen name="GCashMethod" component={GCashMethod} />
              <Stack.Screen name="DetailedReceipt" component={DetailedReceipt} />
              <Stack.Screen name="FinalSuccess" component={FinalSuccess} />
              <Stack.Screen name="FinalFailure" component={FinalFailure} />
              <Stack.Screen name="Logout" component={Logout} />
              <Stack.Screen name="CardPayment" component={CardPayment} />
            </Stack.Navigator>
          </NavigationContainer>
        </StripeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default App;
