import { useFocusEffect } from '@react-navigation/native';
import { unwrapResult } from '@reduxjs/toolkit';
import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import settings from '../../../settings';
import Header from '../../components/Header';
import Nav from '../../components/Nav';
import PaymentItem from '../../components/PaymentItem';
import { isMobileDevice } from '../../helper';
import { useAppDispatch, useAppSelector } from '../../store/app/hook';
import { clearPaymentError } from '../../store/features/payments/payments-slice';
import { fetchSubPaymentMethods } from '../../store/features/payments/paymentsThunk';
import { GcashPaymentScreenProp } from '../../typings/types';

const GcashPayment: React.FC<GcashPaymentScreenProp> = () => {
  const { activePayment, subPaymentMethods, loading, error } = useAppSelector(state => state.payments);
  const dispatch = useAppDispatch();

  useFocusEffect(
    useCallback(() => {
      return () => dispatch(clearPaymentError());
    }, [dispatch]),
  );

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
      <Header title='Payment method' />

      <View style={styles.container}>
        <ScrollView>
          <Nav title={error || 'Choose the payment method'} containerStyle={styles.navContainer} isIncorrect={error} />
          {loading ? (
            <ActivityIndicator color={settings.colors.gray3} style={styles.activityIndicator} size='large' />
          ) : (
            <View style={styles.itemContainer}>
              {subPaymentMethods.map((item, index) => {
                return <PaymentItem item={item} key={index} />;
              })}
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
  itemContainer: {
    alignItems: 'center',
    flexDirection: isMobileDevice() ? 'column' : 'row',
    gap: 14,
    justifyContent: 'center',
    marginHorizontal: isMobileDevice() ? 20 : 50,
    margin: isMobileDevice() ? 10 : 50,
  },
  activityIndicator: {
    marginTop: 200,
  },
});

export default GcashPayment;
