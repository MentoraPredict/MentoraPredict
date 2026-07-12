import type { Meta, StoryObj } from '@storybook/react-vite';

import UserRoleLabel from './UserRoleLabel';

const meta = {
  component: UserRoleLabel,
} satisfies Meta<typeof UserRoleLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Student: Story = {
  args: {
    role: "STUDENT",
  },
};

export const Teacher: Story = {
  args: {
    role: "TEACHER",
  },
};

export const Admin: Story = {
  args: {
    role: "ADMIN",
  },
};
