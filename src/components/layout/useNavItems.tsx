import type { ReactElement } from "react";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useTranslation } from "../../i18n/useTranslation";
import { useSettingsStore } from "../../store/settingsStore";

export interface NavItem {
    label: string;
    path: string;
    icon: ReactElement;
}

export const useNavItems = (): NavItem[] => {
    const { t } = useTranslation();
    const combinedTransactionsView = useSettingsStore((s) => s.combinedTransactionsView);
    const showNoComputableTab = useSettingsStore((s) => s.showNoComputableTab);

    const transactionTabs = combinedTransactionsView
        ? [{ label: t.navTransactions, path: "/transactions", icon: <ReceiptLongOutlinedIcon /> }]
        : [
              { label: t.navExpenses, path: "/expenses", icon: <ShoppingBagOutlinedIcon /> },
              { label: t.navIncome, path: "/income", icon: <TrendingUpOutlinedIcon /> },
          ];

    return [
        { label: t.navDashboard, path: "/", icon: <SpaceDashboardOutlinedIcon /> },
        ...transactionTabs,
        { label: t.navGoals, path: "/goals", icon: <SavingsOutlinedIcon /> },
        ...(showNoComputableTab ? [{ label: t.navNoComputable, path: "/no-computable", icon: <VisibilityOffOutlinedIcon /> }] : []),
    ];
};
