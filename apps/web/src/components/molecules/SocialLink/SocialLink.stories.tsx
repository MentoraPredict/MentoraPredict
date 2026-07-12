import { FaGithub } from 'react-icons/fa';
import type { Meta, StoryObj } from '@storybook/react-vite';

import SocialLink from './SocialLink';

const meta = {
  component: SocialLink,
} satisfies Meta<typeof SocialLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: "https://github.com",
    icon: <FaGithub aria-hidden="true" />,
    ariaLabel: "GitHub",
  },
};
