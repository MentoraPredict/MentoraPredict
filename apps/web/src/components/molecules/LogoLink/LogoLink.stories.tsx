import type { Meta, StoryObj } from '@storybook/react-vite';

import LogoLink from './LogoLink';

const meta = {
  component: LogoLink,
} satisfies Meta<typeof LogoLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Light: Story = {
  args: {
    variant: "light",
  },
  decorators: [
    (Story) => (
      <div className="bg-blue-900 p-8">
        <Story />
      </div>
    ),
  ],
};
