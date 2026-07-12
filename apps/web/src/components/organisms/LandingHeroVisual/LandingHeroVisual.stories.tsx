import type { Meta, StoryObj } from '@storybook/react-vite';

import LandingHeroVisual from './LandingHeroVisual';

const meta = {
  component: LandingHeroVisual,
} satisfies Meta<typeof LandingHeroVisual>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
