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
import { sendTransaction } from '../../store/features/transactions/transactionsThunk';
import { GcashAmountScreenProp } from '../../typings/types';

const GcashAmount: React.FC<GcashAmountScreenProp> = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const { activePayment } = useAppSelector(state => state.payments);
  const { loading, error } = useAppSelector(state => state.transactions);
  const dispatch = useAppDispatch();

  const valueWithSymbol = `$ ${amount}`;

  const handlePress = async () => {
    try {
      if (activePayment?.id) {
        const response = await dispatch(sendTransaction({ paymentMethodsId: activePayment.id, amount }));
        unwrapResult(response);

        navigation.navigate('GcashPayment');
      } else {
        throw new Error('Error!!! ID is required!');
      }
    } catch (err) {
      console.log(err, 'error');
    }
  };
  return (
    <>
      <Header title='Enter amount of the bill' />

      <View style={phoneStyles.container}>
        <ScrollView>
          <Nav
            title={error || 'Enter the payment amount'}
            containerStyle={phoneStyles.navContainer}
            isIncorrect={error}
          />

          {!isMobileDevice() && (
            <View style={phoneStyles.amountContainer}>
              <View style={phoneStyles.keyboardContainer}>
                <AppInput
                  value={valueWithSymbol}
                  readOnly={true}
                  initialLength={2}
                  {...phoneStyles.input}
                  isError={error}
                />
                <NumberKeyboardRow
                  value={amount}
                  onChange={setAmount}
                  onConfirm={handlePress}
                  containerStyle={phoneStyles.keyboardButtons}
                  loading={loading}
                />
              </View>
            </View>
          )}

          {isMobileDevice() && (
            <View style={phoneStyles.amountContainerMob}>
              <AppInput
                value={valueWithSymbol}
                readOnly={true}
                initialLength={2}
                {...phoneStyles.inputMob}
                isError={error}
              />
              <View>
                <NumberKeyboard value={amount} onChange={setAmount} />
                <Button
                  onPress={handlePress}
                  label='Continue'
                  buttonContainerStyle={phoneStyles.buttonMob}
                  loading={loading}
                  disabled={amount.length < 1}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
};

export default GcashAmount;
