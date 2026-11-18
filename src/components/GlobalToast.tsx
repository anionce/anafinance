import { Snackbar, Alert } from "@mui/material";
import { useToastStore } from "../store/toastStore";

export const GlobalToast = () => {
    const message = useToastStore((s) => s.message);
    const clear = useToastStore((s) => s.clear);

    return (
        <Snackbar open={!!message} autoHideDuration={5000} onClose={clear} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
            {message ? (
                <Alert severity="error" onClose={clear}>
                    {message}
                </Alert>
            ) : undefined}
        </Snackbar>
    );
};
