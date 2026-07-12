import { fn } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';

import Modal from './Modal';

const meta = {
  component: Modal,
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
    ariaLabel: "Ejemplo de dialogo",
    children: "Contenido del modal",
  },
};
