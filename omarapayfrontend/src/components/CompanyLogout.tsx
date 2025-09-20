import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import settings from '../../settings';
import { addCommasAndCurrency, formatTimeToAMPM } from '../helper';
import { useAppSelector } from '../store/app/hook';
import { RootStackParamList } from '../typings/types';
import LogoutHeader from './LogoutHeader';

const CompanyLogout = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { authCashier, authCompany } = useAppSelector(state => state.auth);

  const handleLogout = () => {
    navigation.navigate('Logout', { logoutFrom: 'Company' });
  };

  const details = [
    { id: 1, title: 'Logged in User:', description: authCashier?.name },
    {
      id: 2,
      title: 'Logged in Time:',
      description: formatTimeToAMPM(authCashier ? authCashier?.authenticationDate : ''),
    },
    { id: 3, title: 'MPOS ID:', description: 'OMP-POS 001892023' }, // TODO: get from server
    { id: 4, title: 'Sales volume:', description: addCommasAndCurrency(authCashier?.totalTransactionSum) },
  ];

  return (
    <View style={styles.containerContent}>
      <LogoutHeader name={authCompany?.name} title='Workspace' onPress={handleLogout} />

      {authCashier && (
        <View style={styles.detailsContainer}>
          {details.map(detail => (
            <View key={detail.id} style={styles.detailsLine}>
              <Text style={styles.detailsTitle}>{detail.title}</Text>
              <Text style={styles.detailsDescription}>{detail.description}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  containerContent: {
    backgroundColor: settings.colors.gray1,
    borderRadius: 12,
    padding: 4,
  },
  detailsContainer: {
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  detailsLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsTitle: {
    color: settings.colors.gray,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  detailsDescription: {
    color: settings.colors.black2,
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
});

export default CompanyLogout;
