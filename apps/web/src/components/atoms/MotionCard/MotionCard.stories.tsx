import type { Meta, StoryObj } from '@storybook/react-vite';

import MotionCard from './MotionCard';

const meta = {
  component: MotionCard,
} satisfies Meta<typeof MotionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm",
    children: "Pasa el mouse para ver la animacion",
  },
};
