import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import CardReaderUI from './Reader';
import { API_BASE } from '../config/env';

type Props = {
  navigation: any;
  route: { params?: { amount?: string; currency?: string; description?: string; metadata?: Record<string, any> } };
};

const CardPayment: React.FC<Props> = ({ navigation, route }) => {
  const amount = String(Number(route?.params?.amount ?? '0').toFixed(2));
  const currency = (route?.params?.currency ?? 'usd').toLowerCase();
  const description = route?.params?.description ?? 'Payment';
  const metadata = route?.params?.metadata ?? {};

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const createPI = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/payments/card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, metadata }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.clientSecret) {
        throw new Error(body?.message || `Failed (${res.status}) creating PaymentIntent`);
      }
      setClientSecret(body.clientSecret);

      setReady(true);
    } catch (e: any) {
      // Alert.alert('Init failed', e?.message ?? 'Unable to initialize payment');
    } finally {
      setLoading(false);
    }
  }, [amount, currency, metadata]);

  useEffect(() => {
    createPI();
  }, [createPI]);

  const safeBack = () => {
    try {
      if (navigation?.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'PaymentMethod' as never }] });
      }
    } catch (err) {
      console.warn('safeBack failed', err);
    }
  };

  const handleProcess = async (securityCode: string) => {
    // call your SDK/backend to finalize charge. Example placeholder:
    // await api.post('/payments/card/confirm', { amount, metadata, securityCode })
    // For now simulate:
    await new Promise((r) => setTimeout(r, 900));
  };

  // UI-only: render the CardReader UI and wire lightweight callbacks to existing logic
  return (
    <View style={{ flex: 1 }}>
      <CardReaderUI
        amount={String(Number(route?.params?.amount ?? '0').toFixed(2))}
        deviceName={undefined as any}
        errorMessage={undefined as any}
        onStart={() => { /* start pairing / SDK connect */ }}
        onRetry={() => { /* retry */ }}
        onCancel={() => safeBack()}
        onBack={() => safeBack()}
        onProcess={async (code) => {
          try {
            await handleProcess(code);
            // navigate to success/receipt
            navigation.reset({ index: 0, routes: [{ name: 'CardSuccess' as never }] });
          } catch {
            // show error
            navigation.navigate('CardFailure' as never, { errorMessage: 'Payment failed' } as never);
          }
        }}
        onDone={() => {
          navigation.reset({ index: 0, routes: [{ name: 'CardReceipt' as never }] });
        }}
      />
    </View>
  );
};

export default CardPayment;
