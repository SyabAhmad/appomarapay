import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, TextInput, Image, InteractionManager } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import { BASE_API_URL } from '@env';

type RootStackParamList = {
  CardPayment: {
    amount: string;
    currency?: string;
    description?: string;
    metadata?: Record<string, any>;
  } | undefined;
  DetailedReceipt: any;
  FinalSuccess: any;
  FinalFailure: any;
};
type Props = NativeStackScreenProps<RootStackParamList, 'CardPayment'>;

// use BASE_API_URL later when you centralize config; keep fallback for dev device
// const API_BASE = Platform.OS === 'android' ? 'http://192.168.0.109:5000' : 'http://localhost:5000';
const API_BASE = BASE_API_URL;

const CardPayment: React.FC<Props> = ({ navigation, route }) => {
  const { amount = '0.00', description = '', metadata = {} } = route.params ?? {};
  const usdAmount = Number(amount) || 0;
  const displayAmount = usdAmount.toFixed(2);

  const [loading, setLoading] = useState(false);
  const { confirmPayment } = useConfirmPayment();
  const [cardComplete, setCardComplete] = useState(false);
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [cardLast4, setCardLast4] = useState<string | null>(null);
  const [cardName, setCardName] = useState<string>(metadata?.name ?? '');

  // confirmPayment retry helper — retries when native "Activity doesn't exist yet" occurs
  const confirmPaymentWithRetry = async (clientSecret: string, options: any, maxAttempts = 6) => {
    let attempt = 0;
    let lastErr: any = null;

    // ensure native interactions are complete before calling confirmPayment
    await new Promise<void>((resolve) => {
      InteractionManager.runAfterInteractions(() => resolve());
      // fallback if InteractionManager never resolves quickly
      setTimeout(() => resolve(), 600);
    });

    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        console.info(`confirmPayment attempt ${attempt}`, { clientSecretSnippet: clientSecret?.slice?.(0, 12) });
        const result = await confirmPayment(clientSecret, options);
        // stripe-react-native may return { paymentIntent, error } instead of throwing
        if ((result as any).error) {
          const e = (result as any).error;
          const msg = String(e?.message || e?.localizedMessage || '');
          // transient startup message from native SDK
          if (msg.includes("Activity doesn't exist yet") || msg.includes('Activity does not exist')) {
            lastErr = e;
            const backoff = 350 * Math.pow(2, attempt - 1);
            console.warn(`Transient native startup error, retrying in ${backoff}ms`, e);
            await new Promise((r) => setTimeout(r, backoff));
            continue;
          }
          // non-transient error returned by SDK
          return result;
        }
        return result;
      } catch (err: any) {
        lastErr = err;
        const msg = String(err?.message || err?.localizedMessage || '');
        console.warn('confirmPayment thrown error attempt', attempt, msg, err);
        if (msg.includes("Activity doesn't exist yet") || msg.includes('Activity does not exist')) {
          const backoff = 350 * Math.pow(2, attempt - 1);
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }
        throw err;
      }
    }
    throw lastErr;
  };

  const onPay = async () => {
    if (!cardComplete) {
      Alert.alert('Enter card', 'Please complete card details');
      return;
    }
    if (!cardName || cardName.trim().length < 2) {
      Alert.alert('Cardholder name', 'Please enter the cardholder name');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/payments/card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: String(displayAmount), currency: 'usd', metadata }),
      });
      const body = await res.json().catch(() => null);
      console.info('create PaymentIntent response', body);
      if (!res.ok || !body?.clientSecret) {
        Alert.alert('Payment error', body?.message ?? 'Failed to create payment intent');
        setLoading(false);
        return;
      }
      const clientSecret = body.clientSecret;

      // call retry wrapper
      const { paymentIntent, error } = await confirmPaymentWithRetry(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            name: cardName,
            phone: metadata?.phone ?? undefined,
          },
        },
      });

      if (error) {
        console.error('confirmPayment error', error);
        Alert.alert('Payment failed', error.localizedMessage ?? error.message ?? 'Unable to confirm payment');
        setLoading(false);
        return;
      }

      if (paymentIntent) {
        // consider payment successful when Stripe reports 'succeeded'
        const status = String(paymentIntent.status || '').toLowerCase();
        if (status === 'succeeded' || status === 'processing' || status === 'requires_capture') {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'FinalSuccess' as never,
                params: {
                  success: true,
                  chainName: 'Card',
                  tokenSymbol: 'USD', // card payments kept in USD
                  tokenAmount: displayAmount,
                  usdAmount: displayAmount,
                  mobile: metadata?.phone ?? '-',
                  receivingAddress: paymentIntent.id,
                  txId: body.txId ?? paymentIntent.id,
                } as never,
              },
            ],
          });
          return;
        }

        // not succeeded -> show receipt for manual follow-up
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'DetailedReceipt' as never,
              params: {
                chainName: 'Card',
                tokenSymbol: 'USD',
                tokenAmount: displayAmount,
                usdAmount: displayAmount,
                mobile: metadata?.phone ?? '-',
                receivingAddress: paymentIntent.id,
                txId: body.txId ?? paymentIntent.id,
                hosted_url: null,
              } as never,
            },
          ],
        });
      }
    } catch (err: any) {
      console.error('card payment error', err);
      Alert.alert('Error', err?.message ?? 'Network or server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safe}>
      <Text style={styles.title}>Pay USD {displayAmount}</Text>

      <View style={styles.previewRow}>
        <View style={styles.brandWrap}>
          <Image source={require('../../assets/visa.png')} style={styles.brandImg} />
          <Text style={styles.brandText}>{cardBrand ? cardBrand.toUpperCase() : 'Card'}</Text>
        </View>
        <Text style={styles.last4Text}>{cardLast4 ? `•••• ${cardLast4}` : '•••• ••••'}</Text>
      </View>

      <TextInput
        placeholder="Cardholder name"
        value={cardName}
        onChangeText={setCardName}
        style={styles.nameInput}
        returnKeyType="done"
      />

      <View style={styles.cardFieldWrap}>
        <CardField
          postalCodeEnabled={true}
          placeholders={{ number: '4242 4242 4242 4242' }}
          cardStyle={{ backgroundColor: '#ffffff', textColor: '#000000', borderRadius: 8 }}
          style={{ width: '100%', height: 56 }}
          onCardChange={(card) => {
            setCardComplete(!!card?.complete);
            setCardBrand(card?.brand ?? null);
            setCardLast4(card?.last4 ?? null);
          }}
        />
      </View>

      <TouchableOpacity
        style={[styles.btn, (loading || !cardComplete || !cardName) ? { opacity: 0.6 } : null]}
        onPress={onPay}
        disabled={loading || !cardComplete || !cardName}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Pay {`$${displayAmount}`}</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 20, backgroundColor: '#f7fafc', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '800', marginTop: 8, marginBottom: 12 },
  previewRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
  },
  brandWrap: { flexDirection: 'row', alignItems: 'center' },
  brandImg: { width: 28, height: 18, marginRight: 8, tintColor: '#111827' },
  brandText: { fontWeight: '700' },
  last4Text: { color: '#374151', fontWeight: '700' },
  nameInput: {
    width: '100%',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardFieldWrap: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 18,
  },
  btn: { marginTop: 8, width: '100%', backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800' },
});

export default CardPayment;