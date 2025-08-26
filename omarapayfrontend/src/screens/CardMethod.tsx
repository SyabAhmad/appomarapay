import React from 'react';
import CardDetails from './CardDetails';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  CardMethod: undefined;
  CardNetworkSelection: undefined;
  CardDetails: { networkId: string; networkName: string } | undefined;
  PaymentMethod: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'CardMethod'>;

const CardMethod: React.FC<Props> = (props) => {
  // Render the card-entry UI directly and let CardDetails detect the card brand.
  // This avoids a separate "choose network" step.
  return <CardDetails {...(props as any)} />;
};

export default CardMethod;