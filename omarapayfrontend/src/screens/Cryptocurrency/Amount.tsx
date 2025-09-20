import { useFocusEffect } from '@react-navigation/native';
import { unwrapResult } from '@reduxjs/toolkit';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import settings from '../../../settings';
import AppInput from '../../components/AppInput';
import Button from '../../components/Button';
import Header from '../../components/Header';
import LabelInput from '../../components/LabelInput';
import Nav from '../../components/Nav';
import NumberKeyboard from '../../components/NumberKeyboard';
import NumberKeyboardRow from '../../components/NumberKeyboardRow';
import ProgressBar from '../../components/ProgressBar';
import { getWidth, isMobileDevice } from '../../helper';
import { useRate } from '../../hooks/useRate';
import { useAppDispatch, useAppSelector } from '../../store/app/hook';
import { fetchExchangeRate, sendTransaction } from '../../store/features/transactions/transactionsThunk';
import { CryptocurrencyAmountScreenProp, RATE } from '../../typings/types';

const CryptocurrencyAmount: React.FC<CryptocurrencyAmountScreenProp> = ({ navigation }) => {
  const [amountValue, setAmountValue] = useState('');
  const [convertedAmountValue, setConvertedAmountValue] = useState('');
  const [isContinuePressed, setIsContinuePressed] = useState(false);
  const { progress, widthAnimation, startProgress, stopProgress } = useRate();

  const { activeSubPayment } = useAppSelector(state => state.payments);
  const { exchangeRate, loading, error } = useAppSelector(state => state.transactions);
  const dispatch = useAppDispatch();

  const amountWithSymbol = `$ ${amountValue}`;
  const totalWithSymbol = `$${amountValue}`;
  const convertedWithSymbol = exchangeRate?.exchangeRate
    ? `${activeSubPayment?.symbol} ${convertedAmountValue}`
    : `${activeSubPayment?.symbol}`;

  useFocusEffect(
    useCallback(() => {
      const fetchRate = async () => {
        try {
          if (activeSubPayment?.symbol) {
            const response = await dispatch(fetchExchangeRate(activeSubPayment.symbol));
            unwrapResult(response);
            startProgress(widthAnimation);
          } else {
            throw new Error('Error!!! Symbol is required!');
          }
        } catch (err) {
          stopProgress();
          console.log(err);
        }
      };
      fetchRate();

      const intervalId = setInterval(() => {
        fetchRate();
      }, RATE.DURATION);

      return () => {
        clearInterval(intervalId);
        stopProgress();
      };
    }, [dispatch, activeSubPayment?.symbol, stopProgress, startProgress, widthAnimation]),
  );

  useEffect(() => {
    if (!amountValue) {
      setConvertedAmountValue('');
      return;
    }

    // calculate the value, reduce the numbers after the dot to 8 characters and remove the extra zeros at the end
    const calculatedAmount = (Number(amountValue) * Number(exchangeRate?.exchangeRate))
      .toFixed(8)
      .replace(/\.?0+$/, '')
      .toString();

    setConvertedAmountValue(calculatedAmount);
  }, [amountValue, exchangeRate?.exchangeRate]);

  const handlePress = async () => {
    try {
      if (activeSubPayment?.id) {
        const response = await dispatch(
          sendTransaction({
            paymentMethodsId: activeSubPayment.id,
            amount: amountValue,
            convertedAmount: convertedAmountValue,
          }),
        );
        unwrapResult(response);

        navigation.navigate('CryptocurrencyPhone');
      } else {
        throw new Error('Error!!! ID is required!');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const setTitle = (isMobile: () => boolean, continuePressed: boolean, errorMessage: string) => {
    switch (true) {
      case !!errorMessage:
        return errorMessage;
      case isMobile() && !continuePressed:
        return 'How much is the amount the customer will pay in Crypto?';
      case isMobile() && continuePressed:
        return 'Confirm amount in crypto';
      default:
        return 'Enter the Amount of the bill';
    }
  };

  return (
    <>
      <Header title={isContinuePressed ? 'Crypto rate box' : 'Enter amount of the bill'} />

      <View style={styles.container}>
        <ScrollView>
          <Nav
            title={setTitle(isMobileDevice, isContinuePressed, error)}
            subtitle={error || isMobileDevice() ? '' : 'How much is the amount the customer will pay in Crypto?'}
            containerStyle={styles.navContainer}
            titleStyle={styles.title}
            isIncorrect={error}
          />

          {!isMobileDevice() && (
            <View style={styles.amountContainer}>
              <View style={styles.keyboardContainer}>
                <AppInput
                  value={amountWithSymbol}
                  readOnly={true}
                  initialLength={2}
                  {...styles.input}
                  isError={error}
                />
                <NumberKeyboardRow
                  value={amountValue}
                  onChange={setAmountValue}
                  onConfirm={handlePress}
                  containerStyle={styles.keyboardButtons}
                  loading={loading}
                />
              </View>

              <View style={styles.rateContainer}>
                <Text style={styles.rateTitle}>Crypto rate box</Text>
                <LabelInput
                  value={totalWithSymbol}
                  label='Total amount to pay:'
                  containerStyle={styles.labelInput}
                  disabled={true}
                />
                <LabelInput
                  value={convertedWithSymbol}
                  label='This amount in'
                  dynamicLabel={activeSubPayment?.name}
                  containerStyle={styles.labelInput}
                  disabled={true}
                />
                <View style={styles.progressBar}>
                  <ProgressBar progress={progress} />
                  <Text style={styles.progressLabel}>Rate changes every 20 seconds</Text>
                </View>
              </View>
            </View>
          )}

          {isMobileDevice() && !isContinuePressed ? (
            <View style={styles.amountContainerMob}>
              <AppInput
                value={amountWithSymbol}
                readOnly={true}
                initialLength={2}
                {...styles.inputMob}
                isError={error}
              />
              <View>
                <NumberKeyboard value={amountValue} onChange={setAmountValue} />
                <Button
                  onPress={() => setIsContinuePressed(true)}
                  label='Continue'
                  buttonContainerStyle={styles.buttonMob}
                  disabled={amountValue.length < 1}
                />
              </View>
            </View>
          ) : null}

          {isMobileDevice() && isContinuePressed ? (
            <View style={styles.confirmContainer}>
              <View style={styles.rateContainerMob}>
                <LabelInput
                  value={totalWithSymbol}
                  label='Total amount to pay:'
                  containerStyle={styles.labelInput}
                  disabled={true}
                />
                <LabelInput
                  value={convertedWithSymbol}
                  label='This amount in'
                  dynamicLabel={activeSubPayment?.name}
                  containerStyle={styles.labelInput}
                  disabled={true}
                />
                <View style={styles.progressBar}>
                  <ProgressBar progress={progress} />
                  <Text style={styles.progressLabel}>Rate changes every 20 seconds</Text>
                </View>
              </View>
              <Button onPress={handlePress} label='Confirm' loading={loading} />
            </View>
          ) : null}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: settings.colors.white,
    flex: 1,
  },
  navContainer: {
    paddingTop: isMobileDevice() ? 0 : 20,
  },
  amountContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 16,
    marginVertical: 30,
  },
  keyboardContainer: {
    backgroundColor: settings.colors.gray1,
    borderRadius: 12,
    padding: 38,
    paddingBottom: 28,
  },
  input: {
    color: settings.colors.gray500,
    fontFamily: 'Inter-Medium',
    fontSize: 20,
    textAlign: 'center',
  },
  keyboardButtons: {
    gap: 6,
    marginVertical: 18,
  },
  rateContainer: {
    backgroundColor: settings.colors.gray1,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 38,
    width: 380,
  },
  rateTitle: {
    color: settings.colors.gray500,
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    marginBottom: 32,
    textAlign: 'center',
  },
  labelInput: {
    marginBottom: 24,
  },
  progressBar: { gap: 16, zIndex: 1 },
  progressLabel: {
    color: settings.colors.gray,
    fontFamily: 'Inter-Light',
    textAlign: 'center',
  },
  amountContainerMob: {
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: (getWidth() - getWidth() * 0.77) / 2,
  },
  inputMob: {
    color: settings.colors.gray500,
    fontFamily: 'Inter-Regular',
    fontSize: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
    width: '100%',
  },
  buttonMob: {
    marginTop: 10,
  },
  confirmContainer: {
    alignSelf: 'center',
    width: '80%',
  },
  rateContainerMob: {
    backgroundColor: settings.colors.gray1,
    borderRadius: 12,
    marginVertical: 20,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  title: {
    maxWidth: isMobileDevice() ? getWidth() * 0.8 : undefined,
  },
  progress: {
    height: 10,
    width: '100%',
  },
});

export default CryptocurrencyAmount;
