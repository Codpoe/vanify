import { Meta, StoryObj } from '@storybook/react';
import { Button } from '.';

const meta: Meta<typeof Button> = {
  title: 'Cool/So/Hello/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;

export const Primary: StoryObj<typeof Button> = {
  args: {
    type: 'primary',
  },
};

export const Secondary: StoryObj<typeof Button> = {
  args: {
    type: 'secondary',
  },
};
