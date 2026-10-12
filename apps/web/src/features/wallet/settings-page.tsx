import { Check, CirclePlay, Copy, LogOut, Settings, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GettingStartedTourDialog } from "@/features/wallet/getting-started-tour";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useI18n } from "@/hooks/use-i18n";
import { useWalletAccount } from "@/hooks/use-wallet-account";
import { queryClient } from "@/lib/query-client";
import { useA2AStore } from "@/stores/a2a";

/**
 * Settings: getting-started tour, account info, language, sign out.
 */
export function SettingsPage() {
  const navigate = useNavigate();
  const { t, locale, setLocale } = useI18n();
  const { address, loginMethod, logout } = useWalletAccount();
  const switchWallet = useA2AStore((s) => s.switchWallet);

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayLoginMethod =
    loginMethod === "Privy embedded wallet"
      ? t("settings.loginPrivyEmbedded")
      : loginMethod;

  /**
   * Disconnects the Privy session and returns to sign-in.
   */
  async function onConfirmLogout() {
    setLoggingOut(true);
    try {
      queryClient.clear();
      await switchWallet(null);
      await logout();
      setLogoutOpen(false);
      navigate("/", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }

  /**
   * Copies the wallet address.
   */
  async function copyAddress() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-in">
      <PageHeader icon={Settings} title={t("settings.title")} tone="slate" />

      <Card className="fade-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CirclePlay className="h-4 w-4" aria-hidden />
            {t("settings.tour")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{t("settings.tourBody")}</p>
          <Button type="button" variant="outline" onClick={() => setTourOpen(true)}>
            {t("activity.ctaTour")}
          </Button>
        </CardContent>
      </Card>

      <GettingStartedTourDialog open={tourOpen} onOpenChange={setTourOpen} />

      <Card className="fade-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" aria-hidden />
            {t("settings.account")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {t("settings.walletAddress")}
              </p>
              <p className="mt-1 break-all font-mono text-sm font-medium">
                {address ?? "—"}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!address}
              onClick={() => void copyAddress()}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
              {copied ? t("settings.copied") : t("settings.copyAddress")}
            </Button>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <p className="text-xs text-muted-foreground">
                {t("settings.loginMethod")}
              </p>
              <p className="mt-1 text-sm font-medium">{displayLoginMethod}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <p className="text-xs text-muted-foreground">{t("settings.language")}</p>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={locale}
              onValueChange={(value) => {
                if (value === "en" || value === "zh") setLocale(value);
              }}
            >
              <ToggleGroupItem
                value="en"
                className="px-3 data-[state=on]:bg-foreground data-[state=on]:text-background"
              >
                {t("settings.languageEn")}
              </ToggleGroupItem>
              <ToggleGroupItem
                value="zh"
                className="px-3 data-[state=on]:bg-foreground data-[state=on]:text-background"
              >
                {t("settings.languageZh")}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setLogoutOpen(true)}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            {t("settings.logout")}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("settings.logoutConfirmTitle")}</DialogTitle>
            <DialogDescription>{t("settings.logoutConfirmBody")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:flex-col">
            <Button
              type="button"
              className="w-full"
              disabled={loggingOut}
              onClick={() => void onConfirmLogout()}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              {loggingOut
                ? t("settings.logoutPending")
                : t("settings.logoutConfirm")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={loggingOut}
              onClick={() => setLogoutOpen(false)}
            >
              {t("settings.cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
