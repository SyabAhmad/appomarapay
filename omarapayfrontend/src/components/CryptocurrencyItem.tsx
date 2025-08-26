import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import settings from '../../settings';
import { getMediaPath, getWidth, isMobileDevice } from '../helper';
import { useAppDispatch } from '../store/app/hook';
import { setActiveSubPayment } from '../store/features/payments/payments-slice';
import { PaymentMethod, RootStackParamList } from '../typings/types';

export type Props = {
  item: PaymentMethod;
  isShowSymbol: boolean;
};

const CryptoCurrencyItem: React.FC<Props> = ({ item, isShowSymbol }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();

  const cryptoColor = item.color ?? settings.colors.black;

  const style = styles(isShowSymbol, cryptoColor);

  const handlePress = () => {
    dispatch(setActiveSubPayment(item));
    navigation.navigate('CryptocurrencyAmount');
  };

  return (
    <TouchableOpacity style={style.cardItem} onPress={handlePress} disabled={!item.address}>
      <Image source={{ uri: getMediaPath(item.mediaPath) }} style={style.image} />
      <Text style={style.title}>{item.name}</Text>
      {isShowSymbol ? <Text style={style.shortTitle}>{item.symbol}</Text> : null}
      {!item.address && <View style={style.mask} />}
    </TouchableOpacity>
  );
};

const cardSize = isMobileDevice() ? (getWidth() * 0.6) / 2 : (getWidth() * 0.8) / 6;
const imageSize = (isMobileDevice() ? (getWidth() * 0.6) / 2 : (getWidth() * 0.75) / 6) * 0.4;

const styles = (isShowSymbol: boolean, cryptoColor: string) =>
  StyleSheet.create({
    cardItem: {
      alignItems: 'center',
      backgroundColor: settings.colors.gray2,
      borderRadius: 10,
      height: cardSize,
      justifyContent: 'center',
      width: cardSize,
    },
    image: {
      height: imageSize,
      resizeMode: 'center',
      width: imageSize,
    },
    shortTitle: {
      color: cryptoColor,
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      marginTop: isMobileDevice() ? 0 : 4,
    },
    title: {
      color: isShowSymbol ? cryptoColor : settings.colors.gray,
      fontFamily: 'Inter-Bold',
      fontSize: isMobileDevice() ? 14 : 20,
      marginTop: isMobileDevice() ? 4 : 8,
    },
    mask: {
      backgroundColor: settings.colors.grayMask,
      borderRadius: 10,
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
  });

export default CryptoCurrencyItem;
