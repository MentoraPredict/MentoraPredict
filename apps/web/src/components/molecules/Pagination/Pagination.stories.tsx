import { fn } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';

import Pagination from './Pagination';

const meta = {
  component: Pagination,
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentPage: 2,
    pageSize: 10,
    totalItems: 96,
    totalPages: 10,
    itemLabel: "estudiantes",
    onPageChange: fn(),
  },
};
