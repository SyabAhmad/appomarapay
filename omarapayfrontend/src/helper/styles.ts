import { StyleSheet } from 'react-native';

import settings from '../../settings';
import { getWidth, isMobileDevice } from './index';

export const phoneStyles = StyleSheet.create({
  container: {
    backgroundColor: settings.colors.white,
    flex: 1,
  },
  navContainer: {
    paddingTop: isMobileDevice() ? 0 : 20,
  },
  amountContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 16,
    marginVertical: 30,
  },
  keyboardContainer: {
    backgroundColor: settings.colors.gray1,
    borderRadius: 12,
    padding: 38,
    paddingBottom: 28,
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
    marginBottom: 25,
    marginTop: 10,
    paddingHorizontal: (getWidth() - getWidth() * 0.77) / 2,
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
    marginTop: 16,
  },
});

export const loginStyles = StyleSheet.create({
  container: {
    backgroundColor: settings.colors.white,
    flex: 1,
    paddingTop: isMobileDevice() ? 20 : 0,
  },
  mainContainer: {
    flex: isMobileDevice() ? undefined : 1,
  },
  title: {
    color: settings.colors.black,
    fontFamily: 'Inter-Bold',
    fontSize: isMobileDevice() ? 18 : 24,
    paddingBottom: isMobileDevice() ? 10 : 30,
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
    width: isMobileDevice() ? '90%' : '60%',
  },
  rightContainer: {
    alignItems: 'center',
    backgroundColor: isMobileDevice() ? settings.colors.white : settings.colors.gray2,
    flex: 1,
    justifyContent: isMobileDevice() ? 'flex-start' : 'center',
    paddingVertical: 10,
  },
  inputItem: {
    marginBottom: 15,
    width: '100%',
  },
  logo: {
    height: isMobileDevice() ? 70 : 90,
    width: isMobileDevice() ? 180 : 200,
  },
  button: {
    width: '100%',
  },
});
