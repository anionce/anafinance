import { useState } from 'react';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import type { GridColDef, GridRowModel } from '@mui/x-data-grid';
import type { Transaction } from '../../types/Transaction';
import type { Category } from '../../types/Category';
import EditIcon from '@mui/icons-material/Edit';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { Box, IconButton, Typography, Chip } from '@mui/material';
import { useTranslation } from '../../i18n/useTranslation';
import { getCategoryLabel } from '../../i18n/categoryTranslations';
import { formatCurrency } from '../../utils/currency';
import { accent } from '../../theme/colors';
import SplitTransactionDialog from './SplitTransactionDialog';

interface Props {
    transactions: Transaction[];
    categories: Category[];
    onCategoryChange: (id: string, category: string) => void;
    onNotesChange: (id: string, notes: string) => void;
    onSplit: (id: string, portions: { category: string; amount: number }[]) => void;
    onDelete: (id: string) => void;
    onCategoryClick?: (category: string) => void;
}

function formatRowDate(iso: string, locale: string): string {
    const [year, month, day] = iso.split("-").map(Number);
    if (!year || !month || !day) return iso;
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export default function TransactionsTable({ transactions, categories, onCategoryChange, onNotesChange, onSplit, onDelete, onCategoryClick }: Props) {
    const { t, locale } = useTranslation();
    const apiRef = useGridApiRef();
    const [splitting, setSplitting] = useState<Transaction | null>(null);

    function startEditing(id: string | number, field: string) {
        apiRef.current?.startCellEditMode({ id, field });
    }

    const categoryValueOptions = categories.map((c) => ({
        value: c.value,
        label: getCategoryLabel(c, locale),
    }));

    const columns: GridColDef[] = [
        {
            field: "description",
            headerName: t.colDescription,
            flex: 1.2,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>
                    {params.value}
                </Typography>
            ),
        },
        {
            field: "date",
            headerName: t.colDate,
            width: 130,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {formatRowDate(params.value as string, locale)}
                </Typography>
            ),
        },
        {
            field: "amount",
            headerName: t.colAmount,
            width: 140,
            renderCell: (params) => {
                const tx = transactions.find((t) => t.id === params.id);
                const value = params.value as number;
                return (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: value < 0 ? accent.budget : accent.income }}>
                            {value < 0 ? "−" : "+"}{formatCurrency(Math.abs(value))}
                        </Typography>
                        <IconButton
                            size="small"
                            title={t.splitTooltip}
                            onClick={(e) => { e.stopPropagation(); if (tx) setSplitting(tx); }}
                        >
                            <CallSplitIcon sx={{ fontSize: 16, opacity: 0.75 }} />
                        </IconButton>
                    </Box>
                );
            },
        },
        {
            field: "category",
            headerName: t.colCategory,
            width: 230,
            editable: true,
            type: "singleSelect",
            valueOptions: categoryValueOptions,
            renderCell: (params) => {
                const found = categories.find((c) => c.value === params.value);
                return (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        {found ? (
                            <Chip
                                label={getCategoryLabel(found, locale)}
                                size="small"
                                variant="outlined"
                                onClick={onCategoryClick ? (e) => { e.stopPropagation(); onCategoryClick(found.value); } : undefined}
                                sx={{
                                    bgcolor: "background.default", borderColor: "divider", fontWeight: 500,
                                    cursor: onCategoryClick ? "pointer" : "default",
                                }}
                            />
                        ) : (
                            <Typography variant="body2" sx={{ color: "text.disabled" }}>{t.noCategoryPlaceholder}</Typography>
                        )}
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); startEditing(params.id, params.field); }}
                        >
                            <EditIcon sx={{ fontSize: 16, opacity: 0.75 }} />
                        </IconButton>
                    </Box>
                );
            },
        },
        {
            field: "notes",
            headerName: t.colNotes,
            flex: 1,
            editable: true,
            renderCell: (params) => (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <Typography variant="body2" sx={{ color: params.value ? "text.secondary" : "text.disabled", fontStyle: params.value ? "normal" : "italic" }}>
                        {params.value || ""}
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); startEditing(params.id, params.field); }}
                    >
                        <EditIcon sx={{ fontSize: 16, opacity: 0.75 }} />
                    </IconButton>
                </Box>
            ),
        },
        {
            field: "actions",
            headerName: "",
            width: 56,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                    <IconButton
                        size="small"
                        title={t.deleteTransactionTooltip}
                        onClick={(e) => { e.stopPropagation(); onDelete(params.id as string); }}
                    >
                        <DeleteOutlineIcon sx={{ fontSize: 18, opacity: 0.6 }} />
                    </IconButton>
                </Box>
            ),
        },
    ];

    function processRowUpdate(newRow: GridRowModel, oldRow: GridRowModel) {
        if (newRow.category !== oldRow.category) {
            onCategoryChange(newRow.id as string, newRow.category as string);
        }
        if (newRow.notes !== oldRow.notes) {
            onNotesChange(newRow.id as string, (newRow.notes as string) ?? "");
        }
        return newRow;
    }

    return (
        <div style={{ height: "100%" }}>
            <DataGrid
                apiRef={apiRef}
                rows={transactions}
                columns={columns}
                pageSizeOptions={[25]}
                rowHeight={56}
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={(error) => console.error(error)}
                sx={{
                    height: "100%",
                    border: "1px solid",
                    borderColor: "#EFEBE3",
                    borderRadius: "16px",
                    bgcolor: "background.paper",
                    boxShadow: "0 1px 2px rgba(43,42,40,0.04), 0 6px 16px rgba(43,42,40,0.05)",
                    "& .MuiDataGrid-columnHeaders": { bgcolor: "background.default" },
                    "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 600, color: "text.secondary" },
                    "& .MuiDataGrid-row:hover": { bgcolor: "background.default" },
                    "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" },
                }}
            />
            <SplitTransactionDialog
                open={!!splitting}
                transaction={splitting}
                categories={categories}
                onClose={() => setSplitting(null)}
                onConfirm={(portions) => {
                    if (splitting) onSplit(splitting.id, portions);
                    setSplitting(null);
                }}
            />
        </div>
    );
}
