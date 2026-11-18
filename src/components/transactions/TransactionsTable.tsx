import { useState } from "react";
import { Stack, useMediaQuery, useTheme } from "@mui/material";
import { useTranslation } from "../../i18n/useTranslation";
import type { Category } from "../../types/Category";
import type { Transaction } from "../../types/Transaction";
import { ConfirmDialog } from "../ConfirmDialog";
import { MobileTransactionCard } from "./MobileTransactionCard";
import { SplitTransactionDialog } from "./SplitTransactionDialog";
import { TransactionsGrid } from "./TransactionsGrid";

interface Props {
    transactions: Transaction[];
    categories: Category[];
    onCategoryChange: (id: string, category: string) => void;
    onNotesChange: (id: string, notes: string) => void;
    onSplit: (id: string, portions: { category: string; amount: number }[]) => void;
    onDelete: (id: string) => void;
    onCategoryClick?: (category: string) => void;
}

export const TransactionsTable = ({
    transactions,
    categories,
    onCategoryChange,
    onNotesChange,
    onSplit,
    onDelete,
    onCategoryClick,
}: Props) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [splitting, setSplitting] = useState<Transaction | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    return (
        <>
            {isMobile ? (
                <Stack spacing={1}>
                    {transactions.map((tx) => (
                        <MobileTransactionCard
                            key={tx.id}
                            tx={tx}
                            categories={categories}
                            onCategoryChange={onCategoryChange}
                            onNotesChange={onNotesChange}
                            onCategoryClick={onCategoryClick}
                            onSplitClick={() => setSplitting(tx)}
                            onDelete={() => setDeleting(tx.id)}
                        />
                    ))}
                </Stack>
            ) : (
                <TransactionsGrid
                    transactions={transactions}
                    categories={categories}
                    onCategoryChange={onCategoryChange}
                    onNotesChange={onNotesChange}
                    onCategoryClick={onCategoryClick}
                    onSplitClick={setSplitting}
                    onDeleteClick={setDeleting}
                    onDelete={onDelete}
                />
            )}
            <SplitTransactionDialog
                open={!!splitting}
                transaction={splitting}
                categories={categories}
                onClose={() => setSplitting(null)}
                onConfirm={(portions) => {
                    if (splitting) onSplit(splitting.id, portions);
                    setSplitting(null);
                }}
            />
            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                title={t.deleteTransactionConfirmTitle}
                message={t.deleteTransactionConfirmMessage}
                confirmLabel={t.deleteConfirmButton}
                danger
                onConfirm={() => deleting && onDelete(deleting)}
            />
        </>
    );
};
