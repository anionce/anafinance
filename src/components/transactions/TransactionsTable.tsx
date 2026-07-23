import { useState } from 'react';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import type { GridColDef, GridRowModel, GridRowSelectionModel } from '@mui/x-data-grid';
import type { Transaction } from '../../types/Transaction';
import type { Category } from '../../types/Category';
import EditIcon from '@mui/icons-material/Edit';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
<<<<<<< HEAD
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import {
    Box, IconButton, Typography, Chip, Stack, Menu, MenuItem, TextField, useMediaQuery, useTheme,
} from '@mui/material';
=======
import { Box, IconButton, Typography, Chip, Select, MenuItem, Button } from '@mui/material';
>>>>>>> origin/main
import { useTranslation } from '../../i18n/useTranslation';
import { getCategoryLabel } from '../../i18n/categoryTranslations';
import type { Locale } from '../../store/localeStore';
import { formatCurrency } from '../../utils/currency';
import { accent } from '../../theme/colors';
import SplitTransactionDialog from './SplitTransactionDialog';
import ConfirmDialog from '../ConfirmDialog';

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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const apiRef = useGridApiRef();
    const [splitting, setSplitting] = useState<Transaction | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({ type: "include", ids: new Set() });

    const selectedIds: string[] = selectionModel.type === "include"
        ? Array.from(selectionModel.ids) as string[]
        : transactions.filter((tx) => !selectionModel.ids.has(tx.id)).map((tx) => tx.id);

    function clearSelection() {
        setSelectionModel({ type: "include", ids: new Set() });
    }

    function startEditing(id: string | number, field: string) {
        apiRef.current?.startCellEditMode({ id, field });
    }

    const categoryValueOptions = categories.map((c) => ({
        value: c.value,
        label: getCategoryLabel(c, locale),
    }));

    if (isMobile) {
        return (
            <>
                <Stack spacing={1}>
                    {transactions.map((tx) => (
                        <MobileTransactionCard
                            key={tx.id}
                            tx={tx}
                            categories={categories}
                            locale={locale}
                            t={t}
                            onCategoryChange={onCategoryChange}
                            onNotesChange={onNotesChange}
                            onCategoryClick={onCategoryClick}
                            onSplitClick={() => setSplitting(tx)}
                            onDelete={() => onDelete(tx.id)}
                        />
                    ))}
                </Stack>
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
            </>
        );
    }

    const columns: GridColDef[] = [
        {
            field: "description",
            headerName: t.colDescription,
            flex: 1.2,
            minWidth: 160,
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
                            {value < 0 ? "−" : "+"}{formatCurrency(Math.abs(value), 2)}
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
            minWidth: 140,
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
                        onClick={(e) => { e.stopPropagation(); setDeleting(params.id as string); }}
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
        <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
            {selectedIds.length > 0 && (
                <Box
                    sx={{
                        display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap",
                        p: 1, px: 1.5, borderRadius: "12px",
                        bgcolor: "background.default", border: "1px solid", borderColor: "divider",
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {t.selectedCountLabel(selectedIds.length)}
                    </Typography>
                    <Select
                        size="small"
                        displayEmpty
                        value=""
                        onChange={(e) => {
                            const category = e.target.value as string;
                            selectedIds.forEach((id) => onCategoryChange(id, category));
                            clearSelection();
                        }}
                        renderValue={() => t.bulkCategoryButton}
                        sx={{ minWidth: 160 }}
                    >
                        {categoryValueOptions.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                    </Select>
                    <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => setBulkDeleteOpen(true)}
                    >
                        {t.bulkDeleteButton}
                    </Button>
                </Box>
            )}
            <div style={{ flex: 1, minHeight: 0 }}>
                <DataGrid
                    apiRef={apiRef}
                    rows={transactions}
                    columns={columns}
                    pageSizeOptions={[25]}
                    rowHeight={56}
                    checkboxSelection
                    rowSelectionModel={selectionModel}
                    onRowSelectionModelChange={setSelectionModel}
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
                        "& .MuiDataGrid-virtualScroller": { WebkitOverflowScrolling: "touch" },
                    }}
                />
            </div>
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
            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                title={t.deleteTransactionConfirmTitle}
                message={t.deleteTransactionConfirmMessage}
                confirmLabel={t.deleteConfirmButton}
                danger
                onConfirm={() => { if (deleting) onDelete(deleting); }}
            />
            <ConfirmDialog
                open={bulkDeleteOpen}
                onClose={() => setBulkDeleteOpen(false)}
                title={t.deleteTransactionConfirmTitle}
                message={t.deleteSelectedConfirmMessage(selectedIds.length)}
                confirmLabel={t.deleteConfirmButton}
                danger
                onConfirm={() => { selectedIds.forEach((id) => onDelete(id)); clearSelection(); }}
            />
        </div>
    );
}

function MobileTransactionCard({ tx, categories, locale, t, onCategoryChange, onNotesChange, onCategoryClick, onSplitClick, onDelete }: {
    tx: Transaction;
    categories: Category[];
    locale: Locale;
    t: ReturnType<typeof useTranslation>["t"];
    onCategoryChange: (id: string, category: string) => void;
    onNotesChange: (id: string, notes: string) => void;
    onCategoryClick?: (category: string) => void;
    onSplitClick: () => void;
    onDelete: () => void;
}) {
    const [categoryAnchor, setCategoryAnchor] = useState<HTMLElement | null>(null);
    const [editingNotes, setEditingNotes] = useState(false);
    const [notesDraft, setNotesDraft] = useState(tx.notes ?? "");
    const found = categories.find((c) => c.value === tx.category);

    function saveNotes() {
        if (notesDraft !== (tx.notes ?? "")) onNotesChange(tx.id, notesDraft);
        setEditingNotes(false);
    }

    return (
        <Box sx={{ p: 1.5, borderRadius: "12px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, flex: 1, minWidth: 0 }}>
                    {tx.description}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: "nowrap", color: tx.amount < 0 ? accent.budget : accent.income }}>
                    {tx.amount < 0 ? "−" : "+"}{formatCurrency(Math.abs(tx.amount))}
                </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mt: 0.75 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                    {formatRowDate(tx.date, locale)}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, minWidth: 0 }}>
                    {found ? (
                        <Chip
                            label={getCategoryLabel(found, locale)}
                            size="small"
                            variant="outlined"
                            onClick={onCategoryClick ? () => onCategoryClick(found.value) : undefined}
                            sx={{ bgcolor: "background.default", borderColor: "divider", fontWeight: 500, cursor: onCategoryClick ? "pointer" : "default" }}
                        />
                    ) : (
                        <Typography variant="caption" sx={{ color: "text.disabled" }}>{t.noCategoryPlaceholder}</Typography>
                    )}
                    <IconButton size="small" onClick={(e) => setCategoryAnchor(e.currentTarget)}>
                        <EditIcon sx={{ fontSize: 15, opacity: 0.75 }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => setEditingNotes((v) => !v)}>
                        <NoteAltOutlinedIcon sx={{ fontSize: 15, opacity: 0.75 }} />
                    </IconButton>
                    <IconButton size="small" title={t.splitTooltip} onClick={onSplitClick}>
                        <CallSplitIcon sx={{ fontSize: 15, opacity: 0.75 }} />
                    </IconButton>
                    <IconButton size="small" title={t.deleteTransactionTooltip} onClick={onDelete}>
                        <DeleteOutlineIcon sx={{ fontSize: 15, opacity: 0.6 }} />
                    </IconButton>
                </Box>
            </Box>

            <Menu anchorEl={categoryAnchor} open={!!categoryAnchor} onClose={() => setCategoryAnchor(null)}>
                {categories.map((c) => (
                    <MenuItem
                        key={c.value}
                        selected={c.value === tx.category}
                        onClick={() => { onCategoryChange(tx.id, c.value); setCategoryAnchor(null); }}
                    >
                        {getCategoryLabel(c, locale)}
                    </MenuItem>
                ))}
            </Menu>

            {editingNotes ? (
                <TextField
                    size="small"
                    fullWidth
                    autoFocus
                    placeholder={t.colNotes}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    onBlur={saveNotes}
                    onKeyDown={(e) => e.key === "Enter" && saveNotes()}
                    sx={{ mt: 1 }}
                />
            ) : tx.notes ? (
                <Typography variant="caption" sx={{ display: "block", color: "text.secondary", mt: 0.75 }} onClick={() => setEditingNotes(true)}>
                    {tx.notes}
                </Typography>
            ) : null}
        </Box>
    );
}
