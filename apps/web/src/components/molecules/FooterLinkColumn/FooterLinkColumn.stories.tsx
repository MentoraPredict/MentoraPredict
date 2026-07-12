import type { Meta, StoryObj } from '@storybook/react-vite';

import FooterLinkColumn from './FooterLinkColumn';

const meta = {
  component: FooterLinkColumn,
  decorators: [
    (Story) => (
      <div className="bg-blue-900 p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FooterLinkColumn>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Producto",
    links: [
      { label: "Caracteristicas", href: "#features" },
      { label: "Precios", href: "#pricing" },
      { label: "Descargas", href: "#downloads" },
    ],
  },
};
