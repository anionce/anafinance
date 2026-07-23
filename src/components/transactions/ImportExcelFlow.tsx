import { useState } from "react";
import { Snackbar, Alert, Box, Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ImportExcelButton from "./ImportExcelButton";
import ImportMappingDialog from "./ImportMappingDialog";
import { UnrecognizedBankFormatError } from "../../services/excelParser";
import type { ColumnMapping } from "../../services/excelParser";
import { useFinanceStore } from "../../store/financeStore";
import { useTranslation } from "../../i18n/useTranslation";

interface Props {
    uid: string;
}

type Feedback = { severity: "success" | "info" | "error"; message: string };

export default function ImportExcelFlow({ uid }: Props) {
    const { t } = useTranslation();
    const importFile = useFinanceStore((s) => s.importFile);
    const importFileWithMapping = useFinanceStore((s) => s.importFileWithMapping);
    const [pendingRows, setPendingRows] = useState<unknown[][] | null>(null);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [importing, setImporting] = useState(false);

    function reportAddedCount(addedCount: number) {
        setFeedback(
            addedCount > 0
                ? { severity: "success", message: t.importSuccessMessage(addedCount) }
                : { severity: "info", message: t.importNoNewMessage }
        );
    }

    async function handleImport(file: File) {
        setImporting(true);
        try {
            const addedCount = await importFile(uid, file);
            reportAddedCount(addedCount);
        } catch (err) {
            if (err instanceof UnrecognizedBankFormatError) {
                setPendingRows(err.rows);
            } else {
                console.error(err);
                setFeedback({ severity: "error", message: t.importErrorMessage });
            }
        } finally {
            setImporting(false);
        }
    }

    async function handleConfirmMapping(mapping: ColumnMapping) {
        if (!pendingRows) return;
        setImporting(true);
        try {
            const addedCount = await importFileWithMapping(uid, pendingRows, mapping);
            reportAddedCount(addedCount);
        } catch (err) {
            console.error(err);
            setFeedback({ severity: "error", message: t.importErrorMessage });
        } finally {
            setImporting(false);
        }
        setPendingRows(null);
    }

    return (
        <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <ImportExcelButton onImport={handleImport} loading={importing} />
                <Tooltip title={t.importHelpInfo} arrow placement="top">
                    <InfoOutlinedIcon sx={{ fontSize: 18, opacity: 0.5, cursor: "help" }} />
                </Tooltip>
            </Box>
            {pendingRows && (
                <ImportMappingDialog
                    open
                    rows={pendingRows}
                    onClose={() => setPendingRows(null)}
                    onConfirm={handleConfirmMapping}
                />
            )}
            <Snackbar
                open={!!feedback}
                autoHideDuration={4000}
                onClose={() => setFeedback(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                {feedback ? <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>{feedback.message}</Alert> : undefined}
            </Snackbar>
        </>
    );
}
