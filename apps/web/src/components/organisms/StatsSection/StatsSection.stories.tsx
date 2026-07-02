import type { Meta, StoryObj } from '@storybook/react-vite';

import StatsSection from './StatsSection';

const meta = {
  component: StatsSection,
} satisfies Meta<typeof StatsSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};