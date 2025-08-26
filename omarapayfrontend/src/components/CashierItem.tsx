import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import settings from '../../settings';
import { getWidth, isMobileDevice } from '../helper';
import { CashierListItem, RootStackParamList } from '../typings/types';

export type Props = {
  item: CashierListItem;
  index: number;
};

const CashierItem: React.FC<Props> = ({ item, index }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <TouchableOpacity style={styles.cardItem} onPress={() => navigation.navigate('CashierLogin', { id: item.id })}>
      <Text style={styles.cardTitle}>Cashier {index + 1}</Text>
      <Text style={styles.cardDescription}>{item.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardItem: {
    backgroundColor: settings.colors.gray2,
    borderRadius: 10,
    gap: 6,
    paddingHorizontal: isMobileDevice() ? 16 : 35,
    paddingVertical: 24,
    width: isMobileDevice() ? (getWidth() - 60) / 2 : (getWidth() - 140) / 3,
  },
  cardTitle: {
    color: settings.colors.gray,
    fontFamily: 'Inter-Regular',
    fontSize: isMobileDevice() ? 16 : 18,
    textAlign: 'center',
  },
  cardDescription: {
    color: settings.colors.gray100,
    fontFamily: 'Inter-Medium',
    fontSize: isMobileDevice() ? 18 : 20,
    textAlign: 'center',
  },
});

export default CashierItem;
