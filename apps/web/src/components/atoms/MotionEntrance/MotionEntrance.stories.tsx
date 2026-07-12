import type { Meta, StoryObj } from '@storybook/react-vite';

import MotionEntrance from './MotionEntrance';

const meta = {
  component: MotionEntrance,
} satisfies Meta<typeof MotionEntrance>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Page: Story = {
  args: {
    children: "Contenido que aparece al entrar a la pagina",
  },
};

export const Form: Story = {
  args: {
    children: "Contenido de formulario que aparece con un leve desplazamiento",
    variant: "form",
  },
};
