import dayjs from 'dayjs';
import { Dimensions } from 'react-native';

import settings from '../../settings';

export const getKeyboardSizeButton = () => {
  if (isMobileDevice()) {
    const thirtyPercent = (40 * getWidth()) / 100;
    const paddingButtonsAndContainer = 6 * settings.padding.small + settings.padding.medium * 2;
    return (getWidth() - thirtyPercent - paddingButtonsAndContainer) / 3;
  }

  return getWidth() / 4 / 3;
};

export const getWidth = () => {
  return Dimensions.get('window').width;
};

export const getHeight = () => {
  return Dimensions.get('window').height;
};

export const isMobileDevice = () => {
  return getWidth() < 500;
};

export const arrayChunk = (array: any[], chunkSize: number) => {
  const data = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    data.push(array.slice(i, i + chunkSize));
  }

  return data;
};

export const renderNumberCard = (number: string): string => {
  const matches = number.match(/\d{1,4}/g);
  if (matches) {
    return matches.join(' ');
  }
  return '';
};

export const renderDateCard = (date: string): string => {
  if (date.length >= 3) {
    const month = date.slice(0, 2);
    const day = date.slice(2);

    return `${month}/${day}`;
  }
  return date;
};

export const getMediaPath = (path: string | undefined) => {
  // backend not implemented yet — return provided path or empty string
  return path ?? '';
};

export const formatTimeToAMPM = (inputDate: string) => {
  return dayjs(inputDate).format('h:mm:ss A');
};

export const formatDate = (inputDate: string) => {
  return dayjs(inputDate).format('DD.MM.YY');
};

export const formatTime = (inputDate: string) => {
  return dayjs(inputDate).format('HH:mm');
};

export const addCommasAndCurrency = (totalSum: string | number | undefined) => {
  if (!totalSum) {
    return '';
  }
  const [integerPart, decimalPart] = String(totalSum).split('.');
  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `$${formattedIntegerPart}${decimalPart ? `.${decimalPart}` : ''}`;
};

export const formatStringWithDots = (inputString: string | undefined, maxLength: number) => {
  if (!inputString) {
    return '';
  }

  if (inputString.length > maxLength) {
    return inputString.slice(0, maxLength) + '...';
  } else {
    return inputString;
  }
};

export const formatAmount = (amount: string | undefined): string => {
  if (!amount) {
    return '';
  }

  return Number(amount)
    .toFixed(8)
    .replace(/\.?0+$/, '')
    .toString();
};
