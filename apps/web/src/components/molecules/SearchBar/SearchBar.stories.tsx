import { fn } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';

import SearchBar from './SearchBar';

const meta = {
  component: SearchBar,
} satisfies Meta<typeof SearchBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "",
    onChange: fn(),
    onSearch: fn(),
    onClear: fn(),
  },
};
