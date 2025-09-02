import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';

type ReaderStatus = 'idle' | 'pairing' | 'waiting' | 'processing' | 'success' | 'error';

type Props = {
  amount?: string;
  deviceName?: string | null;
  errorMessage?: string | null;
  onStart?: () => void;      // call your hardware SDK start/pair
  onCancel?: () => void;     // cancel/prompt
  onRetry?: () => void;      // retry flow
  onDone?: () => void;       // finished (success) callback
  onBack?: () => void;       // back action (optional)
};

const CardReaderUI: React.FC<Props> = ({ amount = '0.00', deviceName = null, errorMessage = null, onStart, onCancel, onRetry, onDone, onBack }) => {
  const [status, setStatus] = useState<ReaderStatus>('idle');

  const start = () => {
    setStatus('pairing');
    try {
      onStart?.();
    } finally {
      // caller/SDK should update real status via callbacks — here we keep UI-only transitions for demo
      setTimeout(() => setStatus('waiting'), 800);
    }
  };

  const cancel = () => {
    setStatus('idle');
    onCancel?.();
  };

  const retry = () => {
    setStatus('pairing');
    onRetry?.();
    setTimeout(() => setStatus('waiting'), 700);
  };

  const markSuccess = () => {
    setStatus('success');
    onDone?.();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    // fallback: call onCancel only if provided (do not call navigation.goBack() here)
    onCancel?.();
  };
  
  return (
    <View style={styles.safe}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image source={require('../../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Tap / Swipe via Reader</Text>
          <Text style={styles.subtitle}>Use your external card reader to accept contactless payments</Text>
        </View>

        <View style={{ width: 64 }} />
      </View>

      <View style={styles.card}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amount}>${Number(amount).toFixed(2)}</Text>
        </View>

        <View style={styles.stateRow}>
          <View style={styles.stateLeft}>
            <Text style={styles.stateLabel}>Reader</Text>
            <Text style={styles.stateValue}>{deviceName ?? (status === 'idle' ? 'Not paired' : 'Searching…')}</Text>
          </View>

          <View style={styles.stateRight}>
            <Text style={styles.stateLabel}>Status</Text>
            <View style={styles.badgeWrap}>
              {status === 'pairing' && <Text style={styles.badgeText}>Pairing…</Text>}
              {status === 'waiting' && <Text style={styles.badgeText}>Waiting for tap</Text>}
              {status === 'processing' && <Text style={styles.badgeText}>Processing…</Text>}
              {status === 'success' && <Text style={[styles.badgeText, styles.successText]}>✓ Success</Text>}
              {status === 'error' && <Text style={[styles.badgeText, styles.errorText]}>Error</Text>}
              {status === 'idle' && <Text style={styles.badgeText}>Idle</Text>}
            </View>
          </View>
        </View>

        <View style={styles.instructions}>
          {status === 'idle' && <Text style={styles.instructionText}>Press start to discover and pair your reader.</Text>}
          {status === 'pairing' && <Text style={styles.instructionText}>Looking for readers nearby… make sure the reader is powered on.</Text>}
          {status === 'waiting' && <Text style={styles.instructionText}>Hold card near the reader — waiting for NFC tap or swipe.</Text>}
          {status === 'processing' && <Text style={styles.instructionText}>Processing payment. Please keep the card near the reader.</Text>}
          {status === 'success' && <Text style={styles.instructionText}>Payment accepted. You may print or send receipt.</Text>}
          {status === 'error' && <Text style={styles.instructionText}>{errorMessage ?? 'An error occurred. Retry or cancel.'}</Text>}
        </View>

        <View style={styles.actions}>
          {(status === 'idle' || status === 'error') && (
            <TouchableOpacity style={styles.primary} onPress={start}>
              <Text style={styles.primaryText}>Start pairing</Text>
            </TouchableOpacity>
          )}

          {status === 'pairing' && (
            <View style={styles.rowActions}>
              <ActivityIndicator style={{ marginRight: 12 }} />
              <TouchableOpacity style={styles.ghost} onPress={cancel}><Text style={styles.ghostText}>Cancel</Text></TouchableOpacity>
            </View>
          )}

          {status === 'waiting' && (
            <View style={styles.rowActions}>
              <ActivityIndicator />
              <TouchableOpacity style={styles.ghost} onPress={cancel}><Text style={styles.ghostText}>Cancel</Text></TouchableOpacity>
            </View>
          )}

          {status === 'processing' && (
            <View style={styles.rowActions}>
              <ActivityIndicator />
              <TouchableOpacity style={styles.ghost} onPress={cancel}><Text style={styles.ghostText}>Abort</Text></TouchableOpacity>
            </View>
          )}

          {status === 'success' && (
            <View style={styles.rowActions}>
              <TouchableOpacity style={styles.primary} onPress={markSuccess}><Text style={styles.primaryText}>Done</Text></TouchableOpacity>
            </View>
          )}

          {status === 'error' && (
            <View style={styles.rowActions}>
              <TouchableOpacity style={styles.primary} onPress={retry}><Text style={styles.primaryText}>Retry</Text></TouchableOpacity>
              <TouchableOpacity style={styles.ghost} onPress={cancel}><Text style={styles.ghostText}>Cancel</Text></TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.note}>This screen is UI-only. Hook your reader SDK to onStart/onRetry/onDone callbacks to drive status changes.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fafc', padding: 18, alignItems: 'center' },

  headerRow: { width: '100%', maxWidth: 720, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  back: { color: '#2563eb', fontWeight: '700', paddingVertical: 6, paddingHorizontal: 6 },
  headerCenter: { flex: 1, alignItems: 'center' },
  logo: { width: 120, height: 36, marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  subtitle: { color: '#6b7280', marginTop: 6 },

  card: { width: '100%', maxWidth: 720, backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 6, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },

  amountRow: { alignItems: 'center', marginBottom: 10 },
  amountLabel: { color: '#94a3b8' },
  amount: { fontSize: 28, fontWeight: '900', marginTop: 6 },

  stateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  stateLeft: { flex: 1 },
  stateRight: { alignItems: 'flex-end' },
  stateLabel: { color: '#94a3b8', fontSize: 13 },
  stateValue: { fontWeight: '800', marginTop: 6 },

  badgeWrap: { marginTop: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: '#eef2ff' },
  badgeText: { fontWeight: '800', color: '#0f172a' },
  successText: { color: '#065f46' },
  errorText: { color: '#b91c1c' },

  instructions: { paddingVertical: 12 },
  instructionText: { color: '#6b7280', textAlign: 'center' },

  actions: { marginTop: 6, alignItems: 'center' },
  primary: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 10, minWidth: 220, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '800' },
  ghost: { backgroundColor: '#f1f5f9', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, marginLeft: 10 },
  ghostText: { color: '#0f172a', fontWeight: '800' },
  rowActions: { flexDirection: 'row', alignItems: 'center' },

  note: { color: '#94a3b8', fontSize: 12, marginTop: 12, textAlign: 'center' },
});

export default CardReaderUI;