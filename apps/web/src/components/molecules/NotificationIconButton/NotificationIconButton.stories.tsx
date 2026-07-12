import { fn } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';

import NotificationIconButton from './NotificationIconButton';

const meta = {
  component: NotificationIconButton,
} satisfies Meta<typeof NotificationIconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NoUnread: Story = {
  args: {
    onClick: fn(),
  },
};

export const WithUnread: Story = {
  args: {
    count: 5,
    onClick: fn(),
  },
};

export const ManyUnread: Story = {
  args: {
    count: 150,
    onClick: fn(),
  },
};
