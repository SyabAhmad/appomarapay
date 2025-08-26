import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

export type Props = {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
};

const NumberKeyboard: React.FC<Props> = ({ value, onChange, maxLength = 12 }) => {
  const windowWidth = Dimensions.get('window').width;
  // match other screens' maxWidth (560) and padding used elsewhere
  const containerWidth = Math.min(windowWidth, 560) - 32; // 16px padding each side
  const gap = 5;
  const buttonSize = Math.floor((containerWidth - gap * 2) / 3);
  const fontSize = Math.round(buttonSize * 0.22);

  const append = (char: string) => {
    if (value.length >= maxLength) return;
    // allow only one dot
    if (char === '.' && value.includes('.')) return;
    if (char === '.' && value.length === 0) {
      onChange('0.');
      return;
    }
    onChange(value + char);
  };

  const backspace = () => {
    onChange(value.slice(0, -1));
  };

  const rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'back'],
  ];

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { width: containerWidth }]}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={[styles.row, { marginBottom: rowIndex === rows.length - 1 ? 0 : gap }]}>
            {row.map((key) => {
              const isBack = key === 'back';
              return (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.85}
                  onPress={() => (isBack ? backspace() : append(key))}
                  style={[
                    styles.key,
                    {
                      width: buttonSize,
                      height: buttonSize,
                      borderRadius: Math.round(buttonSize * 0.18),
                    },
                  ]}
                  accessibilityLabel={isBack ? 'Backspace' : `Key ${key}`}
                >
                  <Text style={[styles.keyText, { fontSize: isBack ? Math.round(fontSize * 0.9) : fontSize }]}>
                    {isBack ? '⌫' : key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  key: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e6eef8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },
  keyText: {
    color: '#111827',
    fontWeight: '500',
    lineHeight: undefined,
  },
});

export default NumberKeyboard;
