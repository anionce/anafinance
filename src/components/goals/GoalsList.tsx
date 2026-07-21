import { useState } from "react";
import {
    Box,
    Card,
    Typography,
    LinearProgress,
    IconButton,
    TextField,
    Button,
    Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import type { Goal } from "../../types/Goal";
import { formatCurrency } from "../../utils/currency";
import { calculatePercentage, calculateRawPercentage } from "../../services/budget";
import { useTranslation } from "../../i18n/useTranslation";

interface Props {
    goals: Goal[];
    onAdd: (goal: Omit<Goal, "id">) => void;
    onUpdateAmount: (id: string, currentAmount: number) => void;
    onUpdateName: (id: string, name: string) => void;
    onUpdateTarget: (id: string, targetAmount: number) => void;
    onRemove: (id: string) => void;
}

export default function GoalsList({ goals, onAdd, onUpdateAmount, onUpdateName, onUpdateTarget, onRemove }: Props) {
    const { t } = useTranslation();
    const [adding, setAdding] = useState(false);
    const [name, setName] = useState("");
    const [target, setTarget] = useState("");

    function handleAdd() {
        const parsedTarget = Number(target);
        if (!name.trim() || isNaN(parsedTarget)) return;
        onAdd({ name: name.trim(), targetAmount: parsedTarget, currentAmount: 0 });
        setName("");
        setTarget("");
        setAdding(false);
    }

    return (
        <Card sx={{ borderRadius: 1, p: 3, boxShadow: "none" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FlagOutlinedIcon />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{t.savingsGoalsTitle}</Typography>
                </Box>
                <IconButton size="small" onClick={() => setAdding((v) => !v)}>
                    <AddIcon />
                </IconButton>
            </Box>

            {adding && (
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <TextField size="small" label={t.goalLabel} value={name} onChange={(e) => setName(e.target.value)} />
                    <TextField size="small" label={t.targetLabel} type="number" value={target} onChange={(e) => setTarget(e.target.value)} sx={{ maxWidth: 120 }} />
                    <Button variant="contained" size="small" onClick={handleAdd}>{t.add}</Button>
                </Stack>
            )}

            {goals.length === 0 && !adding && (
                <Typography color="text.secondary">{t.noGoalsYet}</Typography>
            )}

            {goals.map((goal) => (
                <GoalRow
                    key={goal.id}
                    goal={goal}
                    onUpdateAmount={onUpdateAmount}
                    onUpdateName={onUpdateName}
                    onUpdateTarget={onUpdateTarget}
                    onRemove={onRemove}
                />
            ))}
        </Card>
    );
}

function GoalRow({ goal, onUpdateAmount, onUpdateName, onUpdateTarget, onRemove }: {
    goal: Goal;
    onUpdateAmount: (id: string, currentAmount: number) => void;
    onUpdateName: (id: string, name: string) => void;
    onUpdateTarget: (id: string, targetAmount: number) => void;
    onRemove: (id: string) => void;
}) {
    const { t } = useTranslation();
    const [editingAmount, setEditingAmount] = useState(false);
    const [amountInput, setAmountInput] = useState(String(goal.currentAmount));
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(goal.name);
    const [editingTarget, setEditingTarget] = useState(false);
    const [targetInput, setTargetInput] = useState(String(goal.targetAmount));

    const pct = calculatePercentage(goal.currentAmount, goal.targetAmount);
    const pctRaw = calculateRawPercentage(goal.currentAmount, goal.targetAmount);

    function saveAmount() {
        const parsed = Number(amountInput);
        if (!isNaN(parsed)) onUpdateAmount(goal.id, parsed);
        setEditingAmount(false);
    }

    function saveName() {
        const trimmed = nameInput.trim();
        if (trimmed) onUpdateName(goal.id, trimmed);
        setEditingName(false);
    }

    function saveTarget() {
        const parsed = Number(targetInput);
        if (!isNaN(parsed)) onUpdateTarget(goal.id, parsed);
        setEditingTarget(false);
    }

    return (
        <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                {editingName ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>{goal.name}</Typography>
                        <IconButton size="small" onClick={() => { setNameInput(goal.name); setEditingName(true); }}>
                            <EditIcon sx={{ fontSize: 16, opacity: 0.75 }} />
                        </IconButton>
                    </Box>
                )}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {editingAmount ? (
                        <TextField
                            size="small"
                            type="number"
                            value={amountInput}
                            onChange={(e) => setAmountInput(e.target.value)}
                            onBlur={saveAmount}
                            onKeyDown={(e) => e.key === "Enter" && saveAmount()}
                            autoFocus
                            sx={{ maxWidth: 110 }}
                        />
                    ) : (
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, cursor: "pointer", borderBottom: "1px dashed", borderColor: "text.disabled" }}
                            onClick={() => { setAmountInput(String(goal.currentAmount)); setEditingAmount(true); }}
                        >
                            {formatCurrency(goal.currentAmount)}
                        </Typography>
                    )}
                    <Typography variant="h6" color="text.secondary">/</Typography>
                    {editingTarget ? (
                        <TextField
                            size="small"
                            type="number"
                            value={targetInput}
                            onChange={(e) => setTargetInput(e.target.value)}
                            onBlur={saveTarget}
                            onKeyDown={(e) => e.key === "Enter" && saveTarget()}
                            autoFocus
                            sx={{ maxWidth: 110 }}
                        />
                    ) : (
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{ cursor: "pointer", borderBottom: "1px dashed", borderColor: "text.disabled" }}
                            onClick={() => { setTargetInput(String(goal.targetAmount)); setEditingTarget(true); }}
                        >
                            {formatCurrency(goal.targetAmount)}
                        </Typography>
                    )}
                    <IconButton size="small" onClick={() => onRemove(goal.id)}>
                        <DeleteOutlineIcon fontSize="small" sx={{ opacity: 0.75 }} />
                    </IconButton>
                </Box>
            </Box>
            <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                    height: 10, borderRadius: 5, mt: 1,
                    bgcolor: "rgba(0,0,0,0.08)",
                    "& .MuiLinearProgress-bar": { bgcolor: "#9575CD" },
                }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {t.percentAchieved(pctRaw.toFixed(0))}
            </Typography>
        </Box>
    );
}
