import type { Meta, StoryObj } from '@storybook/react-vite';

import FeedbackMessage from './FeedbackMessage';

const meta = {
  component: FeedbackMessage,
} satisfies Meta<typeof FeedbackMessage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};