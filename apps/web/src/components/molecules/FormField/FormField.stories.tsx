import type { Meta, StoryObj } from '@storybook/react-vite';

import FormField from './FormField';

const meta = {
  component: FormField,
} satisfies Meta<typeof FormField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: "email",
    label: "Correo electronico",
    placeholder: "nombre@mentorapredict.edu.ec",
  },
};

export const WithError: Story = {
  args: {
    ...Default.args,
    error: "Ingresa un correo valido.",
  },
};
