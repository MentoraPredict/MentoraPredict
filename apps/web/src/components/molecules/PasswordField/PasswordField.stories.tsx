import type { Meta, StoryObj } from '@storybook/react-vite';

import PasswordField from './PasswordField';

const meta = {
  component: PasswordField,
} satisfies Meta<typeof PasswordField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: "password",
    label: "Contrasena",
  },
};

export const WithError: Story = {
  args: {
    ...Default.args,
    error: "La contrasena debe tener al menos 8 caracteres.",
  },
};
