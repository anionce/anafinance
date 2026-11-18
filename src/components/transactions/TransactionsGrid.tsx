import { useState, type ReactNode } from "react";
import { DataGrid, useGridApiRef, type GridColDef, type GridRowModel, type GridRowSelectionModel } from "@mui/x-data-grid";
import { Box, IconButton, Typography } from "@mui/material";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditIcon from "@mui/icons-material/Edit";
import { getCategoryLabel } from "../../i18n/categoryTranslations";
import { useTranslation } from "../../i18n/useTranslation";
import type { Category } from "../../types/Category";
import type { Transaction } from "../../types/Transaction";
import { formatShortDate } from "../../utils/dates";
import { ConfirmDialog } from "../ConfirmDialog";
import { CategoryChip } from "./CategoryChip";
import { SelectionBar } from "./SelectionBar";
import { SignedAmount } from "./SignedAmount";

interface Props {
    transactions: Transaction[];
    categories: Category[];
    onCategoryChange: (id: string, category: string) => void;
    onNotesChange: (id: string, notes: string) => void;
    onCategoryClick?: (category: string) => void;
    onSplitClick: (transaction: Transaction) => void;
    onDeleteClick: (id: string) => void;
    onDelete: (id: string) => void;
}

const PAGE_SIZE = 25;
const ROW_HEIGHT = 56;
const EMPTY_SELECTION: GridRowSelectionModel = { type: "include", ids: new Set() };

const rowContentSx = { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" };

const gridSx = {
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
};

const EditableCell = ({ children, label, onEdit }: { children: ReactNode; label: string; onEdit: () => void }) => (
    <Box sx={rowContentSx}>
        {children}
        <IconButton
            size="small"
            aria-label={label}
            onClick={(e) => {
                e.stopPropagation();
                onEdit();
            }}
        >
            <EditIcon sx={{ fontSize: 16, opacity: 0.75 }} />
        </IconButton>
    </Box>
);

const selectedIdsOf = (selection: GridRowSelectionModel, transactions: Transaction[]): string[] =>
    selection.type === "include"
        ? (Array.from(selection.ids) as string[])
        : transactions.filter((tx) => !selection.ids.has(tx.id)).map((tx) => tx.id);

export const TransactionsGrid = ({
    transactions,
    categories,
    onCategoryChange,
    onNotesChange,
    onCategoryClick,
    onSplitClick,
    onDeleteClick,
    onDelete,
}: Props) => {
    const { t, locale } = useTranslation();
    const apiRef = useGridApiRef();
    const [selection, setSelection] = useState<GridRowSelectionModel>(EMPTY_SELECTION);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

    const selectedIds = selectedIdsOf(selection, transactions);
    const categoryOptions = categories.map((c) => ({ value: c.value, label: getCategoryLabel(c, locale) }));
    const startEditing = (id: string | number, field: string) => apiRef.current?.startCellEditMode({ id, field });

    const columns: GridColDef<Transaction>[] = [
        {
            field: "description",
            headerName: t.colDescription,
            flex: 1.2,
            minWidth: 160,
            renderCell: ({ value }) => (
                <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>
                    {value}
                </Typography>
            ),
        },
        {
            field: "date",
            headerName: t.colDate,
            width: 130,
            renderCell: ({ value }) => (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {formatShortDate(value, locale)}
                </Typography>
            ),
        },
        {
            field: "amount",
            headerName: t.colAmount,
            width: 140,
            renderCell: ({ row }) => (
                <Box sx={rowContentSx}>
                    <SignedAmount amount={row.amount} fractionDigits={2} />
                    <IconButton
                        size="small"
                        aria-label={t.splitTooltip}
                        title={t.splitTooltip}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSplitClick(row);
                        }}
                    >
                        <CallSplitIcon sx={{ fontSize: 16, opacity: 0.75 }} />
                    </IconButton>
                </Box>
            ),
        },
        {
            field: "category",
            headerName: t.colCategory,
            width: 230,
            editable: true,
            type: "singleSelect",
            valueOptions: categoryOptions,
            renderCell: ({ id, field, value }) => (
                <EditableCell label={t.editCategoryLabel} onEdit={() => startEditing(id, field)}>
                    <CategoryChip category={categories.find((c) => c.value === value)} onClick={onCategoryClick} />
                </EditableCell>
            ),
        },
        {
            field: "notes",
            headerName: t.colNotes,
            flex: 1,
            minWidth: 140,
            editable: true,
            renderCell: ({ id, field, value }) => (
                <EditableCell label={t.editNotesLabel} onEdit={() => startEditing(id, field)}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {value ?? ""}
                    </Typography>
                </EditableCell>
            ),
        },
        {
            field: "actions",
            headerName: "",
            width: 56,
            sortable: false,
            filterable: false,
            renderCell: ({ row }) => (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                    <IconButton
                        size="small"
                        aria-label={t.deleteTransactionTooltip}
                        title={t.deleteTransactionTooltip}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteClick(row.id);
                        }}
                    >
                        <DeleteOutlineIcon sx={{ fontSize: 18, opacity: 0.6 }} />
                    </IconButton>
                </Box>
            ),
        },
    ];

    const processRowUpdate = (newRow: GridRowModel<Transaction>, oldRow: GridRowModel<Transaction>) => {
        if (newRow.category !== oldRow.category) onCategoryChange(newRow.id, newRow.category);
        if (newRow.notes !== oldRow.notes) onNotesChange(newRow.id, newRow.notes ?? "");
        return newRow;
    };

    const changeSelectedCategory = (category: string) => {
        selectedIds.forEach((id) => onCategoryChange(id, category));
        setSelection(EMPTY_SELECTION);
    };

    const deleteSelected = () => {
        selectedIds.forEach(onDelete);
        setSelection(EMPTY_SELECTION);
    };

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
            {selectedIds.length > 0 && (
                <SelectionBar
                    count={selectedIds.length}
                    categoryOptions={categoryOptions}
                    onCategoryChange={changeSelectedCategory}
                    onDelete={() => setBulkDeleteOpen(true)}
                />
            )}
            <Box sx={{ flex: 1, minHeight: 0 }}>
                <DataGrid
                    apiRef={apiRef}
                    rows={transactions}
                    columns={columns}
                    pageSizeOptions={[PAGE_SIZE]}
                    rowHeight={ROW_HEIGHT}
                    checkboxSelection
                    rowSelectionModel={selection}
                    onRowSelectionModelChange={setSelection}
                    processRowUpdate={processRowUpdate}
                    onProcessRowUpdateError={(error) => console.error(error)}
                    sx={gridSx}
                />
            </Box>
            <ConfirmDialog
                open={bulkDeleteOpen}
                onClose={() => setBulkDeleteOpen(false)}
                title={t.deleteTransactionConfirmTitle}
                message={t.deleteSelectedConfirmMessage(selectedIds.length)}
                confirmLabel={t.deleteConfirmButton}
                danger
                onConfirm={deleteSelected}
            />
        </Box>
    );
};
