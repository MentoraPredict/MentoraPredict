import { FiTrendingUp } from 'react-icons/fi';
import type { Meta, StoryObj } from '@storybook/react-vite';

import HeroMetricBadge from './HeroMetricBadge';

const meta = {
  component: HeroMetricBadge,
} satisfies Meta<typeof HeroMetricBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <FiTrendingUp aria-hidden="true" />,
    label: "Estudiantes activos",
    value: "1,240",
  },
};
