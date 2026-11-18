import type { BudgetStatus } from "../services/budget";
import { accent } from "./colors";

export const STATUS_STYLE: Record<BudgetStatus, { emoji: string; color: string; background: string }> = {
    great: { emoji: "🎉", color: accent.statusGreat, background: accent.statusGreatSoft },
    ok: { emoji: "🙂", color: accent.statusOk, background: accent.statusOkSoft },
    tight: { emoji: "😅", color: accent.statusTight, background: accent.statusTightSoft },
    over: { emoji: "😬", color: accent.statusOver, background: accent.statusOverSoft },
};
