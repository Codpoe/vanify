import React from 'react';
import { render } from '@testing-library/react';
import Button from '..';

test('render and match snapshot', () => {
  const result = render(<Button />);
  expect(result.container).toMatchSnapshot();
});
