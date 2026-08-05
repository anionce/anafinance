import { Card, Box, Typography, TextField, IconButton, LinearProgress } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import type { Goal } from "../../types/Goal";
import { formatCurrency } from "../../utils/currency";
import { calculatePercentage, calculateRawPercentage } from "../../services/budget";
import { accent } from "../../theme/colors";
import { useInlineEdit, parseNonEmptyNumber, parseNonEmptyText } from "../../hooks/useInlineEdit";

interface Props {
    goal: Goal;
    onAmountChange: (value: number) => void;
    onTargetChange: (value: number) => void;
    onNameChange: (name: string) => void;
}

export default function FeaturedGoalCard({ goal, onAmountChange, onTargetChange, onNameChange }: Props) {
    const amountEdit = useInlineEdit(goal.currentAmount, String, parseNonEmptyNumber, onAmountChange);
    const targetEdit = useInlineEdit(goal.targetAmount, String, parseNonEmptyNumber, onTargetChange);
    const nameEdit = useInlineEdit(goal.name, (v) => v, parseNonEmptyText, onNameChange);

    const pct = calculatePercentage(goal.currentAmount, goal.targetAmount);
    const pctRaw = calculateRawPercentage(goal.currentAmount, goal.targetAmount);

    return (
        <Card sx={{ p: 3, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Box
                    sx={{
                        width: 36, height: 36, borderRadius: "50%",
                        bgcolor: accent.savingsSoft, color: accent.savings,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <SavingsOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
                {nameEdit.editing ? (
                    <>
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
                    </>
                ) : (
                    <>
                        <Typography variant="h6" sx={{ flex: 1, lineHeight: 1 }}>{goal.name}</Typography>
                        <IconButton size="small" onClick={nameEdit.start}>
                            <EditIcon sx={{ fontSize: 18, opacity: 0.75 }} />
                        </IconButton>
                    </>
                )}
            </Box>
            <LinearProgress
                value={pct}
                variant="determinate"
                sx={{
                    mb: 2, height: 8,
                    bgcolor: accent.savingsSoft,
                    "& .MuiLinearProgress-bar": { bgcolor: accent.savings },
                }}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                {amountEdit.editing ? (
                    <>
                        <TextField
                            size="small"
                            type="number"
                            value={amountEdit.input}
                            onChange={(e) => amountEdit.setInput(e.target.value)}
                            onBlur={amountEdit.save}
                            onKeyDown={(e) => e.key === "Enter" && amountEdit.save()}
                            autoFocus
                            sx={{ maxWidth: 140 }}
                        />
                        <IconButton onClick={amountEdit.save} size="small">
                            <CheckIcon />
                        </IconButton>
                    </>
                ) : (
                    <>
                        <Typography variant="h4" sx={{ lineHeight: 1 }}>
                            {formatCurrency(goal.currentAmount)}
                        </Typography>
                        <IconButton size="small" onClick={amountEdit.start}>
                            <EditIcon sx={{ fontSize: 18, opacity: 0.75 }} />
                        </IconButton>
                    </>
                )}
                {targetEdit.editing ? (
                    <>
                        <Typography component="span" variant="body2" sx={{ color: "text.secondary" }}>/</Typography>
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
                        <IconButton onClick={targetEdit.save} size="small">
                            <CheckIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </>
                ) : (
                    <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: "text.secondary", cursor: "pointer", borderBottom: "1px dashed", borderColor: "text.disabled" }}
                        onClick={targetEdit.start}
                    >
                        / {formatCurrency(goal.targetAmount)}
                    </Typography>
                )}
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                {pctRaw.toFixed(0)}%
            </Typography>
        </Card>
    );
}
