import React from 'react';
import { StyleSheet, View } from 'react-native';

import settings from '../../settings';

type Props = {
  height?: number;
};

const LineDivider: React.FC<Props> = ({ height = 1 }) => {
  return <View style={{ ...styles.divider, height }} />;
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: settings.colors.neutral,
    width: '100%',
  },
});

export default LineDivider;
