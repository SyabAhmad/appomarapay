import React from 'react';
import { Image, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

import settings from '../../settings';
import { isMobileDevice } from '../helper';
import { useAppSelector } from '../store/app/hook';
import CashierLogout from './CashierLogout';
import CompanyLogout from './CompanyLogout';

export type Props = {
  title: string;
  subtitle?: string;
  isIncorrect?: boolean;
  containerStyle?: ViewStyle;
  logoStyle?: ViewStyle;
  titleStyle?: TextStyle;
};

const Nav: React.FC<Props> = ({ title, subtitle, isIncorrect, containerStyle, logoStyle, titleStyle }) => {
  const { authCashier } = useAppSelector(state => state.auth);

  return (
    <View style={{ ...styles.headerContainer, ...containerStyle }}>
      {!isMobileDevice() && (
        <View style={styles.logoutContainer}>
          <CompanyLogout />
        </View>
      )}

      <View style={{ ...styles.logoContainer, ...logoStyle }}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode='contain' />
        <Text
          style={{
            ...styles.title,
            color: isIncorrect ? settings.colors.red200 : settings.colors.black,
            ...titleStyle,
          }}>
          {title}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {!isMobileDevice() && <View style={styles.logoutContainer}>{authCashier && <CashierLogout />}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: isMobileDevice() ? 'center' : 'space-between',
    paddingHorizontal: isMobileDevice() ? 30 : 50,
    paddingTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: settings.colors.white,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    maxWidth: 500,
  },
  logo: {
    height: isMobileDevice() ? 70 : 90,
    width: isMobileDevice() ? 180 : 200,
  },
  logoutContainer: {
    width: 300,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: isMobileDevice() ? 18 : 24,
    paddingBottom: isMobileDevice() ? 10 : 0,
    textAlign: 'center',
  },
  subtitle: {
    color: settings.colors.black,
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default Nav;
