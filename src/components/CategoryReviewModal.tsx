import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    Box,
} from "@mui/material";
import { CATEGORIES } from "../types/Category";
import type { Transaction } from "../types/Transaction";

interface Props {
    pending: Transaction[];
    onResolve: (id: string, category: string) => void;
    onFinish: () => void;
}

export default function CategoryReviewModal({ pending, onResolve, onFinish }: Props) {
    const [selected, setSelected] = useState<string | null>(null);

    if (pending.length === 0) return null;

    const current = pending[0];
    const remaining = pending.length;

    function handleNext() {
        if (!selected) return;

        onResolve(current.id, selected);
        setSelected(null);

        if (remaining === 1) {
            onFinish();
        }
    }

    return (
        <Dialog open={pending.length > 0} maxWidth="xs" fullWidth>
            <DialogTitle>
                Clasificar movimiento (quedan {remaining})
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    {current.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {current.amount.toFixed(2)} € — {current.date}
                </Typography>

                <ToggleButtonGroup
                    orientation="vertical"
                    exclusive
                    fullWidth
                    value={selected}
                    onChange={(_, value) => setSelected(value)}
                >
                    {CATEGORIES.map((cat) => (
                        <ToggleButton key={cat.value} value={cat.value} sx={{ justifyContent: "flex-start" }}>
                            {cat.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </DialogContent>
            <DialogActions>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="contained" disabled={!selected} onClick={handleNext}>
                    {remaining === 1 ? "Terminar" : "Siguiente"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}