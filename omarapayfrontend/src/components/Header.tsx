import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type HeaderProps = {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  left?: React.ReactNode;
  showBack?: boolean;
};

const Header: React.FC<HeaderProps> = ({ title, onBack, right, left, showBack }) => {

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
          : <View style={styles.spacer} />}
      </View>
      <View style={styles.center}>
        {!!title && <Text style={styles.title}>{title}</Text>}
      </View>
      <View style={[styles.side, styles.rightSide]}>
        {right ?? <View style={styles.spacer} />}
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
  spacer: { width: 28 },
  rightSide: { alignItems: 'flex-end' },
});

export default Header;
