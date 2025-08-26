import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import settings from '../../../settings';
import Header from '../../components/Header';
import InfoModule from '../../components/InfoModule';
import Nav from '../../components/Nav';
import TotalAmount from '../../components/TotalAmount';
import { isMobileDevice } from '../../helper';
import { useAppDispatch, useAppSelector } from '../../store/app/hook';
import { clearError } from '../../store/features/transactions/transactions-slice';
import { AliWePaySuccessfulScreenProp } from '../../typings/types';

const AliWePaySuccessful: React.FC<AliWePaySuccessfulScreenProp> = ({ navigation }) => {
  const { error, activeTransaction } = useAppSelector(state => state.transactions);
  const dispatch = useAppDispatch();

  const productPath = activeTransaction?.transactionsProducts?.[0];

  const details = [
    {
      title: 'Item',
      value: productPath?.name,
    },
    {
      title: 'Amount:',
      value: `$${productPath?.price}`,
    },
  ];

  useFocusEffect(
    useCallback(() => {
      return () => dispatch(clearError());
    }, [dispatch]),
  );

  const handleNewPress = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Currencies' }] });
  };
  return (
    <>
      <Header title='Successful Payment' showBackBtn={false} />

      <View style={styles.container}>
        <ScrollView>
          <Nav title={error || 'Successful Payment!'} isIncorrect={error} />

          <View style={styles.mainContainer}>
            <InfoModule
              title='Congratulations!'
              subtitle='Your payment is successful'
              lightBlueBtnLabel='New transaction'
              onPressLightBlueBtn={handleNewPress}
            />

            {!isMobileDevice() && <TotalAmount items={details} addPhoneScreen='AliWePayPhone' />}
          </View>

          {isMobileDevice() && (
            <View style={styles.amountContainer}>
              <TotalAmount items={details} addPhoneScreen='AliWePayPhone' />
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
    flexDirection: isMobileDevice() ? 'column' : 'row',
    gap: 16,
    marginVertical: isMobileDevice() ? 16 : 40,
  },
  amountContainer: {
    padding: 20,
    paddingTop: 0,
  },
});

export default AliWePaySuccessful;
