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
import { accent } from "../../theme/colors";
import { useInlineEdit, parseNonEmptyNumber, parseNonEmptyText } from "../../hooks/useInlineEdit";

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
        <Card sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FlagOutlinedIcon sx={{ color: accent.savings }} />
                    <Typography variant="h6">{t.savingsGoalsTitle}</Typography>
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
    const amountEdit = useInlineEdit(goal.currentAmount, String, parseNonEmptyNumber, (v) => onUpdateAmount(goal.id, v));
    const nameEdit = useInlineEdit(goal.name, (v) => v, parseNonEmptyText, (v) => onUpdateName(goal.id, v));
    const targetEdit = useInlineEdit(goal.targetAmount, String, parseNonEmptyNumber, (v) => onUpdateTarget(goal.id, v));

    const pct = calculatePercentage(goal.currentAmount, goal.targetAmount);
    const pctRaw = calculateRawPercentage(goal.currentAmount, goal.targetAmount);

    return (
        <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                {nameEdit.editing ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <TextField
                            size="small"
                            value={nameEdit.input}
                            onChange={(e) => nameEdit.setInput(e.target.value)}
                            onBlur={nameEdit.save}
                            onKeyDown={(e) => e.key === "Enter" && nameEdit.save()}
                            autoFocus
                        />
                        <IconButton size="small" onClick={nameEdit.save}>
                            <CheckIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Typography variant="h6" sx={{ lineHeight: 1 }}>{goal.name}</Typography>
                        <IconButton size="small" onClick={nameEdit.start}>
                            <EditIcon sx={{ fontSize: 18, opacity: 0.75 }} />
                        </IconButton>
                    </Box>
                )}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {amountEdit.editing ? (
                        <TextField
                            size="small"
                            type="number"
                            value={amountEdit.input}
                            onChange={(e) => amountEdit.setInput(e.target.value)}
                            onBlur={amountEdit.save}
                            onKeyDown={(e) => e.key === "Enter" && amountEdit.save()}
                            autoFocus
                            sx={{ maxWidth: 110 }}
                        />
                    ) : (
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, cursor: "pointer", borderBottom: "1px dashed", borderColor: "text.disabled" }}
                            onClick={amountEdit.start}
                        >
                            {formatCurrency(goal.currentAmount)}
                        </Typography>
                    )}
                    <Typography variant="h6" color="text.secondary">/</Typography>
                    {targetEdit.editing ? (
                        <TextField
                            size="small"
                            type="number"
                            value={targetEdit.input}
                            onChange={(e) => targetEdit.setInput(e.target.value)}
                            onBlur={targetEdit.save}
                            onKeyDown={(e) => e.key === "Enter" && targetEdit.save()}
                            autoFocus
                            sx={{ maxWidth: 110 }}
                        />
                    ) : (
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{ cursor: "pointer", borderBottom: "1px dashed", borderColor: "text.disabled" }}
                            onClick={targetEdit.start}
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
                    height: 8, mt: 1,
                    bgcolor: accent.savingsSoft,
                    "& .MuiLinearProgress-bar": { bgcolor: accent.savings },
                }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {t.percentAchieved(pctRaw.toFixed(0))}
            </Typography>
        </Box>
    );
}
