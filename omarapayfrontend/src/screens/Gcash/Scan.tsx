import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import settings from '../../../settings';
import Header from '../../components/Header';
import LabelInput from '../../components/LabelInput';
import Nav from '../../components/Nav';
import { getWidth, isMobileDevice } from '../../helper';
import { useAppDispatch, useAppSelector } from '../../store/app/hook';
import { clearError } from '../../store/features/transactions/transactions-slice';
import { GcashScanScreenProp } from '../../typings/types';

const inputValue = 'BC235235eqrwersdfsdgsdgsdg'; // TODO: mockData

const GcashScan: React.FC<GcashScanScreenProp> = ({ navigation }) => {
  const { error } = useAppSelector(state => state.transactions);
  const dispatch = useAppDispatch();

  useFocusEffect(
    useCallback(() => {
      return () => dispatch(clearError());
    }, [dispatch]),
  );
  const handlePress = () => {
    navigation.reset({ index: 0, routes: [{ name: 'GcashSuccessful' }] });
  };

  return (
    <>
      <Header title='QR code' />

      <View style={styles.container}>
        <ScrollView>
          <Nav title={error || 'Scan QR Code'} isIncorrect={error} />

          <View style={styles.scanContainer}>
            <View style={styles.codeContainer}>
              <TouchableOpacity onPress={handlePress}>
                <Image source={require('../../../assets/vaadin_qrcode.png')} style={styles.code} resizeMode='contain' />
              </TouchableOpacity>
              <Text style={styles.codeTitle}>Or use the payment reference number</Text>
            </View>
            <LabelInput
              value={inputValue}
              label={isMobileDevice() ? 'Only send Bitcoin in this Address' : 'Payment number'}
              inputProps={{ readOnly: true }}
              disabled={true}
            />
          </View>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: settings.colors.white,
    flex: 1,
  },
  scanContainer: {
    alignSelf: 'center',
    backgroundColor: isMobileDevice() ? settings.colors.white : settings.colors.gray1,
    borderRadius: 12,
    gap: 16,
    height: isMobileDevice() ? undefined : 395,
    justifyContent: 'center',
    margin: 40,
    paddingHorizontal: 20,
    width: isMobileDevice() ? '100%' : getWidth() * 0.45,
  },
  codeContainer: {
    alignItems: 'center',
    gap: 28,
    paddingHorizontal: 20,
  },
  code: {
    height: 171,
    width: 171,
  },
  codeTitle: {
    color: settings.colors.gray,
    fontFamily: 'Inter-Medium',
    fontSize: isMobileDevice() ? 16 : 20,
    textAlign: 'center',
  },
});

export default GcashScan;
