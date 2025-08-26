import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { unwrapResult } from '@reduxjs/toolkit';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

import settings from '../../settings';
import { getMediaPath, getWidth, isMobileDevice } from '../helper';
import { useAppDispatch, useAppSelector } from '../store/app/hook';
import { setActiveSubPayment } from '../store/features/payments/payments-slice';
import { changeTransaction } from '../store/features/transactions/transactionsThunk';
import { PaymentMethod, RootStackParamList } from '../typings/types';

export type Props = {
  item: PaymentMethod;
};

const PaymentItem: React.FC<Props> = ({ item }) => {
  const { activeTransaction } = useAppSelector(state => state.transactions);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const handlePress = async () => {
    dispatch(setActiveSubPayment(item));
    try {
      if (activeTransaction?.transactionId) {
        const changeResponse = await dispatch(
          changeTransaction({ transactionId: activeTransaction.transactionId, paymentMethodsId: item.id }),
        );
        unwrapResult(changeResponse);
        navigation.navigate('GcashScan');
      } else {
        throw new Error('Error!!! ID is required!');
      }
    } catch (err) {
      console.log(err, 'err');
    }
  };
  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Image source={{ uri: getMediaPath(item.mediaPath) }} style={styles.image} resizeMode='contain' />
      <Text style={styles.title}>{item.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: settings.colors.gray1,
    borderRadius: 12,
    gap: isMobileDevice() ? 16 : 24,
    height: isMobileDevice() ? 145 : 238,
    justifyContent: 'center',
    width: isMobileDevice() ? getWidth() * 0.7 : getWidth() * 0.3,
  },
  image: {
    height: isMobileDevice() ? 65 : 103,
    width: isMobileDevice() ? 65 : 103,
  },
  title: {
    color: settings.colors.black,
    fontFamily: 'Inter-Medium',
    fontSize: isMobileDevice() ? 18 : 24,
  },
});

export default PaymentItem;
