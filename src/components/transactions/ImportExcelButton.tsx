import { Button } from "@mui/material";
import { useTranslation } from "../../i18n/useTranslation";

interface Props {

    onImport(file: File): void;

}

export default function ImportExcelButton({ onImport }: Props) {
    const { t } = useTranslation();

    return (

        <Button
            variant="contained"
            component="label"
        >

            {t.importExcelButton}

            <input
                hidden
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {

                    const file = e.target.files?.[0];

                    if (file) {

                        onImport(file);

                    }

                }}
            />

        </Button>

    );

}
