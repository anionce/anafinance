import { useState } from "react";

/**
 * Local edit-in-place state for a single field: a raw text input synced from
 * `value` when editing starts, committed via `parse` on save. An invalid
 * parse (returns null) is discarded instead of calling `onSave`.
 */
export function useInlineEdit<T>(
    value: T,
    serialize: (value: T) => string,
    parse: (raw: string) => T | null,
    onSave: (value: T) => void
) {
    const [editing, setEditing] = useState(false);
    const [input, setInput] = useState(() => serialize(value));

    function start() {
        setInput(serialize(value));
        setEditing(true);
    }

    function save() {
        const parsed = parse(input);
        if (parsed !== null) onSave(parsed);
        setEditing(false);
    }

    return { editing, input, setInput, start, save };
}

export function parseNonEmptyNumber(raw: string): number | null {
    const parsed = Number(raw);
    return isNaN(parsed) ? null : parsed;
}

export function parseNonEmptyText(raw: string): string | null {
    const trimmed = raw.trim();
    return trimmed ? trimmed : null;
}
