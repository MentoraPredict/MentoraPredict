import type { Meta, StoryObj } from '@storybook/react-vite';

import NavItem from './NavItem';

const meta = {
  component: NavItem,
} satisfies Meta<typeof NavItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    "label": "label",
    "href": "https://example.com"
  },
};