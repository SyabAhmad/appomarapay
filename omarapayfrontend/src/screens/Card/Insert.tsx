import React from 'react';
import { StyleSheet, View } from 'react-native';

import settings from '../../../settings';
import Header from '../../components/Header';
import InfoModule from '../../components/InfoModule';
import Nav from '../../components/Nav';
import { getWidth, isMobileDevice } from '../../helper';
import { CardInsertScreenProp } from '../../typings/types';

const CardInsert: React.FC<CardInsertScreenProp> = ({ navigation }) => {
  const isError = false; // switch to true to see error flow

  const handlePress = () => {
    navigation.navigate('CardAddInfo');
  };

  return (
    <>
      <Header title='Add credit card' />

      <View style={styles.container}>
        <Nav title='Add credit card' containerStyle={styles.navContainer} />

        <InfoModule
          title='Insert or swipe your credit card'
          subtitle='Your payment is successful'
          blueBtnLabel='Add card manualy'
          onPressBlueBtn={handlePress}
          titleStyle={styles.title}
          containerStyle={styles.infoContainer}
          isError={isError}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: settings.colors.white,
    flex: 1,
  },
  navContainer: {
    paddingTop: isMobileDevice() ? 50 : 20,
  },
  infoContainer: {
    alignSelf: 'center',
    marginVertical: isMobileDevice() ? 30 : 40,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: isMobileDevice() ? 26 : 30,
    width: isMobileDevice() ? getWidth() * 0.6 : '140%',
  },
});

export default CardInsert;
