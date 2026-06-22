import type { Meta, StoryObj } from '@storybook/react-vite';

import HeroSection from './HeroSection';

const meta = {
  component: HeroSection,
} satisfies Meta<typeof HeroSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};