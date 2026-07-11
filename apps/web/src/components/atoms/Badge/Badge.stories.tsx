import type { Meta, StoryObj } from '@storybook/react-vite';

import Badge from "./Badge";

const meta = {
  title: "Atoms/Badge",
  component: Badge,
  args: {
    children: "Etiqueta",
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Admin",
  },
};

export const Teacher: Story = {
  args: {
    children: "Docente",
    tone: "green",
  },
};

export const Student: Story = {
  args: {
    children: "Estudiante",
    tone: "violet",
  },
};

export const Inactive: Story = {
  args: {
    children: "Inactivo",
    tone: "red",
  },
};
