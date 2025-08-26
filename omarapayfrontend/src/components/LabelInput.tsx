import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

import settings from '../../settings';
import { INPUT_NAME } from '../typings/types';
import AppInput from './AppInput';

export type Props = {
  value: string;
  label: string;
  dynamicLabel?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  inputProps?: any;
  focusedInput?: string;
  setFocusedInput?: (name: INPUT_NAME) => void;
  name?: INPUT_NAME;
  disabled?: boolean;
};
export const LabelInput: React.FC<Props> = ({
  value,
  containerStyle,
  labelStyle,
  inputStyle,
  label,
  dynamicLabel,
  inputProps,
  focusedInput,
  setFocusedInput,
  name,
  disabled = false,
}) => {
  const isActive = value.length > 0 && !disabled;
  const handleFocused = () => {
    if (setFocusedInput && name) {
      setFocusedInput(name);
    }
  };

  return (
    <View style={{ ...containerStyle }}>
      <Text style={{ ...styles.label, ...labelStyle }}>
        {label}
        {dynamicLabel && ` ${dynamicLabel}:`}
      </Text>
      <TouchableOpacity onPress={handleFocused} disabled={!focusedInput}>
        <AppInput
          value={value}
          readOnly={true}
          {...{
            ...styles.input,
            borderColor:
              focusedInput && focusedInput === name
                ? settings.colors.blue
                : isActive
                ? settings.colors.blue300
                : settings.colors.gray3,
          }}
          {...inputStyle}
          {...inputProps}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  input: {
    color: settings.colors.gray500,
    fontFamily: 'Inter-Regular',
    fontSize: 18,
  },
});

export default LabelInput;
