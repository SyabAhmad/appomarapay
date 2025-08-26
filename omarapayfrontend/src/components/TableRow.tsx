import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import settings from '../../settings';
import { formatDate, formatTime, getWidth, isMobileDevice } from '../helper';
import { TableItem } from './TransactionHistoryTable';

export type RowProps = {
  item: TableItem;
  index: number;
};

type CellProps = { children: string };

const TableCell: React.FC<CellProps> = ({ children }) => {
  const style = styles(1);
  return (
    <View style={style.cellContainer}>
      <Text style={style.cell}>{children}</Text>
    </View>
  );
};

const TableRow: React.FC<RowProps> = ({ item, index }) => {
  const style = styles(index);

  return (
    <View key={index} style={style.rowContainer}>
      <TableCell>{`${item.transactionId}`}</TableCell>
      <TableCell>{item.parentPaymentMethodName}</TableCell>
      <TableCell>{item.paymentMethodName}</TableCell>
      <TableCell>{formatDate(item.createdAt)}</TableCell>
      <TableCell>{formatTime(item.createdAt)}</TableCell>
      <TableCell>{item.amount}</TableCell>
    </View>
  );
};

const styles = (index: number) =>
  StyleSheet.create({
    rowContainer: {
      backgroundColor: index % 2 === 0 ? settings.colors.gray1 : settings.colors.white,
      flexDirection: 'row',
      paddingHorizontal: isMobileDevice() ? 20 : 48,
    },
    cellContainer: {
      paddingRight: isMobileDevice() ? 10 : 0,
      paddingVertical: isMobileDevice() ? 10 : 18,
      width: isMobileDevice() ? 120 : getWidth() / 6,
    },
    cell: {
      color: settings.colors.black,
      fontFamily: 'Inter-Regular',
      fontSize: isMobileDevice() ? 14 : 18,
    },
  });

export default memo(TableRow);
