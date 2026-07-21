import { useState } from "react";
import { Card, Box, Typography, TextField, IconButton, LinearProgress } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import type { Goal } from "../../types/Goal";
import { formatCurrency } from "../../utils/currency";
import { calculatePercentage, calculateRawPercentage } from "../../services/budget";

interface Props {
    goal: Goal;
    onAmountChange: (value: number) => void;
    onTargetChange: (value: number) => void;
    onNameChange: (name: string) => void;
}

export default function FeaturedGoalCard({ goal, onAmountChange, onTargetChange, onNameChange }: Props) {
    const [editingAmount, setEditingAmount] = useState(false);
    const [amountInput, setAmountInput] = useState(String(goal.currentAmount));
    const [editingTarget, setEditingTarget] = useState(false);
    const [targetInput, setTargetInput] = useState(String(goal.targetAmount));
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(goal.name);

    const pct = calculatePercentage(goal.currentAmount, goal.targetAmount);
    const pctRaw = calculateRawPercentage(goal.currentAmount, goal.targetAmount);

    function saveAmount() {
        const parsed = Number(amountInput);
        if (!isNaN(parsed)) onAmountChange(parsed);
        setEditingAmount(false);
    }

    function saveTarget() {
        const parsed = Number(targetInput);
        if (!isNaN(parsed)) onTargetChange(parsed);
        setEditingTarget(false);
    }

    function saveName() {
        const trimmed = nameInput.trim();
        if (trimmed) onNameChange(trimmed);
        setEditingName(false);
    }

    return (
        <Card sx={{ bgcolor: "#E8E1F5", borderRadius: 1, p: 3, height: "100%", boxShadow: "none" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <SavingsOutlinedIcon />
                {editingName ? (
                    <>
                        <TextField
                            size="small"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveName()}
                            autoFocus
                        />
                        <IconButton size="small" onClick={saveName}>
                            <CheckIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </>
                ) : (
                    <>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>{goal.name}</Typography>
                        <IconButton
                            size="small"
                            onClick={() => { setNameInput(goal.name); setEditingName(true); }}
                        >
                            <EditIcon sx={{ fontSize: 16, opacity: 0.75 }} />
                        </IconButton>
                    </>
                )}
            </Box>
            <LinearProgress
                value={pct}
                variant="determinate"
                sx={{
                    my: 2, height: 8, borderRadius: 1,
                    bgcolor: "rgba(0,0,0,0.08)",
                    "& .MuiLinearProgress-bar": { bgcolor: "#9575CD" },
                }}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                {editingAmount ? (
                    <>
                        <TextField
                            size="small"
                            type="number"
                            value={amountInput}
                            onChange={(e) => setAmountInput(e.target.value)}
                            autoFocus
                            sx={{ maxWidth: 140 }}
                        />
                        <IconButton onClick={saveAmount} size="small">
                            <CheckIcon />
                        </IconButton>
                    </>
                ) : (
                    <>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {formatCurrency(goal.currentAmount)}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={() => { setAmountInput(String(goal.currentAmount)); setEditingAmount(true); }}
                        >
                            <EditIcon sx={{ fontSize: 18, opacity: 0.75 }} />
                        </IconButton>
                    </>
                )}
                {editingTarget ? (
                    <>
                        <Typography component="span" variant="body2" sx={{ opacity: 0.6 }}>/</Typography>
                        <TextField
                            size="small"
                            type="number"
                            value={targetInput}
                            onChange={(e) => setTargetInput(e.target.value)}
                            autoFocus
                            sx={{ maxWidth: 110 }}
                        />
                        <IconButton onClick={saveTarget} size="small">
                            <CheckIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </>
                ) : (
                    <Typography
                        component="span"
                        variant="body2"
                        sx={{ opacity: 0.75, cursor: "pointer", borderBottom: "1px dashed", borderColor: "text.disabled" }}
                        onClick={() => { setTargetInput(String(goal.targetAmount)); setEditingTarget(true); }}
                    >
                        / {formatCurrency(goal.targetAmount)}
                    </Typography>
                )}
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.6, mt: 0.5 }}>
                {pctRaw.toFixed(0)}%
            </Typography>
        </Card>
    );
}
