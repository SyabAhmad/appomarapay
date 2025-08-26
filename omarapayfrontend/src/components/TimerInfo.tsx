import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import settings from '../../settings';
import { isMobileDevice } from '../helper';
import { useAppDispatch, useAppSelector } from '../store/app/hook';
import { clearSmsCode } from '../store/features/transactions/transactions-slice';

type Props = {
  setCodeIsExpired: (codeIsExpired: boolean) => void;
};

const TimerInfo: React.FC<Props> = ({ setCodeIsExpired }) => {
  const [seconds, setSeconds] = useState<number | null>(null);
  const { smsCode } = useAppSelector(state => state.transactions);
  const dispatch = useAppDispatch();

  useFocusEffect(
    useCallback(() => {
      const finishTime = smsCode?.expiredAt;
      const targetDateTime = dayjs(finishTime);

      const timerId = setInterval(() => {
        const differenceInSeconds = targetDateTime.diff(dayjs(), 'seconds');
        if (differenceInSeconds >= 0) {
          setSeconds(differenceInSeconds);
        } else {
          setCodeIsExpired(true);
          dispatch(clearSmsCode());
        }
      }, 500);
      return () => {
        clearInterval(timerId);
      };
    }, [dispatch, smsCode?.expiredAt, setCodeIsExpired]),
  );

  if (!seconds) {
    return null;
  }

  return (
    <Text style={styles.timerText}>
      Authorisation code is valid for - <Text style={styles.timerNumber}>{seconds}s</Text>
    </Text>
  );
};

const styles = StyleSheet.create({
  timerText: {
    color: settings.colors.gray,
    fontFamily: 'Inter-Medium',
    fontSize: isMobileDevice() ? 14 : 18,
    textAlign: 'center',
  },
  timerNumber: {
    fontFamily: 'Inter-Bold',
  },
});

export default TimerInfo;
