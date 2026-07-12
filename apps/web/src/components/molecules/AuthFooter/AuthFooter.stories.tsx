import type { Meta, StoryObj } from '@storybook/react-vite';

import AuthFooter from './AuthFooter';

const meta = {
  component: AuthFooter,
} satisfies Meta<typeof AuthFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
