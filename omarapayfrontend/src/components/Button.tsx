import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

import settings from '../../settings';

export type Props = {
  onPress: () => void;
  label: string;
  icon?: any;
  loading?: boolean;
  disabled?: boolean;
  buttonContainerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  indicatorStyle?: ViewStyle;
};

const Button: React.FC<Props> = ({
  onPress,
  loading,
  label,
  icon,
  disabled,
  buttonContainerStyle,
  labelStyle,
  indicatorStyle,
}) => {
  const style = styles(disabled, loading);
  return (
    <TouchableOpacity
      style={{
        ...style.btn,
        ...buttonContainerStyle,
      }}
      onPress={onPress}
      disabled={disabled ?? loading}>
      <Text style={{ ...style.btnText, ...labelStyle }}>{label}</Text>

      {loading ? <ActivityIndicator color={settings.colors.white} style={indicatorStyle} /> : icon}
    </TouchableOpacity>
  );
};

const styles = (disabled: boolean | undefined, loading: boolean | undefined) =>
  StyleSheet.create({
    btn: {
      alignItems: 'center',
      backgroundColor: disabled || loading ? settings.colors.gray3 : settings.colors.blue,
      borderRadius: 10,
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'center',
      padding: 15,
    },
    btnText: {
      color: settings.colors.white,
      fontFamily: 'Inter-Regular',
      fontSize: 18,
    },
  });

export default Button;
