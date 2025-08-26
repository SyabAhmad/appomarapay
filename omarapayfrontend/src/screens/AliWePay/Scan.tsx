import { useFocusEffect } from '@react-navigation/native';
import { unwrapResult } from '@reduxjs/toolkit';
import React, { useCallback } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';

import settings from '../../../settings';
import Button from '../../components/Button';
import Header from '../../components/Header';
import Nav from '../../components/Nav';
import { getMediaPath, getWidth, isMobileDevice } from '../../helper';
import { useAppDispatch, useAppSelector } from '../../store/app/hook';
import { clearError } from '../../store/features/transactions/transactions-slice';
import { sendTransaction } from '../../store/features/transactions/transactionsThunk';
import { AliWePayScanScreenProp } from '../../typings/types';

const AliWePayScan: React.FC<AliWePayScanScreenProp> = ({ navigation }) => {
  const { activeTransaction, loading, error } = useAppSelector(state => state.transactions);
  const { activePayment } = useAppSelector(state => state.payments);

  const dispatch = useAppDispatch();

  useFocusEffect(
    useCallback(() => {
      const fetchTransaction = async () => {
        try {
          if (activePayment?.id) {
            const response = await dispatch(sendTransaction({ paymentMethodsId: activePayment.id }));
            unwrapResult(response);
          } else {
            throw new Error('Error!!! ID is required!');
          }
        } catch (err) {
          console.log(err, 'error');
        }
      };
      fetchTransaction();

      return () => dispatch(clearError());
    }, [activePayment?.id, dispatch]),
  );

  const handlePress = () => {
    navigation.navigate('AliWePayConfirm');
  };

  return (
    <>
      <Header title='Scan QR code' />

      <View style={styles.container}>
        <ScrollView>
          <Nav title={error || 'Scan QR Code using your Alipay wallet'} isIncorrect={error} />

          {loading ? (
            <ActivityIndicator color={settings.colors.gray3} style={styles.activityIndicator} size='large' />
          ) : !error ? (
            <View style={styles.mainContainer}>
              <View style={styles.containerQr}>
                <View style={styles.qrImageContainer}>
                  <Image
                    source={{ uri: getMediaPath(activeTransaction?.qrCode) }}
                    style={styles.code}
                    resizeMode='contain'
                  />
                </View>

                <Button onPress={handlePress} label='Continue' />
              </View>
            </View>
          ) : null}
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
  mainContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    margin: isMobileDevice() ? 20 : 40,
  },
  containerQr: {
    backgroundColor: settings.colors.gray1,
    borderRadius: 12,
    height: isMobileDevice() ? 340 : 395,
    justifyContent: 'center',
    paddingHorizontal: isMobileDevice() ? 40 : 110,
    width: isMobileDevice() ? '100%' : getWidth() * 0.45,
  },
  qrImageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  code: {
    height: 171,
    width: 171,
  },
  activityIndicator: {
    marginTop: 200,
  },
});

export default AliWePayScan;
