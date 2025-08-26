import { useFocusEffect } from '@react-navigation/native';
import { unwrapResult } from '@reduxjs/toolkit';
import React, { useCallback } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import settings from '../../../settings';
import Header from '../../components/Header';
import InfoModule from '../../components/InfoModule';
import Nav from '../../components/Nav';
import TotalAmount from '../../components/TotalAmount';
import { formatAmount, isMobileDevice } from '../../helper';
import { useAppDispatch, useAppSelector } from '../../store/app/hook';
import { clearActiveTransaction, clearError } from '../../store/features/transactions/transactions-slice';
import { verifyTransaction } from '../../store/features/transactions/transactionsThunk';
import { CryptocurrencySuccessfulScreenProp } from '../../typings/types';

const CryptocurrencySuccessful: React.FC<CryptocurrencySuccessfulScreenProp> = ({ navigation }) => {
  const { error, loading, activeTransaction } = useAppSelector(state => state.transactions);
  const dispatch = useAppDispatch();

  useFocusEffect(
    useCallback(() => {
      return () => {
        dispatch(clearError());
        dispatch(clearActiveTransaction());
      };
    }, [dispatch]),
  );

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

  const handlePress = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Currencies' }] });
  };

  const handleVerify = async () => {
    try {
      if (activeTransaction?.transactionId) {
        const response = await dispatch(verifyTransaction(activeTransaction.transactionId));
        unwrapResult(response);

        await Linking.openURL(response.payload.url);

        navigation.reset({ index: 0, routes: [{ name: 'Currencies' }] });
      } else {
        throw new Error('Error!!! ID is required!');
      }
    } catch (err) {
      console.log(err, 'error');
    }
  };

  return (
    <>
      <Header title='Successful Payment' showBackBtn={false} />

      <View style={styles.container}>
        <ScrollView>
          <Nav title={error || 'Successful Payment!'} containerStyle={styles.navContainer} isIncorrect={error} />

          <View style={styles.mainContainer}>
            <InfoModule
              title='Congratulations!'
              subtitle='Your payment is successful'
              blueBtnLabel='Verify transaction on Blockchain'
              lightBlueBtnLabel='New transaction'
              loading={loading}
              onPressBlueBtn={handleVerify}
              onPressLightBlueBtn={handlePress}
            />

            {!isMobileDevice() && <TotalAmount items={details} />}
          </View>

          {isMobileDevice() && (
            <View style={styles.amountContainer}>
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
  navContainer: {
    paddingTop: isMobileDevice() ? 0 : 20,
  },
  mainContainer: {
    alignSelf: 'center',
    flexDirection: isMobileDevice() ? 'column' : 'row',
    gap: 16,
    marginVertical: isMobileDevice() ? 0 : 40,
  },
  amountContainer: {
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
});

export default CryptocurrencySuccessful;
