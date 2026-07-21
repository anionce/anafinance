import { Button } from "@mui/material";

interface Props {

    onImport(file: File): void;

}

export default function ImportExcel({ onImport }: Props) {

    return (

        <Button
            variant="contained"
            component="label"
        >

            Importar Excel BBVA

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