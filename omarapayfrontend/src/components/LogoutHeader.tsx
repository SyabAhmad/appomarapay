import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import settings from '../../settings';

export type Props = {
  title: string;
  name: string | undefined;
  onPress: () => void;
};

export const LogoutHeader: React.FC<Props> = ({ title, name, onPress }) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.companyTitle}>{title}</Text>
        <Text style={styles.companyName}>{name}</Text>
      </View>
      <View>
        <TouchableOpacity style={{ ...styles.btn, backgroundColor: settings.colors.green }} onPress={onPress}>
          <Text style={styles.btnText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  btnText: {
    color: settings.colors.white,
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  container: {
    alignItems: 'center',
    backgroundColor: settings.colors.gray2,
    borderColor: settings.colors.gray1,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
  },
  companyTitle: {
    color: settings.colors.gray,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  companyName: {
    color: settings.colors.black,
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
});

export default LogoutHeader;
