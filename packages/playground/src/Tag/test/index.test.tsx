import React from 'react';
import { render } from '@testing-library/react';
import Tag from '..';

test('render and match snapshot', () => {
  const result = render(<Tag />);
  expect(result.container).toMatchSnapshot();
});
