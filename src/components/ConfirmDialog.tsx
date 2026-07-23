import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";
import { useTranslation } from "../i18n/useTranslation";

interface Props {
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    danger?: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export default function ConfirmDialog({ open, title, message, confirmLabel, danger, onConfirm, onClose }: Props) {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t.cancel}</Button>
                <Button
                    onClick={() => { onConfirm(); onClose(); }}
                    color={danger ? "error" : "primary"}
                    variant="contained"
                >
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
