import { useState } from "react";

export const useOnOpen = (open: boolean, onOpen: () => void) => {
    const [wasOpen, setWasOpen] = useState(false);
    if (open !== wasOpen) {
        setWasOpen(open);
        if (open) onOpen();
    }
};
