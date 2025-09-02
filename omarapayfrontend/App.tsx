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



// Add imports for the new wrappers
import CardStart from './src/screens/PaymentMethods/Card/Start';
import CardAmountEntry from './src/screens/PaymentMethods/Card/AmountEntry';
import CardConfirm from './src/screens/PaymentMethods/Card/Confirm';
import CardPhone from './src/screens/PaymentMethods/Card/Phone';
import CardOtp from './src/screens/PaymentMethods/Card/Otp';
import CardPay from './src/screens/PaymentMethods/Card/Pay';
import CardReceipt from './src/screens/PaymentMethods/Card/Receipt';
import CardSuccess from './src/screens/PaymentMethods/Card/Success';
import CardFailure from './src/screens/PaymentMethods/Card/Failure';

import GCashStart from './src/screens/PaymentMethods/Wallets/GCash/Start';
import GCashAmountEntry from './src/screens/PaymentMethods/Wallets/GCash/AmountEntry';
import GCashConfirm from './src/screens/PaymentMethods/Wallets/GCash/Confirm';
import GCashPhone from './src/screens/PaymentMethods/Wallets/GCash/Phone';
import GCashOtp from './src/screens/PaymentMethods/Wallets/GCash/Otp';
import GCashReceipt from './src/screens/PaymentMethods/Wallets/GCash/Receipt';
import GCashSuccess from './src/screens/PaymentMethods/Wallets/GCash/Success';
import GCashFailure from './src/screens/PaymentMethods/Wallets/GCash/Failure';

import GoogleWalletAmountEntry from './src/screens/PaymentMethods/Wallets/GoogleWallet/AmountEntry';
import GoogleWalletConfirm from './src/screens/PaymentMethods/Wallets/GoogleWallet/Confirm';
import GoogleWalletPhone from './src/screens/PaymentMethods/Wallets/GoogleWallet/Phone';
import GoogleWalletOtp from './src/screens/PaymentMethods/Wallets/GoogleWallet/Otp';
import GoogleWalletPay from './src/screens/PaymentMethods/Wallets/GoogleWallet/Pay';
import GoogleWalletReceipt from './src/screens/PaymentMethods/Wallets/GoogleWallet/Receipt';
import GoogleWalletSuccess from './src/screens/PaymentMethods/Wallets/GoogleWallet/Success';
import GoogleWalletFailure from './src/screens/PaymentMethods/Wallets/GoogleWallet/Failure';

import CryptoStart from './src/screens/PaymentMethods/Crypto/Start';
import CryptoTokenSelection from './src/screens/PaymentMethods/Crypto/TokenSelection';
import CryptoAmountEntry from './src/screens/PaymentMethods/Crypto/AmountEntry';
import CryptoConfirm from './src/screens/PaymentMethods/Crypto/Confirm';
import CryptoOtp from './src/screens/PaymentMethods/Crypto/Otp';
import CryptoPay from './src/screens/PaymentMethods/Crypto/Pay';
import CryptoQr from './src/screens/PaymentMethods/Crypto/Qr';
import CryptoReceipt from './src/screens/PaymentMethods/Crypto/Receipt';
import CryptoSuccess from './src/screens/PaymentMethods/Crypto/Success';
import CryptoFailure from './src/screens/PaymentMethods/Crypto/Failure';

import AuthGate from './src/screens/AuthGate';
import PinAuth from './src/screens/PinAuth';
import Home from './src/screens/Home';
import Logout from './src/screens/Logout';
import PaymentMethod from './src/screens/PaymentMethod';

type RootStackParamList = {
  AuthGate: undefined;
  PinAuth: undefined;
  Home: undefined;
  Logout: undefined;
  PaymentMethod: { selectedMethod?: 'Card' | 'Blockchain' | 'GCash'; selectedToken?: string; chainId?: string } | undefined;
  BlockchainMethod: undefined;
  CardMethod: undefined;
  GCashMethod: undefined;
  TokenSelection: { chainId: string; chainName?: string } | undefined;
  AmountEntry: undefined;
  ConfirmPayment: undefined;
  PhoneConfirmation: undefined;
  OtpVerification: undefined;
  CryptoPay: undefined;
  CardPayment: undefined;
  DetailedReceipt: undefined;
  FinalSuccess: undefined;
  FinalFailure: undefined;
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
            <Stack.Navigator initialRouteName="PaymentMethod" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="AuthGate" component={AuthGate} />
              <Stack.Screen name="PinAuth" component={PinAuth} />
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="Logout" component={Logout} />
              <Stack.Screen name="PaymentMethod" component={PaymentMethod} />
              {/* Card flow */}
              <Stack.Screen name="CardStart" component={CardStart} />
              <Stack.Screen name="CardAmountEntry" component={CardAmountEntry} />
              <Stack.Screen name="CardConfirm" component={CardConfirm} />
              <Stack.Screen name="CardPhone" component={CardPhone} />
              <Stack.Screen name="CardOtp" component={CardOtp} />
              <Stack.Screen name="CardPay" component={CardPay} />
              <Stack.Screen name="CardReceipt" component={CardReceipt} />
              <Stack.Screen name="CardSuccess" component={CardSuccess} />
              <Stack.Screen name="CardFailure" component={CardFailure} />
              {/* Wallets → GCash */}
              <Stack.Screen name="GCashStart" component={GCashStart} />
              <Stack.Screen name="GCashAmountEntry" component={GCashAmountEntry} />
              <Stack.Screen name="GCashConfirm" component={GCashConfirm} />
              <Stack.Screen name="GCashPhone" component={GCashPhone} />
              <Stack.Screen name="GCashOtp" component={GCashOtp} />
              <Stack.Screen name="GCashReceipt" component={GCashReceipt} />
              <Stack.Screen name="GCashSuccess" component={GCashSuccess} />
              <Stack.Screen name="GCashFailure" component={GCashFailure} />
              {/* Wallets → Google Wallet */}
              <Stack.Screen name="GoogleWalletAmountEntry" component={GoogleWalletAmountEntry} />
              <Stack.Screen name="GoogleWalletConfirm" component={GoogleWalletConfirm} />
              <Stack.Screen name="GoogleWalletPhone" component={GoogleWalletPhone} />
              <Stack.Screen name="GoogleWalletOtp" component={GoogleWalletOtp} />
              <Stack.Screen name="GoogleWalletPay" component={GoogleWalletPay} />
              <Stack.Screen name="GoogleWalletReceipt" component={GoogleWalletReceipt} />
              <Stack.Screen name="GoogleWalletSuccess" component={GoogleWalletSuccess} />
              <Stack.Screen name="GoogleWalletFailure" component={GoogleWalletFailure} />
              {/* Crypto flow */}
              <Stack.Screen name="CryptoStart" component={CryptoStart} />
              <Stack.Screen name="CryptoTokenSelection" component={CryptoTokenSelection} />
              <Stack.Screen name="CryptoAmountEntry" component={CryptoAmountEntry} />
              <Stack.Screen name="CryptoConfirm" component={CryptoConfirm} />
              <Stack.Screen name="CryptoOtp" component={CryptoOtp} />
              <Stack.Screen name="CryptoPay" component={CryptoPay} />
              <Stack.Screen name="CryptoQr" component={CryptoQr} />
              <Stack.Screen name="CryptoReceipt" component={CryptoReceipt} />
              <Stack.Screen name="CryptoSuccess" component={CryptoSuccess} />
              <Stack.Screen name="CryptoFailure" component={CryptoFailure} />
            </Stack.Navigator>
          </NavigationContainer>
        </StripeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default App;
