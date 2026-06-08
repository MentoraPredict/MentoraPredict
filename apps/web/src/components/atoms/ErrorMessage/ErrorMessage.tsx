interface ErrorMessageProps {
    message?: string;
}

export default function ErrorMessage({
    message,
}: ErrorMessageProps) {
    if (!message) return null;

    return (
        <p
            role="alert"
            className="mt-1 text-sm text-red-500"
        >
            {message}
        </p>
    );
}