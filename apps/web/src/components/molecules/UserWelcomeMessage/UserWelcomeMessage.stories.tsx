import type { Meta, StoryObj } from '@storybook/react-vite';

import UserWelcomeMessage from './UserWelcomeMessage';

const meta = {
  component: UserWelcomeMessage,
} satisfies Meta<typeof UserWelcomeMessage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    firstName: "Ada",
    lastName: "Lovelace",
  },
};

export const WithoutName: Story = {
  args: {},
};
