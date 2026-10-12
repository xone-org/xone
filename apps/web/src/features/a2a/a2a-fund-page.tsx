import { useState, type FormEvent } from "react";
import { ArrowRightLeft } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { useWalletBalances } from "@/hooks/use-wallet-balances";
import { useI18n } from "@/hooks/use-i18n";
import { useA2AStore } from "@/stores/a2a";
import { cn } from "@/lib/utils";

/**
 * Moves wallet USDC into the service spending balance.
 */
export function A2AFundPage() {
  const { t } = useI18n();
  const { usdc } = useWalletBalances();
  const a2aBalance = useA2AStore((s) => s.a2aBalance);
  const fundFromWallet = useA2AStore((s) => s.fundFromWallet);

  const [fundAmount, setFundAmount] = useState("1");
  const [toast, setToast] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [fundOpen, setFundOpen] = useState(false);

  /**
   * Shows a short-lived feedback banner.
   */
  function showToast(tone: "ok" | "err", text: string) {
    setToast({ tone, text });
    window.setTimeout(() => setToast(null), 2800);
  }

  /**
   * Opens the fund confirmation dialog after basic validation.
   */
  function onFundSubmit(event: FormEvent) {
    event.preventDefault();
    const amount = Number(fundAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast("err", t("a2aFund.invalid"));
      return;
    }
    if (amount > usdc) {
      showToast("err", t("a2aFund.insufficient"));
      return;
    }
    setFundOpen(true);
  }

  /**
   * Confirms moving USDC into the A2A spending balance.
   */
  async function onConfirmFund() {
    const amount = Number(fundAmount);
    setFundOpen(false);
    const error = await fundFromWallet(amount);
    if (error) {
      showToast("err", error);
      return;
    }
    showToast("ok", t("a2aFund.ok", { amount }));
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 animate-in">
      <PageHeader icon={ArrowRightLeft} title={t("a2aFund.title")} tone="slate" />

      <p className="text-sm text-muted-foreground">
        {t("a2aFund.intro", { amount: a2aBalance.toFixed(2) })}
      </p>

      {toast ? (
        <div
          className={cn(
            "message-in rounded-md border px-4 py-3 text-sm",
            toast.tone === "ok"
              ? "border-border bg-muted"
              : "border-[var(--color-destructive)]/30 bg-red-50 text-[var(--color-destructive)]",
          )}
          role="status"
        >
          {toast.text}
        </div>
      ) : null}

      <Card className="fade-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" aria-hidden />
            {t("a2aFund.cardTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onFundSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="fund-amount">
                {t("a2aFund.amount", { amount: usdc.toFixed(2) })}
              </label>
              <Input
                id="fund-amount"
                inputMode="decimal"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                placeholder={t("a2aFund.placeholder")}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {["0.1", "1", "5"].map((value) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setFundAmount(value)}
                >
                  {value}
                </Button>
              ))}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setFundAmount(String(usdc))}
              >
                {t("a2aFund.all")}
              </Button>
            </div>
            <Button type="submit" className="w-full">
              <ArrowRightLeft className="h-4 w-4" aria-hidden />
              {t("a2aFund.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={fundOpen} onOpenChange={setFundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("a2aFund.confirmTitle")}</DialogTitle>
            <DialogDescription>{t("a2aFund.confirmBody")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-1 text-sm">
            <ConfirmRow label={t("a2aFund.confirmAmount")} value={`${fundAmount} USDC`} />
            <ConfirmRow label={t("a2aFund.confirmAvailable")} value={`${usdc.toFixed(2)} USDC`} />
            <ConfirmRow label={t("a2aFund.confirmUse")} value={t("a2aFund.confirmUseValue")} />
          </div>
          <DialogFooter className="sm:flex-col">
            <Button type="button" className="w-full" onClick={() => void onConfirmFund()}>
              <ArrowRightLeft className="h-4 w-4" aria-hidden />
              {t("a2aFund.confirm")}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => setFundOpen(false)}>
              {t("a2aFund.cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Confirmation dialog key/value row.
 * @param label - Field label
 * @param value - Field value
 */
function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
