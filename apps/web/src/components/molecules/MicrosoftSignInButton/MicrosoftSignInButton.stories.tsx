import type { Meta, StoryObj } from '@storybook/react-vite';

import MicrosoftSignInButton from './MicrosoftSignInButton';

const meta = {
  component: MicrosoftSignInButton,
} satisfies Meta<typeof MicrosoftSignInButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
