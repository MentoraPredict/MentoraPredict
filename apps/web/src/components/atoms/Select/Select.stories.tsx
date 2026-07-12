import type { Meta, StoryObj } from '@storybook/react-vite';

import Select from './Select';

const meta = {
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <option value="student">Estudiante</option>
        <option value="teacher">Docente</option>
        <option value="admin">Administrador</option>
      </>
    ),
  },
};

export const WithError: Story = {
  args: {
    ...Default.args,
    hasError: true,
  },
};
