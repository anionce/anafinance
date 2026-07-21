import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import type { GridColDef, GridRowModel } from '@mui/x-data-grid';
import type { Transaction } from '../../types/Transaction';
import type { Category } from '../../types/Category';
import EditIcon from '@mui/icons-material/Edit';
import { Box, IconButton } from '@mui/material';
import { useTranslation } from '../../i18n/useTranslation';
import { getCategoryLabel } from '../../i18n/categoryTranslations';

interface Props {
    transactions: Transaction[];
    categories: Category[];
    onCategoryChange: (id: string, category: string) => void;
    onNotesChange: (id: string, notes: string) => void;
}

export default function TransactionsTable({ transactions, categories, onCategoryChange, onNotesChange }: Props) {
    const { t, locale } = useTranslation();
    const apiRef = useGridApiRef();

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
        },
        {
            field: "date",
            headerName: t.colDate,
            width: 120,
        },
        {
            field: "amount",
            headerName: t.colAmount,
            width: 120,
        },
        {
            field: "category",
            headerName: t.colCategory,
            width: 220,
            editable: true,
            type: "singleSelect",
            valueOptions: categoryValueOptions,
            renderCell: (params) => {
                const found = categories.find((c) => c.value === params.value);
                return (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <span>{found ? getCategoryLabel(found, locale) : (params.value || t.noCategoryPlaceholder)}</span>
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
                    <span>{params.value ?? ""}</span>
                    <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); startEditing(params.id, params.field); }}
                    >
                        <EditIcon sx={{ fontSize: 16, opacity: 0.75 }} />
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
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={(error) => console.error(error)}
            />
        </div>
    );
}
