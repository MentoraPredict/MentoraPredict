interface NavItemProps {
    label: string;
    href: string;
}

export default function NavItem({
    label,
    href,
}: NavItemProps) {
    return (
        <a
            href={href}
            className="
        text-sm
        font-medium
        text-gray-600
        transition-colors
        hover:text-blue-700
      "
        >
            {label}
        </a>
    );
}