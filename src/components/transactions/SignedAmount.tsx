import { Typography, type TypographyProps } from "@mui/material";
import { accent } from "../../theme/colors";
import { formatCurrency } from "../../utils/currency";

interface Props {
    amount: number;
    fractionDigits?: number;
    variant?: TypographyProps["variant"];
}

export const SignedAmount = ({ amount, fractionDigits = 0, variant = "body2" }: Props) => (
    <Typography variant={variant} sx={{ fontWeight: 700, whiteSpace: "nowrap", color: amount < 0 ? accent.budget : accent.income }}>
        {amount < 0 ? "−" : "+"}
        {formatCurrency(Math.abs(amount), fractionDigits)}
    </Typography>
);
