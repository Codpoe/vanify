import React from 'react';
import { Tag } from '../Tag';

export const Button: React.FC = () => {
  return (
    <button className="btn">
      Hello Button
      <Tag />
    </button>
  );
};

export default Button;
