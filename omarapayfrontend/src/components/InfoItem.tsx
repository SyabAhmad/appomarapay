import React from 'react';
import { StyleSheet, View } from 'react-native';

import LineDivider from './LineDivider.';
import { AmountItem, AmountProps } from './TotalAmount';

const InfoItem: React.FC<AmountProps> = ({ items }) => {
  return (
    <View style={styles.container}>
      <LineDivider />

      <View style={styles.amountContainer}>
        {items.map((item, index) => (
          <AmountItem key={index} {...item} />
        ))}
      </View>

      <LineDivider />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  amountContainer: {
    gap: 10,
    marginVertical: 16,
    paddingHorizontal: 10,
  },
});

export default InfoItem;
