import React from 'react';

type Props = {
  value: Date;
  mode: 'date' | 'time';
  display?: string;
  onChange?: (event: any, date?: Date) => void;
};

const DateTimePickerWeb: React.FC<Props> = ({ value, mode, onChange }) => {
  // Minimal stub for web to unblock bundling.
  return null;
};

export default DateTimePickerWeb;


