import { useState, type ReactNode } from "react";
import {
    Container, Tabs, Tab, Box, Typography, Avatar, ButtonBase, ToggleButtonGroup, ToggleButton,
    BottomNavigation, BottomNavigationAction, Paper, Drawer, Divider, Button, Switch, FormControlLabel,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import { useLocation, useNavigate } from "react-router-dom";
import ReviewDialog from "./transactions/ReviewDialog";
import ConfirmDialog from "./ConfirmDialog";
import CategoryManagerDialog from "./budget/CategoryManagerDialog";
import CategorizationRulesDialog from "./budget/CategorizationRulesDialog";
import EditBudgetsDialog from "./budget/EditBudgetsDialog";
import BudgetHistoryDialog from "./budget/BudgetHistoryDialog";
import Logo from "./Logo";
import { useFinanceStore } from "../store/financeStore";
import { useSettingsStore } from "../store/settingsStore";
import { useAuthStore } from "../store/authStore";
import { useTranslation } from "../i18n/useTranslation";
import type { Locale } from "../store/localeStore";

interface Props {
    children: ReactNode;
    /**
     * "page" (default): normal document flow, the browser page scrolls.
     * "contained": fixed-height shell with its own inner scroll region, used
     * by pages with a DataGrid that needs to fill the remaining viewport
     * height and scroll internally instead of growing the page.
     */
    scrollMode?: "page" | "contained";
}

export default function Layout({ children, scrollMode = "page" }: Props) {
    const location = useLocation();
    const navigate = useNavigate();
    const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false);
    const [rulesDialogOpen, setRulesDialogOpen] = useState(false);
    const [budgetsDialogOpen, setBudgetsDialogOpen] = useState(false);
    const [budgetHistoryDialogOpen, setBudgetHistoryDialogOpen] = useState(false);
    const uid = useAuthStore((s) => s.user?.uid ?? "");
    const user = useAuthStore((s) => s.user);
    const signOut = useAuthStore((s) => s.signOut);
    const { transactions, resolveCategory, removeTransaction } = useFinanceStore();
    const {
        categories, categoryBudgets, categorizationRules, combinedTransactionsView, budgetHistory,
        addCategory, updateCategoryLabel, removeCategory, setCategoryNoComputable, setCategoryIncomeOnly, setCategories,
        addRule, removeRule, setCategoryBudgets, setCombinedTransactionsView,
    } = useSettingsStore();
    const { t, locale, setLocale } = useTranslation();

    const navItems = combinedTransactionsView
        ? [
            { label: t.navDashboard, path: "/", icon: <SpaceDashboardOutlinedIcon /> },
            { label: t.navTransactions, path: "/transactions", icon: <ReceiptLongOutlinedIcon /> },
            { label: t.navGoals, path: "/goals", icon: <SavingsOutlinedIcon /> },
        ]
        : [
            { label: t.navDashboard, path: "/", icon: <SpaceDashboardOutlinedIcon /> },
            { label: t.navExpenses, path: "/expenses", icon: <ShoppingBagOutlinedIcon /> },
            { label: t.navIncome, path: "/income", icon: <TrendingUpOutlinedIcon /> },
            { label: t.navGoals, path: "/goals", icon: <SavingsOutlinedIcon /> },
        ];

    const pending = transactions.filter((tx) => tx.category === "");
    const currentTab = navItems.some((item) => item.path === location.pathname) ? location.pathname : "/";

    const contained = scrollMode === "contained";

    return (
        <Container
            maxWidth="lg"
            sx={contained
                ? { py: 3, pb: { xs: 9, sm: 3 }, height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }
                : { py: 3, pb: { xs: 9, sm: 3 }, minHeight: "100vh", display: "flex", flexDirection: "column" }
            }
        >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", rowGap: 1, pb: 1.5, borderBottom: 1, borderColor: "divider", mb: 2, flexShrink: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, sm: 5 }, minWidth: 0 }}>
                    <Box
                        onClick={() => navigate("/")}
                        sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, cursor: "pointer" }}
                    >
                        <Logo size={26} />
                        <Typography variant="h6" sx={{ color: "primary.main", whiteSpace: "nowrap", lineHeight: 1 }}>
                            {t.appName}
                        </Typography>
                    </Box>
                    <Tabs value={currentTab} onChange={(_, value) => navigate(value)} sx={{ minHeight: 0, display: { xs: "none", sm: "flex" } }}>
                        {navItems.map((item) => (
                            <Tab key={item.path} label={item.label} value={item.path} sx={{ minHeight: 0, py: 1 }} />
                        ))}
                    </Tabs>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
                    {user && (
                        <ButtonBase
                            onClick={() => setAccountMenuOpen(true)}
                            sx={{ borderRadius: "50%" }}
                        >
                            <Avatar
                                src={user.photoURL ?? undefined}
                                alt={user.displayName ?? user.email ?? ""}
                                sx={{ width: 32, height: 32 }}
                            >
                                {!user.photoURL && (user.displayName ?? user.email ?? "?").charAt(0).toUpperCase()}
                            </Avatar>
                        </ButtonBase>
                    )}
                </Box>
            </Box>
            <Drawer anchor="right" open={accountMenuOpen} onClose={() => setAccountMenuOpen(false)}>
                <Box sx={{ width: 280, p: 3, display: "flex", flexDirection: "column", gap: 2.5, height: "100%" }}>
                    {user && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar
                                src={user.photoURL ?? undefined}
                                alt={user.displayName ?? user.email ?? ""}
                                sx={{ width: 48, height: 48 }}
                            >
                                {!user.photoURL && (user.displayName ?? user.email ?? "?").charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                {user.displayName && (
                                    <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>{user.displayName}</Typography>
                                )}
                                <Typography variant="body2" color="text.secondary" noWrap>{user.email}</Typography>
                            </Box>
                        </Box>
                    )}

                    <Divider />

                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                            {t.accountMenuLanguageLabel}
                        </Typography>
                        <ToggleButtonGroup
                            value={locale}
                            exclusive
                            size="small"
                            onChange={(_, value: Locale | null) => value && setLocale(value)}
                            sx={{
                                "& .MuiToggleButton-root": {
                                    border: "none",
                                    borderRadius: "999px !important",
                                    px: 1.5,
                                    color: "text.secondary",
                                    "&.Mui-selected": { bgcolor: "primary.main", color: "primary.contrastText", "&:hover": { bgcolor: "primary.dark" } },
                                },
                                bgcolor: "background.default",
                                borderRadius: "999px",
                                p: 0.5,
                            }}
                        >
                            <ToggleButton value="es">ES</ToggleButton>
                            <ToggleButton value="en">EN</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                            {t.accountMenuPreferencesLabel}
                        </Typography>
                        <FormControlLabel
                            sx={{ ml: 0 }}
                            control={
                                <Switch
                                    size="small"
                                    checked={combinedTransactionsView}
                                    onChange={(e) => setCombinedTransactionsView(uid, e.target.checked)}
                                />
                            }
                            label={<Typography variant="body2">{t.combinedTransactionsViewLabel}</Typography>}
                        />
                    </Box>

                    <Divider />

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Button
                            startIcon={<CategoryOutlinedIcon />}
                            color="inherit"
                            onClick={() => {
                                setAccountMenuOpen(false);
                                setCategoriesDialogOpen(true);
                            }}
                            sx={{ justifyContent: "flex-start" }}
                        >
                            {t.manageCategoriesTooltip}
                        </Button>
                        <Button
                            startIcon={<RuleOutlinedIcon />}
                            color="inherit"
                            onClick={() => {
                                setAccountMenuOpen(false);
                                setRulesDialogOpen(true);
                            }}
                            sx={{ justifyContent: "flex-start" }}
                        >
                            {t.manageRulesTooltip}
                        </Button>
                        <Button
                            startIcon={<EditIcon />}
                            color="inherit"
                            onClick={() => {
                                setAccountMenuOpen(false);
                                setBudgetsDialogOpen(true);
                            }}
                            sx={{ justifyContent: "flex-start" }}
                        >
                            {t.editBudgetTooltip}
                        </Button>
                        <Button
                            startIcon={<HistoryIcon />}
                            color="inherit"
                            onClick={() => {
                                setAccountMenuOpen(false);
                                setBudgetHistoryDialogOpen(true);
                            }}
                            sx={{ justifyContent: "flex-start" }}
                        >
                            {t.budgetHistoryTooltip}
                        </Button>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    <Divider />

                    <Button
                        startIcon={<LogoutIcon />}
                        color="error"
                        onClick={() => {
                            setAccountMenuOpen(false);
                            setSignOutConfirmOpen(true);
                        }}
                        sx={{ justifyContent: "flex-start" }}
                    >
                        {t.signOut}
                    </Button>
                </Box>
            </Drawer>
            {contained ? (
                <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                    {children}
                </Box>
            ) : (
                children
            )}
            <ReviewDialog
                pending={pending}
                categories={categories}
                onResolve={(id, category) => resolveCategory(uid, id, category)}
                onDiscardOne={(id) => removeTransaction(uid, id)}
                onDiscardAll={() => pending.forEach((tx) => removeTransaction(uid, tx.id))}
                onFinish={() => {}}
            />
            <ConfirmDialog
                open={signOutConfirmOpen}
                onClose={() => setSignOutConfirmOpen(false)}
                title={t.signOutConfirmTitle}
                message={t.signOutConfirmMessage}
                confirmLabel={t.signOutConfirmButton}
                danger
                onConfirm={() => signOut()}
            />
            <CategoryManagerDialog
                open={categoriesDialogOpen}
                onClose={() => setCategoriesDialogOpen(false)}
                categories={categories}
                onUpdateLabel={(value, label) => updateCategoryLabel(uid, value, label)}
                onAdd={(value, label) => addCategory(uid, value, label)}
                onRemove={(value) => removeCategory(uid, value)}
                onToggleNoComputable={(value, noComputable) => setCategoryNoComputable(uid, value, noComputable)}
                onToggleIncomeOnly={(value, incomeOnly) => setCategoryIncomeOnly(uid, value, incomeOnly)}
                onReorder={(reordered) => setCategories(uid, reordered)}
            />
            <CategorizationRulesDialog
                open={rulesDialogOpen}
                onClose={() => setRulesDialogOpen(false)}
                categories={categories}
                rules={categorizationRules}
                onAdd={(keyword, category) => addRule(uid, keyword, category)}
                onRemove={(id) => removeRule(uid, id)}
            />
            <EditBudgetsDialog
                open={budgetsDialogOpen}
                onClose={() => setBudgetsDialogOpen(false)}
                categories={categories}
                budgets={categoryBudgets}
                onSave={(budgets) => setCategoryBudgets(uid, budgets)}
            />
            <BudgetHistoryDialog
                open={budgetHistoryDialogOpen}
                onClose={() => setBudgetHistoryDialogOpen(false)}
                categories={categories}
                categoryBudgets={categoryBudgets}
                budgetHistory={budgetHistory}
                transactions={transactions}
                onSaveMonth={(month, budgets) => setCategoryBudgets(uid, budgets, month)}
            />
            <Paper
                elevation={0}
                sx={{
                    display: { xs: "block", sm: "none" },
                    position: "fixed", bottom: 0, left: 0, right: 0,
                    borderTop: 1, borderColor: "divider",
                    borderRadius: 0,
                    zIndex: 1100,
                }}
            >
                <BottomNavigation value={currentTab} onChange={(_, value) => navigate(value)} showLabels>
                    {navItems.map((item) => (
                        <BottomNavigationAction key={item.path} label={item.label} value={item.path} icon={item.icon} />
                    ))}
                </BottomNavigation>
            </Paper>
        </Container>
    );
}
