import { ReactNode } from "react";

interface SocialLinkProps {
    href: string;
    icon: ReactNode;
}

export default function SocialLink({
    href,
    icon,
}: SocialLinkProps) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="
        text-gray-500
        transition-colors
        hover:text-blue-700
      "
        >
            {icon}
        </a>
    );
}