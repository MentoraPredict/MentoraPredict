import { fn } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';

import SelectedItemChip from './SelectedItemChip';

const meta = {
  component: SelectedItemChip,
} satisfies Meta<typeof SelectedItemChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Matematicas",
    onRemove: fn(),
  },
};

export const WithoutRemove: Story = {
  args: {
    label: "Matematicas",
  },
};
