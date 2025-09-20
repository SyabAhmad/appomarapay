import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { unwrapResult } from '@reduxjs/toolkit';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import settings from '../../settings';
import { getWidth, isMobileDevice } from '../helper';
import { useAppDispatch, useAppSelector } from '../store/app/hook';
import { sendEReceipt } from '../store/features/transactions/transactions-slice';
import { printReceipt, sendReceipt } from '../store/features/transactions/transactionsThunk';
import { RootStackParamList } from '../typings/types';
import Button from './Button';
import LineDivider from './LineDivider.';

export type AmountProps = {
  items: AmountItemProps[];
  addPhoneScreen?: string;
};

export type AmountItemProps = {
  title: string | undefined;
  value: string | undefined;
};

export const AmountItem: React.FC<AmountItemProps> = ({ title, value }) => {
  const style = styles(false);
  return (
    <View style={style.itemContainer}>
      <Text style={style.itemTitle}>{title}</Text>
      <Text style={style.itemValue}>{value}</Text>
    </View>
  );
};

const TotalAmount: React.FC<AmountProps> = ({ items, addPhoneScreen }) => {
  const { activeTransaction, sendReceiptLoading, printReceiptLoading, permissionToSendEReceipt } = useAppSelector(
    state => state.transactions,
  );
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();

  const style = styles(printReceiptLoading);

  const handleSendReceipt = useCallback(async () => {
    try {
      if (activeTransaction?.transactionId && activeTransaction?.phoneNumber) {
        const response = await dispatch(
          sendReceipt({
            transactionId: activeTransaction.transactionId,
            phoneNumber: activeTransaction.phoneNumber,
          }),
        );
        unwrapResult(response);
        dispatch(sendEReceipt(false));
      } else if (activeTransaction?.transactionId && !activeTransaction?.phoneNumber) {
        // @ts-ignore
        addPhoneScreen && navigation.navigate(addPhoneScreen);
      } else {
        dispatch(sendEReceipt(false));
        throw new Error('Error! Transaction ID and Phone number is required!');
      }
    } catch (err) {
      console.log(err);
    }
  }, [activeTransaction, addPhoneScreen, navigation, dispatch]);

  const handlePrintReceipt = async () => {
    try {
      if (activeTransaction?.transactionId) {
        const response = await dispatch(printReceipt(activeTransaction.transactionId));
        unwrapResult(response);
      } else {
        throw new Error('Error! Transaction ID is required!');
      }
    } catch (err) {
      console.log(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (activeTransaction?.phoneNumber && permissionToSendEReceipt) {
        handleSendReceipt();
      }
    }, [activeTransaction, permissionToSendEReceipt, handleSendReceipt]),
  );

  return (
    <View style={isMobileDevice() ? style.containerMobile : style.container}>
      <View>
        {!isMobileDevice() && (
          <>
            <Text style={style.title}>Total amount to pay</Text>
            <Text style={style.subtitle}>E-Receipt will be sent via SMS</Text>
          </>
        )}

        <LineDivider />

        <View style={isMobileDevice() ? style.amountContainerMobile : style.amountContainer}>
          {items.map((item, index) => (
            <AmountItem key={index} {...item} />
          ))}
        </View>
        {isMobileDevice() && <LineDivider />}
      </View>

      <View style={style.buttonsContainer}>
        <Button
          onPress={handleSendReceipt}
          label='Send E-Receipt Via SMS'
          buttonContainerStyle={style.sendBtnContainer}
          labelStyle={style.sendBtnLabel}
          loading={sendReceiptLoading}
          indicatorStyle={style.indicator}
        />
        <Button
          onPress={handlePrintReceipt}
          label='Print E-Receipt'
          buttonContainerStyle={style.printBtnContainer}
          labelStyle={style.printBtnLabel}
          loading={printReceiptLoading}
          indicatorStyle={style.indicator}
        />
      </View>
    </View>
  );
};

const styles = (printReceiptLoading: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: settings.colors.gray1,
      borderRadius: 12,
      justifyContent: 'space-between',
      padding: 24,
      paddingBottom: 16,
      width: getWidth() * 0.3,
    },
    containerMobile: {
      marginTop: 20,
    },
    title: {
      color: settings.colors.black,
      fontFamily: 'Inter-Bold',
      fontSize: 24,
      marginBottom: 8,
    },
    subtitle: {
      color: settings.colors.gray,
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      marginBottom: 16,
    },
    amountContainer: {
      gap: 12,
      marginTop: 18,
    },
    amountContainerMobile: {
      gap: 10,
      marginVertical: 16,
      paddingHorizontal: 10,
    },
    itemContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    itemTitle: {
      color: settings.colors.gray,
      fontFamily: 'Inter-Regular',
      fontSize: isMobileDevice() ? 14 : 16,
    },
    itemValue: {
      color: settings.colors.gray,
      fontFamily: 'Inter-SemiBold',
      fontSize: isMobileDevice() ? 16 : 18,
    },
    buttonsContainer: {
      marginTop: isMobileDevice() ? 10 : 0,
    },
    sendBtnContainer: {
      marginBottom: 8,
      paddingVertical: 9,
    },
    sendBtnLabel: {
      fontFamily: 'Inter-Medium',
      fontSize: 12,
    },
    printBtnContainer: {
      backgroundColor: printReceiptLoading ? settings.colors.gray3 : settings.colors.blue200,
      paddingVertical: 9,
    },
    printBtnLabel: {
      color: printReceiptLoading ? settings.colors.white : settings.colors.blue,
      fontFamily: 'Inter-Medium',
      fontSize: 12,
    },
    indicator: {
      height: 16,
    },
  });

export default TotalAmount;
