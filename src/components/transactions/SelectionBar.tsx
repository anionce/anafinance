import { Box, Button, MenuItem, Select, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useTranslation } from "../../i18n/useTranslation";

interface Props {
    count: number;
    categoryOptions: { value: string; label: string }[];
    onCategoryChange: (category: string) => void;
    onDelete: () => void;
}

export const SelectionBar = ({ count, categoryOptions, onCategoryChange, onDelete }: Props) => {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
                p: 1,
                px: 1.5,
                borderRadius: "12px",
                bgcolor: "background.default",
                border: "1px solid",
                borderColor: "divider",
            }}
        >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {t.selectedCountLabel(count)}
            </Typography>
            <Select
                size="small"
                displayEmpty
                value=""
                onChange={(e) => onCategoryChange(e.target.value as string)}
                renderValue={() => t.bulkCategoryButton}
                sx={{ minWidth: 160 }}
            >
                {categoryOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
            <Button size="small" color="error" startIcon={<DeleteOutlineIcon />} onClick={onDelete}>
                {t.bulkDeleteButton}
            </Button>
        </Box>
    );
};
