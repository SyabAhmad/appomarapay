import { useFocusEffect } from '@react-navigation/native';
import { unwrapResult } from '@reduxjs/toolkit';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import settings from '../../../settings';
import AppInput from '../../components/AppInput';
import Button from '../../components/Button';
import Header from '../../components/Header';
import Nav from '../../components/Nav';
import NumberKeyboard from '../../components/NumberKeyboard';
import NumberKeyboardRow from '../../components/NumberKeyboardRow';
import TimerInfo from '../../components/TimerInfo';
import { getWidth, isMobileDevice } from '../../helper';
import { useAppDispatch, useAppSelector } from '../../store/app/hook';
import { clearError, clearSmsCode } from '../../store/features/transactions/transactions-slice';
import { confirmSmsCode, sendSmsCode } from '../../store/features/transactions/transactionsThunk';
import { CryptocurrencySecurityScreenProp } from '../../typings/types';

const CryptocurrencySecurity: React.FC<CryptocurrencySecurityScreenProp> = ({ navigation }) => {
  const [code, setCode] = useState('');
  const [codeIsExpired, setCodeIsExpired] = useState(false);

  const { loading, smsLoading, error, activeTransaction } = useAppSelector(state => state.transactions);
  const dispatch = useAppDispatch();

  const codeWithSymbol = `OMP - ${code}`;
  const isActive = code.length > 0;

  useFocusEffect(
    useCallback(() => {
      return () => {
        dispatch(clearError());
        setCodeIsExpired(false);
      };
    }, [dispatch]),
  );

  const handlePress = async () => {
    try {
      if (activeTransaction?.transactionId) {
        const response = await dispatch(confirmSmsCode({ transactionId: activeTransaction.transactionId, code }));
        unwrapResult(response);

        setCode('');
        dispatch(clearSmsCode());

        navigation.navigate('CryptocurrencyScan');
      } else {
        throw new Error('Error! Transaction ID is required!');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = () => {
    dispatch(clearError());
    setCodeIsExpired(false);
    navigation.navigate('CryptocurrencyPhone');
  };

  const handleResend = async () => {
    try {
      if (activeTransaction?.transactionId && activeTransaction.phoneNumber) {
        const smsResponse = await dispatch(
          sendSmsCode({ transactionId: activeTransaction.transactionId, phoneNumber: activeTransaction.phoneNumber }),
        );
        unwrapResult(smsResponse);
        setCode('');
        setCodeIsExpired(false);
      } else {
        throw new Error('Error! Transaction ID and phone number is required!');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const setTitle = (errorMessage: string, codeIsExpiredMessage: boolean) => {
    switch (true) {
      case !!errorMessage:
        return errorMessage;
      case codeIsExpiredMessage:
        return 'The security code has expired';
      default:
        return 'Enter the Secured Authorisation code';
    }
  };

  return (
    <>
      <Header title='Security code' />

      <View style={styles.container}>
        <ScrollView>
          <Nav
            title={setTitle(error, codeIsExpired)}
            isIncorrect={error || codeIsExpired}
            containerStyle={styles.navContainer}
          />

          {isMobileDevice() && (
            <>
              {error || codeIsExpired ? (
                <View style={styles.resendContainerMob}>
                  <Button
                    buttonContainerStyle={styles.resendBtnContainer}
                    labelStyle={styles.resendBtnLabel}
                    onPress={handleChange}
                    label='Change phone number'
                  />
                  <Button
                    buttonContainerStyle={styles.resendBtnContainer}
                    labelStyle={styles.resendBtnLabel}
                    onPress={handleResend}
                    label='Resend code'
                    loading={smsLoading}
                  />
                </View>
              ) : null}
              <View style={styles.timerContainerMob}>
                {!error && !codeIsExpired && <TimerInfo setCodeIsExpired={setCodeIsExpired} />}
              </View>
            </>
          )}

          {!isMobileDevice() && (
            <View style={styles.amountContainer}>
              {error || codeIsExpired ? (
                <View style={styles.resendContainer}>
                  <Button
                    buttonContainerStyle={styles.resendBtnContainer}
                    labelStyle={styles.resendBtnLabel}
                    onPress={handleChange}
                    label='Change phone number'
                  />
                  <Button
                    buttonContainerStyle={styles.resendBtnContainer}
                    labelStyle={styles.resendBtnLabel}
                    onPress={handleResend}
                    label='Resend code'
                    loading={smsLoading}
                  />
                </View>
              ) : null}
              <View style={styles.keyboardContainer}>
                <View style={styles.timerContainer}>
                  {!error && !codeIsExpired && <TimerInfo setCodeIsExpired={setCodeIsExpired} />}
                </View>

                <AppInput
                  value={codeWithSymbol}
                  readOnly={true}
                  {...{
                    ...styles.input,
                    borderColor:
                      error || codeIsExpired
                        ? settings.colors.red200
                        : isActive
                        ? settings.colors.blue300
                        : settings.colors.gray3,
                  }}
                />
                <NumberKeyboardRow
                  value={code}
                  onChange={setCode}
                  onConfirm={handlePress}
                  containerStyle={styles.keyboardButtons}
                  loading={loading}
                />
              </View>
            </View>
          )}

          {isMobileDevice() && (
            <View style={styles.amountContainerMob}>
              <AppInput
                value={code}
                readOnly={true}
                {...{
                  ...styles.inputMob,
                  borderColor:
                    error || codeIsExpired
                      ? settings.colors.red200
                      : isActive
                      ? settings.colors.blue300
                      : settings.colors.gray3,
                }}
              />
              <View>
                <NumberKeyboard value={code} onChange={setCode} />
                <Button
                  onPress={handlePress}
                  label='Continue'
                  buttonContainerStyle={styles.buttonMob}
                  loading={loading}
                  disabled={code.length < 1}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
};

const mobilePadding = (getWidth() - getWidth() * 0.77) / 2;

const styles = StyleSheet.create({
  container: {
    backgroundColor: settings.colors.white,
    flex: 1,
  },
  navContainer: {
    paddingTop: isMobileDevice() ? 0 : 20,
  },
  amountContainer: {
    alignSelf: 'center',
    gap: 16,
  },
  keyboardContainer: {
    backgroundColor: settings.colors.gray1,
    borderRadius: 12,
    marginVertical: 28,
    padding: 48,
    paddingVertical: 20,
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
  amountContainerMob: {
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: mobilePadding,
  },
  inputMob: {
    color: settings.colors.gray500,
    fontFamily: 'Inter-Regular',
    fontSize: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
    textAlign: 'center',
    width: '100%',
  },
  buttonMob: {
    marginTop: 10,
  },
  resendContainerMob: {
    gap: 8,
    marginBottom: 10,
    paddingHorizontal: mobilePadding,
  },
  resendBtnContainer: {
    flex: 1,
    padding: 9,
  },
  resendBtnLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  resendContainer: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 10,
  },
  timerContainerMob: {
    marginBottom: 10,
  },
  timerContainer: {
    marginBottom: 8,
  },
});

export default CryptocurrencySecurity;
