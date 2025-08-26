import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity } from 'react-native';

import settings from '../../settings';
import { getMediaPath, getWidth, isMobileDevice } from '../helper';
import { useAppDispatch } from '../store/app/hook';
import { setActivePayment } from '../store/features/payments/payments-slice';
import { PAYMENTS_NAME, PaymentMethod, RootStackParamList } from '../typings/types';

export type Props = {
  item: PaymentMethod;
};

const CurrencyItem: React.FC<Props> = ({ item }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();

  const navName = (paymentMode: string) => {
    switch (paymentMode) {
      case PAYMENTS_NAME.CRYPTOCURRENCY:
        return 'CryptocurrencyList';
      case PAYMENTS_NAME.FX_TOKEN:
        return 'CryptocurrencyList';
      case PAYMENTS_NAME.VISA:
        return 'CardSelectedItem';
      case PAYMENTS_NAME.MASTERCARD:
        return 'CardSelectedItem';
      case PAYMENTS_NAME.UNION_PAY:
        return 'CardSelectedItem';
      case PAYMENTS_NAME.GCASH:
        return 'GcashAmount';
      case PAYMENTS_NAME.ALIPAY:
        return 'AliWePayScan';
      default:
        return 'alert';
    }
  };

  const handlePress = () => {
    const screenName = navName(item.name);

    if (screenName !== 'alert') {
      dispatch(setActivePayment(item));
      navigation.navigate(screenName);
    } else {
      Alert.alert('Need to implement');
    }
  };

  return (
    <TouchableOpacity style={styles.cardItem} onPress={handlePress}>
      <Image source={{ uri: getMediaPath(item.mediaPath) }} style={styles.image} />
    </TouchableOpacity>
  );
};

const cardSize = isMobileDevice() ? (getWidth() - 70) / 3 : (getWidth() - 200) / 6;
const imageSize = (isMobileDevice() ? (getWidth() - 100) / 3 : (getWidth() - 200) / 6) * 0.65;

const styles = StyleSheet.create({
  cardItem: {
    alignItems: 'center',
    backgroundColor: settings.colors.gray2,
    borderRadius: 10,
    height: cardSize,
    justifyContent: 'center',
    padding: 35,
    width: cardSize,
  },
  image: {
    height: imageSize,
    resizeMode: 'contain',
    width: imageSize,
  },
});

export default CurrencyItem;
