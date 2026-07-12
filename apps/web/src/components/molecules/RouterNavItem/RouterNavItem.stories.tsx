import type { Meta, StoryObj } from '@storybook/react-vite';

import RouterNavItem from './RouterNavItem';

const meta = {
  component: RouterNavItem,
} satisfies Meta<typeof RouterNavItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Cursos",
    to: "/student/courses",
  },
};
