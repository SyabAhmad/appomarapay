import { useFocusEffect } from '@react-navigation/native';
import { unwrapResult } from '@reduxjs/toolkit';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import settings from '../../../settings';
import Button from '../../components/Button';
import Header from '../../components/Header';
import Nav from '../../components/Nav';
import { getWidth, isMobileDevice } from '../../helper';
import { useAppDispatch, useAppSelector } from '../../store/app/hook';
import { clearError } from '../../store/features/transactions/transactions-slice';
import { confirmTransaction } from '../../store/features/transactions/transactionsThunk';
import { AliWePayConfirmScreenProp } from '../../typings/types';

const AliWePayConfirm: React.FC<AliWePayConfirmScreenProp> = ({ navigation }) => {
  const { activeTransaction, loading, error } = useAppSelector(state => state.transactions);
  const dispatch = useAppDispatch();

  useFocusEffect(
    useCallback(() => {
      return () => dispatch(clearError());
    }, [dispatch]),
  );

  const handlePress = async () => {
    try {
      if (activeTransaction?.transactionId) {
        const response = await dispatch(confirmTransaction(activeTransaction.transactionId));
        unwrapResult(response);
        navigation.reset({ index: 0, routes: [{ name: 'AliWePaySuccessful' }] });
      } else {
        throw new Error('Error!!! ID is required!');
      }
    } catch (err) {
      console.log(err, 'error');
    }
  };
  return (
    <>
      <Header title='Confirm price' />

      <View style={styles.container}>
        <ScrollView>
          <Nav title={error || 'Confirm price'} isIncorrect={error} />

          <View style={styles.mainContainer}>
            <View style={styles.containerCard}>
              <Text style={styles.title}>Confirm your purchaise</Text>
              <Text style={styles.subtitle}>
                In your Alipay app is shown your items and price, confirm this price to continue
              </Text>
              <View style={styles.buttonContainer}>
                <Button onPress={handlePress} label='Confirm' loading={loading} />
              </View>
            </View>
          </View>
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
    margin: isMobileDevice() ? 20 : 40,
  },
  containerCard: {
    backgroundColor: settings.colors.gray1,
    borderRadius: 12,
    height: isMobileDevice() ? 340 : 395,
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: isMobileDevice() ? '100%' : getWidth() * 0.45,
  },
  buttonContainer: {
    paddingHorizontal: isMobileDevice() ? 40 : 110,
  },
  title: {
    color: settings.colors.black,
    fontFamily: 'Inter-Bold',
    fontSize: isMobileDevice() ? 24 : 36,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: settings.colors.gray,
    fontFamily: 'Inter-Regular',
    fontSize: isMobileDevice() ? 14 : 18,
    marginBottom: 18,
    textAlign: 'center',
  },
});

export default AliWePayConfirm;
