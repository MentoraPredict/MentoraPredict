import type { Meta, StoryObj } from '@storybook/react-vite';

import UserAvatar from './UserAvatar';

const meta = {
  component: UserAvatar,
} satisfies Meta<typeof UserAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Initials: Story = {
  args: {
    firstName: "Ada",
    lastName: "Lovelace",
  },
};

export const WithImage: Story = {
  args: {
    imageUrl: "https://i.pravatar.cc/80",
    firstName: "Ada",
    lastName: "Lovelace",
  },
};
