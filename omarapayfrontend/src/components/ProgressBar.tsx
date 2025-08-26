import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import settings from '../../settings';

import AnimatedInterpolation = Animated.AnimatedInterpolation;

type Props = {
  progress: AnimatedInterpolation<string | number>;
};
const ProgressBar: React.FC<Props> = ({ progress }) => {
  return (
    <View>
      <Animated.View style={styles.container} />
      <Animated.View style={{ ...styles.progress, width: progress }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: settings.colors.blue200,
    borderRadius: 26,
    bottom: 0,
    height: 8,
    left: 0,
    position: 'absolute',
    width: '100%',
  },
  progress: {
    backgroundColor: settings.colors.blue,
    borderRadius: 26,
    bottom: 0,
    height: 8,
    left: 0,
    position: 'absolute',
  },
});

export default ProgressBar;
