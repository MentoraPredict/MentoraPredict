import { fn } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';

import HelpDialog from './HelpDialog';

const meta = {
  component: HelpDialog,
} satisfies Meta<typeof HelpDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
  },
};
