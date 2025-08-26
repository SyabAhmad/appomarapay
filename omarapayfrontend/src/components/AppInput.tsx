import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

import settings from '../../settings';

export type Props = any;

const AppInput: React.FC<Props> = props => {
  const { value, initialLength = 0, disabled = false, isError = false } = props;
  const isActive = value.length > initialLength && !disabled;

  const style = styles(isActive, isError);

  return <TextInput style={style.input} {...props} />;
};

const styles = (isActive: boolean, isError: boolean) =>
  StyleSheet.create({
    input: {
      backgroundColor: settings.colors.white,
      borderColor: isError ? settings.colors.red200 : isActive ? settings.colors.blue300 : settings.colors.gray3,
      borderRadius: 10,
      borderWidth: 1,
      color: settings.colors.gray,
      fontFamily: 'Slate-Bold',
      fontSize: 18,
      height: 60,
      justifyContent: 'center',
      padding: 15,
    },
  });

export default AppInput;
