import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import settings from '../../settings';
import { isMobileDevice } from '../helper';
import { RootStackParamList } from '../typings/types';

type HeaderProps = {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  left?: React.ReactNode;
  showBack?: boolean;
};

const Header: React.FC<HeaderProps> = ({ title, onBack, right, left, showBack }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.root}>
      <View style={styles.side}>
        {left
          ? left
          : showBack
          ? (
              <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel="Go back">
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>
            )
          : <View style={{ width: 28 }} />}
      </View>
      <View style={styles.center}>
        {!!title && <Text style={styles.title}>{title}</Text>}
      </View>
      <View style={[styles.side, { alignItems: 'flex-end' }]}>
        {right ?? <View style={{ width: 28 }} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#007DFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: { width: 80, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center' },
  title: { color: 'white', fontSize: 18, fontWeight: '700' },
  backArrow: { color: 'white', fontSize: 22, fontWeight: '700' },
});

export default Header;
