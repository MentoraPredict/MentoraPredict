import type { Meta, StoryObj } from '@storybook/react-vite';

import StatCard from './StatCard';

const meta = {
  component: StatCard,
} satisfies Meta<typeof StatCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "98%",
    label: "Precision del modelo",
  },
};
