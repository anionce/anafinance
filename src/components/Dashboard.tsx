import { useState } from "react";
import {
    Card,
    Box,
    Grid,
    Typography,
    TextField,
    IconButton,
    LinearProgress,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';

interface Props {
    spent: number;
    budget: number;
    income: number;
    colchon: number;
    colchonMeta: number;
    onColchonChange: (value: number) => void;
}

const INGRESOS_ESTIMADOS = 2300;

export default function Dashboard({ spent, budget, income, colchon, colchonMeta, onColchonChange }: Props) {
    const [editingColchon, setEditingColchon] = useState(false);
    const [colchonInput, setColchonInput] = useState(String(colchon));

    const remaining = budget - spent;
    const overBudget = remaining < 0;
    const presupuestoPct = Math.min((spent / budget) * 100, 100);
    const colchonPct = Math.min((colchon / colchonMeta) * 100, 100);
    const ingresosPct = Math.min((income / INGRESOS_ESTIMADOS) * 100, 100);

    let statusEmoji = "🎉";
    let statusText = "Vas genial este mes";
    let statusColor = "#B8E6C9";
    if (overBudget) {
        statusEmoji = "😬";
        statusText = "Te has pasado del presupuesto";
        statusColor = "#FFC9C9";
    } else if (presupuestoPct > 75) {
        statusEmoji = "😅";
        statusText = "Vas ajustada este mes";
        statusColor = "#FFE3B8";
    } else if (presupuestoPct > 40) {
        statusEmoji = "🙂";
        statusText = "Vas bien este mes";
        statusColor = "#D6E8FF";
    }

    function handleSaveColchon() {
        const parsed = Number(colchonInput);
        if (!isNaN(parsed)) {
            onColchonChange(parsed);
        }
        setEditingColchon(false);
    }

    return (
        <Grid container spacing={3}>
            {/* Estado del mes */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Card
                    sx={{
                        bgcolor: statusColor,
                        borderRadius: 1,
                        p: 3,
                        height: "100%",
                        boxShadow: "none",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <Typography sx={{ fontSize: 32 }}>{statusEmoji}</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {statusText}
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ opacity: 0.8 }}>
                        {overBudget
                            ? `Te has pasado ${Math.abs(remaining).toFixed(0)} € del presupuesto`
                            : `Te quedan ${remaining.toFixed(0)} € por gastar este mes`}
                    </Typography>
                </Card>
            </Grid>

            {/* Presupuesto */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ bgcolor: "#FFE3E3", borderRadius: 1, p: 3, height: "100%", boxShadow: "none" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <ShoppingBagOutlinedIcon />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Presupuesto</Typography>
                    </Box>
                    <LinearProgress
                        value={presupuestoPct}
                        variant="determinate"
                        sx={{
                            my: 2, height: 8, borderRadius: 1,
                            bgcolor: "rgba(0,0,0,0.08)",
                            "& .MuiLinearProgress-bar": { bgcolor: overBudget ? "#E57373" : "#F28B82" },
                        }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {spent.toFixed(0)} € <Typography component="span" variant="body2" sx={{ opacity: 0.6 }}>/ {budget} €</Typography>
                    </Typography>
                </Card>
            </Grid>

            {/* Ingresos */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ bgcolor: "#DFF5E1", borderRadius: 1, p: 3, height: "100%", boxShadow: "none" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <TrendingUpOutlinedIcon />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Ingresos del mes</Typography>
                    </Box>
                    <LinearProgress
                        value={ingresosPct}
                        variant="determinate"
                        sx={{
                            my: 2, height: 8, borderRadius: 1,
                            bgcolor: "rgba(0,0,0,0.08)",
                            "& .MuiLinearProgress-bar": { bgcolor: "#66BB6A" },
                        }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {income.toFixed(0)} € <Typography component="span" variant="body2" sx={{ opacity: 0.6 }}>/ {INGRESOS_ESTIMADOS} €</Typography>
                    </Typography>
                </Card>
            </Grid>

            {/* Colchón Revolut - editable */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ bgcolor: "#E8E1F5", borderRadius: 1, p: 3, height: "100%", boxShadow: "none" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <SavingsOutlinedIcon />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Colchón Revolut</Typography>
                    </Box>
                    <LinearProgress
                        value={colchonPct}
                        variant="determinate"
                        sx={{
                            my: 2, height: 8, borderRadius: 1,
                            bgcolor: "rgba(0,0,0,0.08)",
                            "& .MuiLinearProgress-bar": { bgcolor: "#9575CD" },
                        }}
                    />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {editingColchon ? (
                            <>
                                <TextField
                                    size="small"
                                    type="number"
                                    value={colchonInput}
                                    onChange={(e) => setColchonInput(e.target.value)}
                                    autoFocus
                                    sx={{ maxWidth: 140 }}
                                />
                                <IconButton onClick={handleSaveColchon} size="small">
                                    <CheckIcon />
                                </IconButton>
                            </>
                        ) : (
                            <>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {colchon.toLocaleString("es-ES")} € <Typography component="span" variant="body2" sx={{ opacity: 0.6 }}>/ {colchonMeta.toLocaleString("es-ES")} €</Typography>
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        setColchonInput(String(colchon));
                                        setEditingColchon(true);
                                    }}
                                >
                                    <EditIcon sx={{ fontSize: 18, opacity: 0.5 }} />
                                </IconButton>
                            </>
                        )}
                    </Box>
                </Card>
            </Grid>
        </Grid>
    );
}