import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import settings from '../../../settings';
import Button from '../../components/Button';
import Header from '../../components/Header';
import LabelInput from '../../components/LabelInput';
import NumberKeyboard from '../../components/NumberKeyboard';
import { isMobileDevice, renderDateCard, renderNumberCard } from '../../helper';
import { CardAddInfoScreenProp, INPUT_NAME } from '../../typings/types';

const CardAddInfo: React.FC<CardAddInfoScreenProp> = ({ navigation }) => {
  const [number, setNumber] = useState('');
  const [date, setDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [focusedInput, setFocusedInput] = useState(INPUT_NAME.NUMBER);

  const isButtonDisabled = number.length < 1 || date.length < 1 || cvv.length < 1;

  const handlePress = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'CardSuccessful' }],
    });
  };

  const setNewValue = (value: any) => {
    switch (focusedInput) {
      case INPUT_NAME.CVV:
        setCvv(value);
        break;
      case INPUT_NAME.DATE:
        setDate(value);
        break;
      default:
        setNumber(value);
        break;
    }
  };

  const setFocusedValue = () => {
    switch (focusedInput) {
      case INPUT_NAME.CVV:
        return cvv;
      case INPUT_NAME.DATE:
        return date;
      default:
        return number;
    }
  };

  const getMaxLength = () => {
    switch (focusedInput) {
      case INPUT_NAME.CVV:
        return 3;
      case INPUT_NAME.DATE:
        return 4;
      default:
        return 16;
    }
  };

  return (
    <>
      <Header title='Add credit card' />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formContainer}>
          <View style={styles.leftContainer}>
            <View style={styles.inputContainer}>
              <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode='contain' />
              <Text style={styles.title}>Add your credit card information</Text>
              <View style={styles.inputItemsContainer}>
                <LabelInput
                  value={renderNumberCard(number)}
                  name={INPUT_NAME.NUMBER}
                  label='Your serial number'
                  inputProps={{ readOnly: true }}
                  focusedInput={focusedInput}
                  setFocusedInput={setFocusedInput}
                />
                <View style={styles.doubleInputsContainer}>
                  <LabelInput
                    value={renderDateCard(date)}
                    label='Date'
                    name={INPUT_NAME.DATE}
                    inputProps={{ readOnly: true }}
                    containerStyle={styles.doubleInputs}
                    focusedInput={focusedInput}
                    setFocusedInput={setFocusedInput}
                  />
                  <LabelInput
                    value={cvv}
                    label='CVV'
                    name={INPUT_NAME.CVV}
                    inputProps={{ readOnly: true }}
                    containerStyle={styles.doubleInputs}
                    focusedInput={focusedInput}
                    setFocusedInput={setFocusedInput}
                  />
                </View>
              </View>
              {!isMobileDevice() && (
                <Button
                  onPress={handlePress}
                  label='Add'
                  buttonContainerStyle={styles.button}
                  disabled={isButtonDisabled}
                />
              )}
            </View>
          </View>
          <View style={styles.rightContainer}>
            <View>
              <NumberKeyboard value={setFocusedValue()} onChange={setNewValue} maxLength={getMaxLength()} />
              {isMobileDevice() && (
                <Button
                  onPress={handlePress}
                  label='Add'
                  buttonContainerStyle={styles.button}
                  disabled={isButtonDisabled}
                />
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: settings.colors.white,
    flex: isMobileDevice() ? undefined : 1,
  },
  title: {
    color: settings.colors.black,
    fontFamily: 'Inter-Bold',
    fontSize: isMobileDevice() ? 18 : 24,
    paddingBottom: isMobileDevice() ? 20 : 30,
    paddingTop: isMobileDevice() ? 0 : 10,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    flexDirection: isMobileDevice() ? 'column' : 'row',
    justifyContent: 'center',
  },
  leftContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    justifyContent: isMobileDevice() ? 'flex-end' : 'center',
  },
  inputContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: isMobileDevice() ? '85%' : '60%',
  },
  rightContainer: {
    alignItems: 'center',
    backgroundColor: isMobileDevice() ? settings.colors.white : settings.colors.gray2,
    flex: 1,
    justifyContent: isMobileDevice() ? 'flex-start' : 'center',
    marginBottom: isMobileDevice() ? 20 : 0,
    paddingTop: 20,
  },
  inputItemsContainer: {
    gap: 10,
    width: '100%',
  },
  doubleInputsContainer: {
    flexDirection: isMobileDevice() ? 'column' : 'row',
    gap: 10,
  },
  doubleInputs: {
    flex: 1,
  },
  logo: {
    height: isMobileDevice() ? 70 : 90,
    width: isMobileDevice() ? 180 : 200,
  },
  button: {
    marginTop: 14,
    width: isMobileDevice() ? undefined : '100%',
  },
});

export default CardAddInfo;
