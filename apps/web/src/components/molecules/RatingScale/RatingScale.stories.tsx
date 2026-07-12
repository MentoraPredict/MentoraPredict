import { fn } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';

import RatingScale from './RatingScale';

const meta = {
  component: RatingScale,
} satisfies Meta<typeof RatingScale>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 3,
    onChange: fn(),
  },
};
