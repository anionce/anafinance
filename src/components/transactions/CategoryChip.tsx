import type { MouseEvent } from "react";
import { Chip, Typography } from "@mui/material";
import { getCategoryLabel } from "../../i18n/categoryTranslations";
import { useTranslation } from "../../i18n/useTranslation";
import type { Category } from "../../types/Category";

interface Props {
    category: Category | undefined;
    onClick?: (category: string) => void;
}

export const CategoryChip = ({ category, onClick }: Props) => {
    const { t, locale } = useTranslation();

    if (!category) {
        return (
            <Typography variant="body2" sx={{ color: "text.disabled" }}>
                {t.noCategoryPlaceholder}
            </Typography>
        );
    }

    const handleClick = (e: MouseEvent) => {
        e.stopPropagation();
        onClick?.(category.value);
    };

    return (
        <Chip
            label={getCategoryLabel(category, locale)}
            size="small"
            variant="outlined"
            onClick={onClick ? handleClick : undefined}
            sx={{ bgcolor: "background.default", borderColor: "divider", fontWeight: 500 }}
        />
    );
};
