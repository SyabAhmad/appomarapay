import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import settings from '../../settings';
import { isMobileDevice } from '../helper';
import { useAppSelector } from '../store/app/hook';
import { RootStackParamList } from '../typings/types';
import Button from './Button';
import LogoutHeader from './LogoutHeader';

type Props = {
  showBtn?: boolean;
};
const CashierLogout: React.FC<Props> = ({ showBtn = true }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { authCashier } = useAppSelector(state => state.auth);

  const handleLogout = () => {
    navigation.navigate('Logout', { logoutFrom: 'Cashier' });
  };

  const handleTransaction = () => {
    navigation.navigate('TransactionHistory');
  };

  return (
    <View style={styles.containerContent}>
      <LogoutHeader name={authCashier?.name} title='Employee' onPress={handleLogout} />

      {authCashier && showBtn && (
        <View style={styles.containerButtonViewHistory}>
          <Button
            label='Transaction history'
            onPress={handleTransaction}
            labelStyle={styles.transactionHistoryLabel}
            buttonContainerStyle={styles.transactionHistoryContainer}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  containerContent: {
    backgroundColor: settings.colors.gray1,
    borderRadius: 12,
    padding: isMobileDevice() ? 0 : 4,
  },
  containerButtonViewHistory: {
    paddingTop: 8,
  },
  transactionHistoryLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  transactionHistoryContainer: {
    padding: 6,
  },
});

export default CashierLogout;
