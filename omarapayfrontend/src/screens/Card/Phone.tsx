import React from 'react';

import AddPhone from '../../components/AddPhone';
import Header from '../../components/Header';
import { CardPhoneScreenProp } from '../../typings/types';

const CardPhone: React.FC<CardPhoneScreenProp> = () => {
  return (
    <>
      <Header title='Phone number' />
      <AddPhone tabletTitle='E-receipt' mobileTitle='Add your phone number' showAmount />
    </>
  );
};

export default CardPhone;
