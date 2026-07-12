import { fn } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';

import ImageUploadPreview from './ImageUploadPreview';

const meta = {
  component: ImageUploadPreview,
} satisfies Meta<typeof ImageUploadPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    onChangeImage: fn(),
  },
};

export const WithImage: Story = {
  args: {
    imageUrl: "https://picsum.photos/160",
    onChangeImage: fn(),
  },
};
