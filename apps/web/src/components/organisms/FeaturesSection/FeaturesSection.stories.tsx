import type { Meta, StoryObj } from '@storybook/react-vite';

import FeaturesSection from './FeaturesSection';

const meta = {
  component: FeaturesSection,
} satisfies Meta<typeof FeaturesSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};