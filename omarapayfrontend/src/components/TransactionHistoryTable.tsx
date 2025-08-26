import { useFocusEffect } from '@react-navigation/native';
import { PayloadAction, unwrapResult } from '@reduxjs/toolkit';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, ListRenderItem, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import settings from '../../settings';
import { getWidth, isMobileDevice } from '../helper';
import { useAppDispatch, useAppSelector } from '../store/app/hook';
import { clearAllTransactions, clearError } from '../store/features/transactions/transactions-slice';
import { fetchAllTransactions } from '../store/features/transactions/transactionsThunk';
import TableRow from './TableRow';

export type TableItem = {
  transactionId: number;
  parentPaymentMethodName: string;
  paymentMethodName: string;
  createdAt: string;
  amount: string;
};
interface TableHeaderProps {
  name: string;
  sortName: string;
}

interface OrderProps {
  name: string;
  direction: string | null;
  field: string;
}

const tableHeader: TableHeaderProps[] = [
  { name: 'Transaction id', sortName: 'transactionId' },
  { name: 'Payment method', sortName: 'paymentMethodName' },
  { name: 'Subpayment method', sortName: 'parentPaymentMethodName' },
  { name: 'Date', sortName: 'createdAtDate' },
  { name: 'Time', sortName: 'createdAtTime' },
  { name: 'Amount', sortName: 'amount' },
];
const EmptyComponent = () => {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyMessage}>There is nothing to display.</Text>
    </View>
  );
};
const renderItem: ListRenderItem<TableItem> = ({ item, index }) => <TableRow item={item} index={index} />;

const TransactionHistoryTable = () => {
  const [params, setParams] = useState<{ pageNr: number; activeOrderColumn: null | OrderProps }>({
    pageNr: 1,
    activeOrderColumn: null,
  });
  const [noRequest, setNoRequest] = useState(false);
  const { allTransactions, loading, error } = useAppSelector(state => state.transactions);
  const dispatch = useAppDispatch();

  useFocusEffect(
    useCallback(() => {
      const fetchHistory = async () => {
        const sortField =
          params.activeOrderColumn &&
          `${params.activeOrderColumn.direction === 'ASC' ? '' : '-'}${params.activeOrderColumn.field}`;
        try {
          const response = (await dispatch(
            fetchAllTransactions({ sort: sortField, offset: params.pageNr }),
          )) as PayloadAction<any>;
          unwrapResult(response);
          if (response.payload.data.length === 0) {
            setNoRequest(true);
          }
        } catch (err) {
          console.log(err, 'error');
        }
      };
      fetchHistory();
    }, [params, dispatch]),
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        dispatch(clearAllTransactions());
        dispatch(clearError());
      };
    }, [dispatch]),
  );

  const fetchMore = () => {
    if (!loading && !noRequest) {
      setParams(prev => ({ ...prev, pageNr: prev.pageNr + 1 }));
    }
  };

  const getDirection = (column: string) => {
    if (!params.activeOrderColumn) {
      return 'ASC';
    }
    if (params.activeOrderColumn.name === column && params.activeOrderColumn.direction === 'ASC') {
      return 'DESC';
    }

    if (params.activeOrderColumn.name === column && params.activeOrderColumn.direction === 'DESC') {
      return null;
    }

    return 'ASC';
  };

  const handleOrder = (column: string) => {
    setNoRequest(false);
    const direction = getDirection(column);

    if (direction) {
      setParams({
        pageNr: 1,
        activeOrderColumn: {
          name: column,
          direction: getDirection(column),
          field: column === 'createdAtDate' || column === 'createdAtTime' ? 'createdAt' : column,
        },
      });
    } else {
      setParams({
        pageNr: 1,
        activeOrderColumn: null,
      });
    }
  };
  const formatItemName = (activeColumn: OrderProps | null, item: TableHeaderProps) => {
    switch (true) {
      case activeColumn?.name === item.sortName && activeColumn?.direction === 'ASC':
        return `${item.name} \u2193`;
      case activeColumn?.name === item.sortName && activeColumn?.direction === 'DESC':
        return `${item.name} \u2191`;
      default:
        return item.name;
    }
  };
  return (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeaderRow}>
        {tableHeader.map((item, index) => (
          <TouchableOpacity key={index} style={styles.tableHeaderCell} onPress={() => handleOrder(item.sortName)}>
            <Text style={styles.tableHeaderText}>{formatItemName(params.activeOrderColumn, item)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={allTransactions}
          keyExtractor={(item: TableItem) => `${item.transactionId}`}
          renderItem={renderItem}
          onEndReached={fetchMore}
          onEndReachedThreshold={0.25}
          ListEmptyComponent={!loading ? <EmptyComponent /> : null}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator color={settings.colors.gray3} style={styles.activityIndicator} size='large' />
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    flex: 1,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: isMobileDevice() ? 20 : 48,
  },
  tableHeaderCell: {
    paddingRight: isMobileDevice() ? 10 : 0,
    paddingVertical: isMobileDevice() ? 10 : 16,
    width: isMobileDevice() ? 120 : getWidth() / 6,
  },
  tableHeaderText: {
    color: settings.colors.blue,
    fontFamily: 'Inter-SemiBold',
    fontSize: isMobileDevice() ? 14 : 16,
  },
  activityIndicator: {
    marginVertical: 40,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  errorTitle: {
    color: settings.colors.red200,
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 200,
  },
  emptyMessage: {
    color: settings.colors.black,
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    textAlign: 'center',
  },
});

export default TransactionHistoryTable;
