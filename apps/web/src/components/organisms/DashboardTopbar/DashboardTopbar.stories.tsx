import type { Meta, StoryObj } from '@storybook/react-vite';

import DashboardTopbar from './DashboardTopbar';

const meta = {
  component: DashboardTopbar,
} satisfies Meta<typeof DashboardTopbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    "title": "title"
  },
};