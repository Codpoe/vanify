import React from 'react';
import { Tag } from '../Tag';
import './index.less';

export interface ButtonProps {
  /**
   * Button type
   * @default 'primary'
   */
  type?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ type = 'primary' }) => {
  return (
    <button className="btn">
      Hello Button {type}
      <Tag />
    </button>
  );
};

export default Button;
