import type { Meta, StoryObj } from '@storybook/react-vite';

import FooterBrand from './FooterBrand';

const meta = {
  component: FooterBrand,
  decorators: [
    (Story) => (
      <div className="bg-blue-900 p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FooterBrand>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
