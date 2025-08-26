import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';

import { RATE } from '../typings/types';

export const useRate = () => {
  const widthAnimation = useRef(new Animated.Value(0)).current;
  const progress = widthAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const startProgress = useCallback((width: Animated.Value) => {
    width.setValue(0);
    Animated.timing(width, {
      toValue: 1,
      duration: RATE.DURATION,
      useNativeDriver: false,
    }).start();
  }, []);

  const stopProgress = useCallback(() => {
    widthAnimation.setValue(0);
    widthAnimation.stopAnimation();
  }, [widthAnimation]);

  return { widthAnimation, progress, startProgress, stopProgress };
};
