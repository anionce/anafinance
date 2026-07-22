import { useState } from "react";
import ImportExcelButton from "./ImportExcelButton";
import ImportMappingDialog from "./ImportMappingDialog";
import { UnrecognizedBankFormatError } from "../../services/excelParser";
import type { ColumnMapping } from "../../services/excelParser";
import { useFinanceStore } from "../../store/financeStore";

interface Props {
    uid: string;
}

export default function ImportExcelFlow({ uid }: Props) {
    const importFile = useFinanceStore((s) => s.importFile);
    const importFileWithMapping = useFinanceStore((s) => s.importFileWithMapping);
    const [pendingRows, setPendingRows] = useState<unknown[][] | null>(null);

    async function handleImport(file: File) {
        try {
            await importFile(uid, file);
        } catch (err) {
            if (err instanceof UnrecognizedBankFormatError) {
                setPendingRows(err.rows);
            } else {
                throw err;
            }
        }
    }

    async function handleConfirmMapping(mapping: ColumnMapping) {
        if (!pendingRows) return;
        await importFileWithMapping(uid, pendingRows, mapping);
        setPendingRows(null);
    }

    return (
        <>
            <ImportExcelButton onImport={handleImport} />
            {pendingRows && (
                <ImportMappingDialog
                    open
                    rows={pendingRows}
                    onClose={() => setPendingRows(null)}
                    onConfirm={handleConfirmMapping}
                />
            )}
        </>
    );
}
