import { unwrapResult } from '@reduxjs/toolkit';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import AppInput from '../../components/AppInput';
import Button from '../../components/Button';
import Header from '../../components/Header';
import Nav from '../../components/Nav';
import NumberKeyboard from '../../components/NumberKeyboard';
import NumberKeyboardRow from '../../components/NumberKeyboardRow';
import { isMobileDevice } from '../../helper';
import { phoneStyles } from '../../helper/styles';
import { useAppDispatch, useAppSelector } from '../../store/app/hook';
import { changeTransaction, sendSmsCode } from '../../store/features/transactions/transactionsThunk';
import { CryptocurrencyPhoneScreenProp } from '../../typings/types';

const CryptocurrencyPhone: React.FC<CryptocurrencyPhoneScreenProp> = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const { loading, error, activeTransaction, smsLoading } = useAppSelector(state => state.transactions);
  const dispatch = useAppDispatch();

  const handlePress = async () => {
    try {
      if (activeTransaction?.transactionId) {
        const changeResponse = await dispatch(
          changeTransaction({ transactionId: activeTransaction.transactionId, phoneNumber }),
        );
        unwrapResult(changeResponse);

        const smsResponse = await dispatch(
          sendSmsCode({ transactionId: activeTransaction.transactionId, phoneNumber }),
        );
        unwrapResult(smsResponse);

        navigation.navigate('CryptocurrencySecurity');
      } else {
        throw new Error('Error!!! ID of phone number is required!');
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      <Header title='Phone number' />

      <View style={phoneStyles.container}>
        <ScrollView>
          <Nav
            title={
              error ? error : isMobileDevice() ? 'Enter customers phone number' : 'Enter the Customer’s Phone number'
            }
            containerStyle={phoneStyles.navContainer}
            isIncorrect={error}
          />

          {!isMobileDevice() && (
            <View style={phoneStyles.amountContainer}>
              <View style={phoneStyles.keyboardContainer}>
                <AppInput value={phoneNumber} readOnly={true} {...phoneStyles.input} isError={error} />
                <NumberKeyboardRow
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  onConfirm={handlePress}
                  containerStyle={phoneStyles.keyboardButtons}
                  loading={loading || smsLoading}
                />
              </View>
            </View>
          )}

          {isMobileDevice() && (
            <View style={phoneStyles.amountContainerMob}>
              <AppInput value={phoneNumber} readOnly={true} {...phoneStyles.inputMob} isError={error} />
              <View>
                <NumberKeyboard value={phoneNumber} onChange={setPhoneNumber} />
                <Button
                  onPress={handlePress}
                  label='Continue'
                  buttonContainerStyle={phoneStyles.buttonMob}
                  loading={loading || smsLoading}
                  disabled={phoneNumber.length < 1}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
};

export default CryptocurrencyPhone;
