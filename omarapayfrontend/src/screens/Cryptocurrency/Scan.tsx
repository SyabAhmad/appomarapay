import { useFocusEffect } from '@react-navigation/native';
import { unwrapResult } from '@reduxjs/toolkit';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import settings from '../../../settings';
import AppInput from '../../components/AppInput';
import Button from '../../components/Button';
import Header from '../../components/Header';
import Nav from '../../components/Nav';
import TotalAmount from '../../components/TotalAmount';
import { formatAmount, formatStringWithDots, getWidth, isMobileDevice } from '../../helper';
import { useAppDispatch, useAppSelector } from '../../store/app/hook';
import { clearError } from '../../store/features/transactions/transactions-slice';
import { checkTransactionStatus, resendWalletAddress } from '../../store/features/transactions/transactionsThunk';
import { CryptocurrencyScanScreenProp, PAYMENT_STATUS } from '../../typings/types';

const CryptocurrencyScan: React.FC<CryptocurrencyScanScreenProp> = ({ navigation }) => {
  const { error, activeTransaction, resendWalletLoading } = useAppSelector(state => state.transactions);
  const dispatch = useAppDispatch();

  const details = [
    {
      title: 'Cryptocurrency:',
      value: activeTransaction?.paymentMethods.name,
    },
    {
      title: 'Amount:',
      value: `${
        isNaN(Number(activeTransaction?.convertedAmount)) ? '' : formatAmount(activeTransaction?.convertedAmount)
      } ${activeTransaction?.paymentMethods.symbol}`,
    },
    {
      title: 'in USD rate:',
      value: `$${activeTransaction?.amount}`,
    },
    {
      title: 'Mobile number:',
      value: `${activeTransaction?.phoneNumber}`,
    },
  ];

  useFocusEffect(
    useCallback(() => {
      const fetchStatus = async () => {
        try {
          if (activeTransaction?.transactionId) {
            const response = await dispatch(checkTransactionStatus(activeTransaction.transactionId));
            unwrapResult(response);

            if (response.payload.status === PAYMENT_STATUS.COMPLETED) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'CryptocurrencySuccessful' }],
              });
            }
          } else {
            throw new Error('Error!!! ID is required!');
          }
        } catch (err) {
          console.log(err, 'error');
        }
      };

      const intervalId = setInterval(() => {
        fetchStatus();
      }, 20000);

      if (error) {
        clearInterval(intervalId);
      }

      return () => {
        clearInterval(intervalId);
      };
    }, [dispatch, activeTransaction?.transactionId, navigation, error]),
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        dispatch(clearError());
      };
    }, [dispatch]),
  );

  const handleResendAddress = async () => {
    try {
      if (activeTransaction?.transactionId) {
        const response = await dispatch(resendWalletAddress(activeTransaction.transactionId));
        unwrapResult(response);
      } else {
        throw new Error('Error! Transaction ID and Phone number is required!');
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Header title='QR code' />

      <View style={styles.container}>
        <ScrollView>
          <Nav title={error || 'Scan QR Code using your Crypto wallet'} isIncorrect={error} />

          {!isMobileDevice() && (
            <View style={styles.mainContainer}>
              <View style={styles.scanContainer}>
                <View style={styles.codeContainer}>
                  <QRCode
                    value={activeTransaction?.address.address}
                    size={171}
                    backgroundColor={settings.colors.gray1}
                  />
                  <Text style={styles.codeTitle}>
                    Or Copy the wallet address sent to your mobile number to make the payment
                  </Text>
                </View>

                <Text
                  style={
                    styles.inputLabel
                  }>{`Only send ${activeTransaction?.paymentMethods.name} in this Address`}</Text>

                <View style={styles.addressContainer}>
                  <AppInput
                    value={formatStringWithDots(activeTransaction?.address.address, 24)}
                    readOnly={true}
                    disabled={true}
                    {...styles.input}
                  />
                  <Button
                    onPress={handleResendAddress}
                    label='Resend address'
                    buttonContainerStyle={styles.button}
                    loading={resendWalletLoading}
                  />
                </View>
              </View>

              <TotalAmount items={details} />
            </View>
          )}

          {isMobileDevice() && (
            <View style={styles.scanContainerMob}>
              <View style={styles.codeContainerMob}>
                <QRCode value={activeTransaction?.address.address} size={171} backgroundColor={settings.colors.gray1} />
                <Text style={{ ...styles.codeTitle, fontSize: 16 }}>
                  Or Copy the wallet address sent to your mobile number to make the payment
                </Text>
              </View>

              <Text style={{ ...styles.inputLabel, marginTop: 20 }}>Only send Bitcoin in this Address</Text>

              <View style={styles.addressContainer}>
                <AppInput
                  value={formatStringWithDots(activeTransaction?.address.address, 24)}
                  readOnly={true}
                  disabled={true}
                  {...{ ...styles.input, fontSize: 14, padding: 10 }}
                />
                <Button
                  onPress={handleResendAddress}
                  label='Resend address'
                  labelStyle={styles.buttonMob}
                  buttonContainerStyle={styles.buttonMobContainer}
                  loading={resendWalletLoading}
                />
              </View>

              <TotalAmount items={details} />
            </View>
          )}
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
  mainContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 16,
    marginVertical: 30,
  },
  scanContainer: {
    backgroundColor: settings.colors.gray1,
    borderRadius: 12,
    padding: 24,
    width: getWidth() * 0.45,
  },
  codeContainer: {
    alignItems: 'center',
    gap: 28,
    paddingHorizontal: 20,
  },
  codeTitle: {
    color: settings.colors.gray,
    fontFamily: 'Inter-Medium',
    fontSize: 20,
    textAlign: 'center',
  },
  input: {
    color: settings.colors.gray500,
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 18,
  },
  inputLabel: {
    marginBottom: 8,
    marginTop: 29,
  },
  addressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    minWidth: 200,
  },
  scanContainerMob: {
    marginBottom: 40,
    marginTop: 20,
    paddingHorizontal: 14,
  },
  codeContainerMob: {
    alignItems: 'center',
    gap: 16,
  },
  buttonMob: {
    fontSize: 14,
  },
  buttonMobContainer: {
    minWidth: 150,
    paddingHorizontal: 0,
  },
});

export default CryptocurrencyScan;
