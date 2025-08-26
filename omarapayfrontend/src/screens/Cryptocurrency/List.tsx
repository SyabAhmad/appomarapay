import { unwrapResult } from '@reduxjs/toolkit';
import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import settings from '../../../settings';
import CryptoCurrencyItem from '../../components/CryptocurrencyItem';
import Header from '../../components/Header';
import Nav from '../../components/Nav';
import { getWidth, isMobileDevice } from '../../helper';
import { useAppDispatch, useAppSelector } from '../../store/app/hook';
import { fetchSubPaymentMethods } from '../../store/features/payments/paymentsThunk';
import { CryptocurrencyListScreenProp, PAYMENTS_NAME } from '../../typings/types';

const CryptocurrencyList: React.FC<CryptocurrencyListScreenProp> = () => {
  const { subPaymentMethods, activePayment, error, loading } = useAppSelector(state => state.payments);
  const dispatch = useAppDispatch();

  const isShowSymbol = activePayment?.name === PAYMENTS_NAME.CRYPTOCURRENCY;

  useEffect(() => {
    const fetchSubPayments = async () => {
      try {
        if (activePayment?.id) {
          const response = await dispatch(fetchSubPaymentMethods(activePayment.id));
          unwrapResult(response);
        } else {
          throw new Error('Error!!! ID is required!');
        }
      } catch (err) {
        console.log(err, 'error');
      }
    };
    fetchSubPayments();
  }, [activePayment?.id, dispatch]);

  return (
    <>
      <Header title='Pay by Cryptocurrency' />

      <View style={styles.container}>
        <ScrollView>
          <Nav title={error || 'Pay by Cryptocurrency'} isIncorrect={error} />

          {loading ? (
            <ActivityIndicator color={settings.colors.gray3} style={styles.activityIndicator} size='large' />
          ) : (
            <View style={styles.cashiersListContainer}>
              {subPaymentMethods.map(item => (
                <CryptoCurrencyItem key={item.id} item={item} isShowSymbol={isShowSymbol} />
              ))}
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
  cashiersListContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isMobileDevice() ? 10 : 16,
    justifyContent: 'center',
    paddingBottom: 50,
    paddingTop: isMobileDevice() ? 20 : 50,
    width: isMobileDevice() ? getWidth() * 0.63 : getWidth() * 0.58,
  },
  activityIndicator: {
    marginTop: 200,
  },
});

export default CryptocurrencyList;
