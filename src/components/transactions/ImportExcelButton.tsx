import { Button, CircularProgress } from "@mui/material";
import { useTranslation } from "../../i18n/useTranslation";

interface Props {
    onImport(file: File): void;
    loading?: boolean;
}

export default function ImportExcelButton({ onImport, loading }: Props) {
    const { t } = useTranslation();

    return (
        <Button
            variant="contained"
            component="label"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
            {loading ? t.importingMessage : t.importExcelButton}

            <input
                hidden
                type="file"
                accept=".xlsx,.xls"
                disabled={loading}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        onImport(file);
                    }
                    e.target.value = "";
                }}
            />
        </Button>
    );
}
