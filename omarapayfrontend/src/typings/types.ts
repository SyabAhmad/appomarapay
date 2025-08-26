import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export enum INPUT_NAME {
  NUMBER = 'Number',
  DATE = 'Date',
  CVV = 'CVV',
}

export enum RATE {
  DURATION = 20000,
}

export enum PAYMENTS_NAME {
  CRYPTOCURRENCY = 'Cryptocurrency',
  FX_TOKEN = 'FX Token',
  VISA = 'Visa',
  MASTERCARD = 'MasterCard',
  UNION_PAY = 'UnionPay',
  GCASH = 'GCash',
  ALIPAY = 'Alipay',
}

export enum PAYMENT_STATUS {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  NEW = 'NEW',
}

export interface Company {
  id: number;
  name: string;
  userName: string;
  email: string;
  authenticationDate: string;
  currencies: {
    id: number;
    name: string;
    shortName: string;
    symbol: string;
  };
}

export interface Cashier {
  id: number;
  name: string;
  username: string;
  email: string;
  authenticationDate: string;
  currencies: {
    id: number;
    name: string;
    shortName: string;
    symbol: string;
  };
  merchant: {
    id: number;
    name: string;
    email: string;
    currencies: {
      id: number;
      name: string;
      shortName: string;
      symbol: string;
    };
  };
  totalTransactionSum: number;
}

export interface CashierListItem {
  name: string;
  id: number;
}

export type PaymentMethod = {
  id: number;
  name: string;
  mediaId: number;
  symbol: string | null;
  mediaPath: string;
  color?: string;
  address: string | null;
};

export interface PinProps {
  pin: string;
  id?: number;
}

export interface AccessProps extends PinProps {
  accessToken: string;
}

export type TokenProps = {
  bearerToken: string;
  refreshToken: string;
};

export interface SendTransactionProps {
  paymentMethodsId: number;
  amount?: string;
  convertedAmount?: string;
}

export interface Product {
  createdAt: string;
  name: string;
  price: string;
  product: { createdAt: string; mediaPath: string; name: string; price: string };
  qty: number;
}

export interface ActiveTransactionProps {
  transactionId: string;
  amount: string;
  convertedAmount: string;
  status: string;
  phoneNumber: string;
  currencies: any;
  paymentMethods: any;
  qrCode?: string;
  transactionsProducts?: Product[];
  address: { id: number; address: string };
}

export interface ExchangeRateProps {
  id: number;
  exchangeRate: string;
  cryptoSymbol: string;
  currency: string;
}

export interface TransactionAllProps {
  paymentMethodName: string;
  parentPaymentMethodName: string;
  cashierName: string;
  currencyName: string;
  currencyShortName: string;
  currencySymbol: string;
  transactionId: number;
  status: string;
  amount: string;
  convertedAmount: string;
  createdAt: string;
}
export interface TransactionProps {
  transactionId: string;
  paymentMethods: {
    name: string;
    symbol: null;
    paymentMethods: null;
  };
  amount: string;
  status: string;
  convertedAmount: string;
  currencies: {
    name: string;
    shortName: string;
    symbol: string;
  };
  phoneNumber: string;
  code: string;
  address: { id: number; address: string };
}

export interface CodeProps {
  code: string;
  expiredAt: string;
  id: number;
  phoneNumber: string;
}

export interface SendSmsCodeProps {
  transactionId: string;
  phoneNumber?: string;
  paymentMethodsId?: number;
}

export interface ConfirmSmsCodeProps {
  transactionId: string;
  code: string;
}

export interface SortProps {
  sort: string | null;
  offset: number;
}

// NAVIGATION

export type RootStackParamList = {
  Main: undefined;
  CompanyLogin: undefined;
  CashierLogin: { id: number };
  Logout: { logoutFrom: string };
  Cashiers: undefined;
  Currencies: undefined;
  TransactionHistory: undefined;
  Account: undefined;
  CryptocurrencyList: undefined;
  CryptocurrencyAmount: undefined;
  CryptocurrencyPhone: undefined;
  CryptocurrencySecurity: undefined;
  CryptocurrencyScan: undefined;
  CryptocurrencySuccessful: undefined;
  CardInsert: undefined;
  CardSuccessful: undefined;
  CardPhone: undefined;
  CardAddInfo: undefined;
  CardSelectedItem: undefined;
  AliWePayScan: undefined;
  AliWePayConfirm: undefined;
  AliWePaySuccessful: undefined;
  AliWePayPhone: undefined;
  GcashAmount: undefined;
  GcashSuccessful: undefined;
  GcashScan: undefined;
  GcashPayment: undefined;
};

export type MainScreenProp = NativeStackScreenProps<RootStackParamList, 'Main'>;

export type CompanyLoginScreenProp = NativeStackScreenProps<RootStackParamList, 'CompanyLogin'>;
export type CashierLoginScreenProp = NativeStackScreenProps<RootStackParamList, 'CashierLogin'>;
export type LogoutScreenProp = NativeStackScreenProps<RootStackParamList, 'Logout'>;

export type CashiersScreenProp = NativeStackScreenProps<RootStackParamList, 'Cashiers'>;
export type CurrenciesScreenProp = NativeStackScreenProps<RootStackParamList, 'Currencies'>;
export type TransactionHistoryScreenProp = NativeStackScreenProps<RootStackParamList, 'TransactionHistory'>;
export type AccountScreenProp = NativeStackScreenProps<RootStackParamList, 'Account'>;

export type AliWePayScanScreenProp = NativeStackScreenProps<RootStackParamList, 'AliWePayScan'>;
export type AliWePayConfirmScreenProp = NativeStackScreenProps<RootStackParamList, 'AliWePayConfirm'>;
export type AliWePaySuccessfulScreenProp = NativeStackScreenProps<RootStackParamList, 'AliWePaySuccessful'>;
export type AliWePayPhoneScreenProp = NativeStackScreenProps<RootStackParamList, 'AliWePayPhone'>;

export type CryptocurrencyListScreenProp = NativeStackScreenProps<RootStackParamList, 'CryptocurrencyList'>;
export type CryptocurrencyAmountScreenProp = NativeStackScreenProps<RootStackParamList, 'CryptocurrencyAmount'>;
export type CryptocurrencyPhoneScreenProp = NativeStackScreenProps<RootStackParamList, 'CryptocurrencyPhone'>;
export type CryptocurrencySecurityScreenProp = NativeStackScreenProps<RootStackParamList, 'CryptocurrencySecurity'>;
export type CryptocurrencyScanScreenProp = NativeStackScreenProps<RootStackParamList, 'CryptocurrencyScan'>;
export type CryptocurrencySuccessfulScreenProp = NativeStackScreenProps<RootStackParamList, 'CryptocurrencySuccessful'>;

export type CardInsertScreenProp = NativeStackScreenProps<RootStackParamList, 'CardInsert'>;
export type CardSuccessfulScreenProp = NativeStackScreenProps<RootStackParamList, 'CardSuccessful'>;
export type CardPhoneScreenProp = NativeStackScreenProps<RootStackParamList, 'CardPhone'>;
export type CardSelectedItemScreenProp = NativeStackScreenProps<RootStackParamList, 'CardSelectedItem'>;
export type CardAddInfoScreenProp = NativeStackScreenProps<RootStackParamList, 'CardAddInfo'>;

export type GcashAmountScreenProp = NativeStackScreenProps<RootStackParamList, 'GcashAmount'>;
export type GcashSuccessfulScreenProp = NativeStackScreenProps<RootStackParamList, 'GcashSuccessful'>;
export type GcashScanScreenProp = NativeStackScreenProps<RootStackParamList, 'GcashScan'>;
export type GcashPaymentScreenProp = NativeStackScreenProps<RootStackParamList, 'GcashPayment'>;
// END NAVIGATION
