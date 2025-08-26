import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import settings from '../../settings';
import { getKeyboardSizeButton } from '../helper';

export type Props = {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
};

const keyboardButtons = [
  {
    items: [
      {
        label: 1,
        value: 1,
      },
      {
        label: 2,
        value: 2,
      },
      {
        label: 3,
        value: 3,
      },
    ],
  },
  {
    items: [
      {
        label: 4,
        value: 4,
      },
      {
        label: 5,
        value: 5,
      },
      {
        label: 6,
        value: 6,
      },
    ],
  },
  {
    items: [
      {
        label: 7,
        value: 7,
      },
      {
        label: 8,
        value: 8,
      },
      {
        label: 9,
        value: 9,
      },
    ],
  },
  {
    items: [
      {
        icon: <Feather name='delete' color={settings.colors.gray} size={36} />,
        label: '',
        value: 'del',
      },
      {
        label: 0,
        value: 0,
      },
      {
        label: null,
        value: null,
      },
    ],
  },
];

const NumberKeyboard: React.FC<Props> = ({ value, onChange, maxLength = 100 }) => {
  const changeValue = (val: string | number) => {
    const localValue = val.toString();

    if (localValue === 'del') {
      onChange(value.substr(0, value.length - 1));
      return;
    }
    if (maxLength > value.length) {
      onChange(value + localValue);
    }
  };

  return (
    <View style={styles.container}>
      {keyboardButtons.map((row, index) => (
        <View style={styles.row} key={index}>
          {row.items.map(button => (
            <View key={button.value} style={styles.containerButton}>
              {button.value !== null && (
                <TouchableOpacity onPress={() => changeValue(button.value)} style={styles.button}>
                  {button.icon ? button.icon : <Text style={styles.buttonText}>{button.label}</Text>}
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: settings.colors.gray2,
    borderRadius: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: settings.padding.medium,
    width: getKeyboardSizeButton() * 3 + settings.padding.small * 6 + settings.padding.medium * 2,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  containerButton: {
    flex: 1,
    padding: settings.padding.small,
  },
  button: {
    alignItems: 'center',
    backgroundColor: settings.colors.white,
    borderRadius: 10,
    height: getKeyboardSizeButton(),
    justifyContent: 'center',
    width: getKeyboardSizeButton(),
  },
  buttonText: {
    color: settings.colors.gray,
    fontFamily: 'Inter-Bold',
    fontSize: 36,
  },
});

export default NumberKeyboard;
