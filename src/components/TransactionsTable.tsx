import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowModel } from '@mui/x-data-grid';
import type { Transaction } from '../types/Transaction';
import { CATEGORIES } from '../types/Category';
import EditIcon from '@mui/icons-material/Edit';
import { Box } from '@mui/material';

interface Props {
    transactions: Transaction[];
    onCategoryChange: (id: string, category: string) => void;
}

const categoryValueOptions = CATEGORIES.map((c) => ({
    value: c.value,
    label: c.label,
}));

export default function TransactionsTable({ transactions, onCategoryChange }: Props) {
    const columns: GridColDef[] = [
        {
            field: "description",
            headerName: "Concepto",
            flex: 1,
        },
        {
            field: "date",
            headerName: "Fecha",
            width: 120,
        },
        {
            field: "amount",
            headerName: "Importe",
            width: 140,
        },
        {
            field: "category",
            headerName: "Categoría",
            width: 220,
            editable: true,
            type: "singleSelect",
            valueOptions: categoryValueOptions,
            renderCell: (params) => {
                const found = CATEGORIES.find((c) => c.value === params.value);
                return (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            cursor: "pointer",
                            "&:hover": { backgroundColor: "action.hover" },
                            px: 1,
                            borderRadius: 1,
                        }}
                    >
                        <span>{found ? found.label : (params.value || "— sin categoría —")}</span>
                        <EditIcon sx={{ fontSize: 16, opacity: 0.4 }} />
                    </Box>
                );
            },
        },
    ];

    function processRowUpdate(newRow: GridRowModel, oldRow: GridRowModel) {
        if (newRow.category !== oldRow.category) {
            onCategoryChange(newRow.id as string, newRow.category as string);
        }
        return newRow;
    }

    return (
        <div style={{ height: 600, marginTop: 30 }}>
            <DataGrid
                rows={transactions}
                columns={columns}
                pageSizeOptions={[25]}
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={(error) => console.error(error)}
            />
        </div>
    );
}