import type { Meta, StoryObj } from '@storybook/react-vite';

import Label from './Label';

const meta = {
  component: Label,
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};