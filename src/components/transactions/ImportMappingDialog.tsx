import { useMemo, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Select,
    MenuItem,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from "@mui/material";
import { guessHeaderRowIndex } from "../../services/excelParser";
import type { ColumnMapping } from "../../services/excelParser";
import { useTranslation } from "../../i18n/useTranslation";

interface Props {
    open: boolean;
    rows: unknown[][];
    onClose: () => void;
    onConfirm: (mapping: ColumnMapping) => void;
}

export default function ImportMappingDialog({ open, rows, onClose, onConfirm }: Props) {
    const { t } = useTranslation();
    const headerRowIndex = useMemo(() => guessHeaderRowIndex(rows), [rows]);
    const headerRow = rows[headerRowIndex] ?? [];
    const previewRows = rows.slice(headerRowIndex + 1, headerRowIndex + 6);

    const columnOptions = headerRow.map((cell, index) => ({
        index,
        label: cell != null && String(cell).trim() !== "" ? String(cell) : `#${index + 1}`,
    }));

    const [dateCol, setDateCol] = useState<number | "">("");
    const [descriptionCol, setDescriptionCol] = useState<number | "">("");
    const [amountCol, setAmountCol] = useState<number | "">("");

    const canConfirm = dateCol !== "" && descriptionCol !== "" && amountCol !== "";

    function handleConfirm() {
        if (!canConfirm) return;
        onConfirm({ headerRowIndex, dateCol, descriptionCol, amountCol });
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t.mappingTitle}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>{t.mappingHint}</Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                        <Typography variant="body2">{t.mappingDateColumn}</Typography>
                        <Select size="small" value={dateCol} onChange={(e) => setDateCol(e.target.value as number)} sx={{ minWidth: 200 }}>
                            {columnOptions.map((c) => (
                                <MenuItem key={c.index} value={c.index}>{c.label}</MenuItem>
                            ))}
                        </Select>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                        <Typography variant="body2">{t.mappingDescriptionColumn}</Typography>
                        <Select size="small" value={descriptionCol} onChange={(e) => setDescriptionCol(e.target.value as number)} sx={{ minWidth: 200 }}>
                            {columnOptions.map((c) => (
                                <MenuItem key={c.index} value={c.index}>{c.label}</MenuItem>
                            ))}
                        </Select>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                        <Typography variant="body2">{t.mappingAmountColumn}</Typography>
                        <Select size="small" value={amountCol} onChange={(e) => setAmountCol(e.target.value as number)} sx={{ minWidth: 200 }}>
                            {columnOptions.map((c) => (
                                <MenuItem key={c.index} value={c.index}>{c.label}</MenuItem>
                            ))}
                        </Select>
                    </Box>
                    <Typography variant="caption" color="text.secondary">{t.mappingNotACurrency}</Typography>
                </Box>

                <Typography variant="body2" sx={{ mb: 1 }}>{t.mappingPreviewTitle}</Typography>
                <Box sx={{ overflowX: "auto", border: 1, borderColor: "divider", borderRadius: "8px" }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {columnOptions.map((c) => (
                                    <TableCell key={c.index}>{c.label}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {previewRows.map((row, i) => (
                                <TableRow key={i}>
                                    {columnOptions.map((c) => (
                                        <TableCell key={c.index}>{row[c.index] != null ? String(row[c.index]) : ""}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t.cancel}</Button>
                <Button variant="contained" disabled={!canConfirm} onClick={handleConfirm}>{t.mappingConfirm}</Button>
            </DialogActions>
        </Dialog>
    );
}
