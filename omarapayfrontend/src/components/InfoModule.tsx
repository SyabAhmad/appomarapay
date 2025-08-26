import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

import settings from '../../settings';
import { getWidth, isMobileDevice } from '../helper';
import Button from './Button';

export type Props = {
  title: string;
  subtitle: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  blueBtnLabel?: string;
  lightBlueBtnLabel?: string;
  onPressBlueBtn?: () => void;
  onPressLightBlueBtn?: () => void;
  isError?: boolean | undefined;
  loading?: boolean | undefined;
};

const InfoModule: React.FC<Props> = ({
  title,
  subtitle,
  containerStyle,
  titleStyle,
  blueBtnLabel,
  lightBlueBtnLabel,
  onPressBlueBtn,
  onPressLightBlueBtn,
  isError,
  loading,
}) => {
  const style = styles(Boolean(isError));

  return (
    <View style={{ ...style.container, ...containerStyle }}>
      <View style={style.titleContainer}>
        <Text style={{ ...style.title, ...titleStyle }}>{title}</Text>
        <Text style={style.subtitle}>{subtitle}</Text>
      </View>

      {blueBtnLabel && onPressBlueBtn && (
        <Button
          onPress={onPressBlueBtn}
          label={blueBtnLabel}
          labelStyle={style.button}
          buttonContainerStyle={style.verifyBtnContainer}
          loading={loading}
        />
      )}
      {lightBlueBtnLabel && onPressLightBlueBtn && (
        <Button
          onPress={onPressLightBlueBtn}
          label={lightBlueBtnLabel}
          labelStyle={{ ...style.button, color: settings.colors.blue }}
          buttonContainerStyle={style.newBtnContainer}
        />
      )}
    </View>
  );
};

const styles = (isError: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: isError ? settings.colors.lightRed : settings.colors.gray1,
      borderColor: isError ? settings.colors.red200 : undefined,
      borderRadius: 12,
      borderWidth: isError ? 1 : 0,
      height: isMobileDevice() ? 220 : 395,
      justifyContent: 'center',
      paddingHorizontal: isMobileDevice() ? 40 : 110,
      width: isMobileDevice() ? undefined : getWidth() * 0.45,
    },
    titleContainer: {
      alignItems: 'center',
    },
    title: {
      color: settings.colors.black,
      fontFamily: 'Inter-Bold',
      fontSize: isMobileDevice() ? 24 : 36,
      marginBottom: 10,
      textAlign: 'center',
    },
    subtitle: {
      color: settings.colors.gray,
      fontFamily: 'Inter-Regular',
      fontSize: isMobileDevice() ? 14 : 18,
      marginBottom: 18,
    },
    verifyBtnContainer: {
      marginBottom: 8,
      paddingHorizontal: 40,
      paddingVertical: 9,
    },
    newBtnContainer: {
      backgroundColor: settings.colors.blue200,
      paddingHorizontal: 40,
      paddingVertical: 9,
    },
    button: {
      fontFamily: 'Inter-Medium',
      fontSize: 12,
    },
  });

export default InfoModule;
