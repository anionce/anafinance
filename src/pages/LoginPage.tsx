import { useState } from "react";
import { Box, Card, Typography, Button, Alert } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useAuthStore } from "../store/authStore";
import { useTranslation } from "../i18n/useTranslation";
import Logo from "../components/Logo";

export default function LoginPage() {
    const { t } = useTranslation();
    const signIn = useAuthStore((s) => s.signIn);
    const [error, setError] = useState(false);

    async function handleSignIn() {
        setError(false);
        try {
            await signIn();
        } catch {
            setError(true);
        }
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
                p: 2,
            }}
        >
            <Card sx={{ p: 5, maxWidth: 380, width: "100%", textAlign: "center" }}>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <Logo size={48} />
                </Box>
                <Typography variant="h4" sx={{ color: "primary.main", mb: 1 }}>
                    {t.appName}
                </Typography>
                <Typography variant="h6" sx={{ mb: 1 }}>{t.signInTitle}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
                    {t.signInSubtitle}
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2, textAlign: "left" }}>{t.signInError}</Alert>}
                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<GoogleIcon />}
                    onClick={handleSignIn}
                >
                    {t.signInWithGoogle}
                </Button>
            </Card>
        </Box>
    );
}
