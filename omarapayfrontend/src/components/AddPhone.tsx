import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { unwrapResult } from '@reduxjs/toolkit';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import settings from '../../settings';
import { getWidth, isMobileDevice } from '../helper';
import { useAppDispatch, useAppSelector } from '../store/app/hook';
import { clearError, sendEReceipt } from '../store/features/transactions/transactions-slice';
import { changeTransaction } from '../store/features/transactions/transactionsThunk';
import { RootStackParamList } from '../typings/types';
import AppInput from './AppInput';
import Button from './Button';
import InfoItem from './InfoItem';
import Nav from './Nav';
import NumberKeyboard from './NumberKeyboard';
import NumberKeyboardRow from './NumberKeyboardRow';

interface Props {
  showAmount?: boolean;
  tabletTitle: string;
  mobileTitle: string;
}

const AddPhone: React.FC<Props> = ({ showAmount, tabletTitle, mobileTitle }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const { activeTransaction, loading, error } = useAppSelector(state => state.transactions);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const productPath = activeTransaction?.transactionsProducts?.[0];

  useFocusEffect(
    useCallback(() => {
      return () => dispatch(clearError());
    }, [dispatch]),
  );

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

  const handlePress = async () => {
    try {
      if (activeTransaction?.transactionId) {
        const changeResponse = await dispatch(
          changeTransaction({ transactionId: activeTransaction.transactionId, phoneNumber }),
        );
        unwrapResult(changeResponse);
        dispatch(sendEReceipt(true));

        navigation.goBack();
      } else {
        throw new Error('Error!!! ID of phone number is required!');
      }
    } catch (err) {
      console.log(err, 'error');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Nav
          title={error || (isMobileDevice() ? mobileTitle : tabletTitle)}
          subtitle={error || isMobileDevice() ? '' : 'Add your phone number to receive receipt via SMS'}
          containerStyle={styles.navContainer}
          isIncorrect={error}
        />

        {!isMobileDevice() && (
          <View style={styles.phoneContainer}>
            <View style={styles.keyboardContainer}>
              <AppInput value={phoneNumber} readOnly={true} {...styles.input} isError={error} />
              <NumberKeyboardRow
                value={phoneNumber}
                onChange={setPhoneNumber}
                onConfirm={handlePress}
                containerStyle={styles.keyboardButtons}
                loading={loading}
              />
            </View>
          </View>
        )}

        {isMobileDevice() && (
          <>
            {showAmount && (
              <View style={styles.amountContainer}>
                <InfoItem items={details} />
              </View>
            )}

            <View style={styles.phoneContainerMob}>
              <AppInput value={phoneNumber} readOnly={true} {...styles.inputMob} />
              <View>
                <NumberKeyboard value={phoneNumber} onChange={setPhoneNumber} />
                <Button
                  onPress={handlePress}
                  label='Continue'
                  buttonContainerStyle={styles.buttonMob}
                  loading={loading}
                  disabled={phoneNumber.length < 1}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
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
  phoneContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 16,
    marginVertical: isMobileDevice() ? 20 : 30,
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
  phoneContainerMob: {
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
    paddingHorizontal: (getWidth() - getWidth() * 0.77) / 2,
  },
  inputMob: {
    color: settings.colors.gray500,
    fontFamily: 'Inter-Regular',
    fontSize: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    textAlign: 'center',
    width: '100%',
  },
  buttonMob: {
    marginTop: 16,
  },
  amountContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
});

export default AddPhone;
