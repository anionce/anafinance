interface Props {
    size?: number;
}

/** The "Cala" mark: a cove (arc) cradling a coin — savings resting somewhere calm. */
export default function Logo({ size = 32 }: Props) {
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                d="M48.86 46.14A22 22 0 1 1 48.86 17.86"
                stroke="#5B7F6B"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
            />
            <circle cx="43" cy="32" r="8" fill="#D97757" />
        </svg>
    );
}
