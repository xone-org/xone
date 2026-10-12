import { useMemo, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getTxExplorerUrl } from "@xone/config";
import { ArrowLeftRight, ExternalLink, Eye, LoaderCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSendAsset } from "@/hooks/use-send-asset";
import { useI18n } from "@/hooks/use-i18n";
import { useWalletAccount } from "@/hooks/use-wallet-account";
import { useWalletBalances } from "@/hooks/use-wallet-balances";
import type { MessageKey } from "@/lib/i18n/messages";
import { recordTransferOnServer } from "@/lib/record-transfer";
import { useA2AStore } from "@/stores/a2a";
import {
  buildSendTransaction,
  estimateSendFee,
  prepareSendPreview,
  type PreparedSend,
} from "@/web3";

/**
 * Send flow: preview, then Privy signature.
 */
export function SendPage() {
  const { t } = useI18n();
  const { address } = useWalletAccount();
  const { sendAsset } = useSendAsset();
  const queryClient = useQueryClient();
  const { usdc, eth, refetch } = useWalletBalances();
  const recordTransfer = useA2AStore((s) => s.recordTransfer);

  const [asset, setAsset] = useState("USDC");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [preview, setPreview] = useState<PreparedSend | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const available = asset === "ETH" ? eth : usdc;
  const confirmOpen = preview != null;

  const transaction = useMemo(() => {
    if (!preview) return null;
    try {
      return buildSendTransaction(preview.to, preview.amount, preview.asset);
    } catch (err) {
      return err instanceof Error ? err : new Error(t("send.buildFailed"));
    }
  }, [preview, t]);

  /**
   * Builds a transaction preview with a live gas estimate, then opens confirm dialog.
   */
  async function onPreview(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setTxHash(null);
    setPreview(null);

    if (!address) {
      setError(t("send.connectFirst"));
      return;
    }

    if (Number(amount) > available) {
      setError(t("send.insufficient", { asset, amount: available }));
      return;
    }

    const trimmedTo = to.trim();
    const trimmedAmount = amount.trim();

    try {
      buildSendTransaction(trimmedTo, trimmedAmount, asset);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("send.previewFailed"));
      return;
    }

    setEstimating(true);
    try {
      const estimatedFee = await estimateSendFee(
        trimmedTo,
        trimmedAmount,
        asset,
        address,
      );
      setPreview(prepareSendPreview(trimmedTo, trimmedAmount, asset, estimatedFee));
    } catch (err) {
      console.warn("[send] fee estimate failed", err);
      setPreview(
        prepareSendPreview(trimmedTo, trimmedAmount, asset, t("send.feeUnknown")),
      );
    } finally {
      setEstimating(false);
    }
  }

  /**
   * Signs and broadcasts the prepared transfer.
   */
  async function onConfirmSend() {
    if (!preview || !address || transaction instanceof Error || !transaction) return;
    setSending(true);
    setError(null);
    try {
      const hash = await sendAsset(preview.to, preview.amount, preview.asset);
      setTxHash(hash);
      const sentAsset = preview.asset === "ETH" ? "ETH" : "USDC";
      recordTransfer({
        from: address,
        to: preview.to,
        amount: preview.amount,
        asset: sentAsset,
        txHash: hash,
      });
      void recordTransferOnServer({
        txHash: hash,
        from: address,
        to: preview.to,
        amount: preview.amount,
        asset: sentAsset,
        status: "submitted",
      })
        .catch((err) => {
          console.warn("[send] backend ledger record failed", err);
        })
        .finally(() => {
          void queryClient.invalidateQueries({
            queryKey: ["wallet-txs"],
          });
        });
      setPreview(null);
      void refetch();
      void queryClient.invalidateQueries({
        queryKey: ["wallet-txs", address.toLowerCase()],
      });
    } catch (err) {
      setError(friendlySendError(err instanceof Error ? err.message : String(err), t));
    } finally {
      setSending(false);
    }
  }

  /**
   * Closes the confirm dialog without sending.
   * @param open - Dialog open state from Radix
   */
  function onConfirmOpenChange(open: boolean) {
    if (!open && !sending) setPreview(null);
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 animate-in">
      <PageHeader icon={ArrowLeftRight} title={t("send.title")} tone="slate" />

      <Card className="fade-up">
        <CardContent className="pt-6">
          <form className="space-y-4" onSubmit={onPreview}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="asset">
                {t("send.asset")}
              </label>
              <Select
                value={asset}
                onValueChange={(v) => {
                  setAsset(v);
                  setPreview(null);
                }}
              >
                <SelectTrigger id="asset" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">
                    {t("send.available", { asset: "ETH", amount: eth })}
                  </SelectItem>
                  <SelectItem value="USDC">
                    {t("send.available", { asset: "USDC", amount: usdc })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="to">
                {t("send.recipient")}
              </label>
              <Input
                id="to"
                placeholder="0x…"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium" htmlFor="amount">
                  {t("send.amount")}
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setAmount(String(available))}
                >
                  {t("send.max")}
                </Button>
              </div>
              <Input
                id="amount"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={estimating}>
              {estimating ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                  {t("send.estimating")}
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" aria-hidden />
                  {t("send.preview")}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={onConfirmOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("send.confirmTitle")}</DialogTitle>
            <DialogDescription>{t("send.confirmBody")}</DialogDescription>
          </DialogHeader>

          {preview ? (
            <div className="space-y-1 text-sm">
              <Row label={t("send.recipientRow")} value={preview.to} mono />
              <Row label={t("send.assetRow")} value={preview.asset} />
              <Row label={t("send.amountRow")} value={preview.amount} />
              <Row label={t("send.network")} value={preview.chain} />
              <Row label={t("send.fee")} value={preview.estimatedFee} />
            </div>
          ) : null}

          <DialogFooter className="sm:flex-col">
            {transaction instanceof Error ? (
              <p className="text-sm text-destructive" role="alert">
                {transaction.message}
              </p>
            ) : transaction ? (
              <Button
                type="button"
                className="w-full"
                disabled={sending}
                onClick={() => void onConfirmSend()}
              >
                {sending ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                    {t("send.sending")}
                  </>
                ) : (
                  t("send.confirm")
                )}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={sending}
              onClick={() => setPreview(null)}
            >
              {t("send.cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {txHash ? (
        <Card className="message-in">
          <CardContent className="space-y-2 pt-6 text-sm">
            <p className="font-medium">{t("send.submitted")}</p>
            <a
              href={getTxExplorerUrl(txHash)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 break-all font-mono text-xs text-(--color-foreground) underline-offset-2 hover:underline"
            >
              {txHash}
              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
            </a>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <p className="text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Maps common chain errors into user-facing copy.
 * @param message - Raw error message
 * @param t - Translator
 */
function friendlySendError(
  message: string,
  t: (key: MessageKey, vars?: Record<string, string | number>) => string,
): string {
  const lower = message.toLowerCase();
  if (lower.includes("insufficient funds") || lower.includes("exceeds balance")) {
    return t("send.errFunds");
  }
  if (lower.includes("user rejected") || lower.includes("denied") || lower.includes("cancelled")) {
    return t("send.errRejected");
  }
  if (lower.includes("execution reverted")) {
    return t("send.errReverted");
  }
  return message;
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "break-all text-right font-mono text-xs" : "text-right"}>
        {value}
      </span>
    </div>
  );
}
