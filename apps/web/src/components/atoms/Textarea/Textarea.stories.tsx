import type { Meta, StoryObj } from '@storybook/react-vite';

import Textarea from './Textarea';

const meta = {
  component: Textarea,
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Escribe una observacion...",
  },
};

export const WithError: Story = {
  args: {
    ...Default.args,
    hasError: true,
  },
};
