import { FiZap } from 'react-icons/fi';
import type { Meta, StoryObj } from '@storybook/react-vite';

import FeatureCard from './FeatureCard';

const meta = {
  component: FeatureCard,
} satisfies Meta<typeof FeatureCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <FiZap aria-hidden="true" />,
    title: "Analitica predictiva",
    description: "Identifica a tiempo a los estudiantes en riesgo academico.",
  },
};
