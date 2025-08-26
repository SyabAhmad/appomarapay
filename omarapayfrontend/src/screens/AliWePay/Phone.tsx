import React from 'react';

import AddPhone from '../../components/AddPhone';
import Header from '../../components/Header';
import { AliWePayPhoneScreenProp } from '../../typings/types';

const AliWePayPhone: React.FC<AliWePayPhoneScreenProp> = () => {
  return (
    <>
      <Header title='Phone number' />
      <AddPhone tabletTitle='Add phone number' mobileTitle='Enter customers phone number' />
    </>
  );
};

export default AliWePayPhone;
