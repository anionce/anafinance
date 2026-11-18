import { useState } from "react";

export const useInlineEdit = <T>(
    value: T,
    serialize: (value: T) => string,
    parse: (raw: string) => T | null,
    onSave: (value: T) => void,
) => {
    const [editing, setEditing] = useState(false);
    const [input, setInput] = useState(() => serialize(value));

    const start = () => {
        setInput(serialize(value));
        setEditing(true);
    };

    const save = () => {
        const parsed = parse(input);
        if (parsed !== null) onSave(parsed);
        setEditing(false);
    };

    return { editing, input, setInput, start, save };
};

export const parseNonEmptyNumber = (raw: string): number | null => {
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? null : parsed;
};

export const parseNonEmptyText = (raw: string): string | null => {
    const trimmed = raw.trim();
    return trimmed ? trimmed : null;
};
