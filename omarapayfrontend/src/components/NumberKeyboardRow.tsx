import React, { Fragment } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import settings from '../../settings';
import Button from './Button';

export type Props = {
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  containerStyle: ViewStyle;
  loading?: boolean;
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
      {
        label: 4,
        value: 4,
      },
      {
        label: 5,
        value: 5,
      },
    ],
  },
  {
    items: [
      {
        label: 6,
        value: 6,
      },
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
      {
        label: 0,
        value: 0,
      },
    ],
  },
];

const NumberKeyboardRow: React.FC<Props> = ({ value, onChange, onConfirm, containerStyle, loading }) => {
  const changeValue = (val: string | number) => {
    const localValue = val.toString();

    if (localValue === 'del') {
      onChange(value.substr(0, value.length - 1));
      return;
    }

    onChange(value + localValue);
  };

  return (
    <Fragment>
      <View style={{ ...containerStyle }}>
        {keyboardButtons.map((row, index) => (
          <View style={styles.rowContainer} key={index}>
            {row.items.map(button => (
              <TouchableOpacity key={button.value} onPress={() => changeValue(button.value)} style={styles.button}>
                <Text style={styles.text}>{button.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
      <View style={styles.buttonsContainer}>
        <Button
          onPress={() => onConfirm()}
          label='Confirm'
          buttonContainerStyle={styles.buttonContainer}
          loading={loading}
          disabled={value.length < 1}
        />
        <Button
          onPress={() => changeValue('del')}
          label='Delete'
          buttonContainerStyle={{ ...styles.buttonContainer, ...styles.buttonContainerRed }}
          labelStyle={styles.buttonRed}
        />
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  button: {
    alignItems: 'center',
    backgroundColor: settings.colors.white,
    borderRadius: 10,
    height: 92,
    justifyContent: 'center',
    width: 92,
  },
  text: {
    color: settings.colors.gray,
    fontFamily: 'Inter-Bold',
    fontSize: 30,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  buttonContainer: {
    borderRadius: 8,
    flex: 1,
  },
  buttonContainerRed: {
    backgroundColor: settings.colors.red100,
  },
  buttonRed: {
    color: settings.colors.red200,
  },
});

export default NumberKeyboardRow;
