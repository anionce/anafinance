import { Snackbar, Alert } from "@mui/material";
import { useToastStore } from "../store/toastStore";

/** Catches errors from actions nobody displays feedback for locally — see the
 *  `unhandledrejection` listener in App.tsx that feeds this store. */
export default function GlobalToast() {
    const message = useToastStore((s) => s.message);
    const clear = useToastStore((s) => s.clear);

    return (
        <Snackbar
            open={!!message}
            autoHideDuration={5000}
            onClose={clear}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
            {message ? <Alert severity="error" onClose={clear}>{message}</Alert> : undefined}
        </Snackbar>
    );
}
