import { useState } from "react";
import { Check, Copy, QrCode } from "lucide-react";
import { DEFAULT_CHAIN } from "@xone/config";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { useWalletAccount } from "@/hooks/use-wallet-account";
import { useI18n } from "@/hooks/use-i18n";

/**
 * Receive screen: address and QR code.
 */
export function ReceivePage() {
  const { t } = useI18n();
  const { address } = useWalletAccount();
  const walletAddress = address ?? "";
  const [copied, setCopied] = useState(false);

  /**
   * Copies the wallet address to the clipboard.
   */
  async function copyAddress() {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 animate-in">
      <PageHeader icon={QrCode} title={t("receive.title")} tone="slate" />

      <Card className="fade-up">
        <CardHeader>
          <CardTitle>{t("receive.cardTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("receive.warning", { chain: DEFAULT_CHAIN.name })}
          </p>

          {walletAddress ? (
            <div className="flex items-center gap-3 rounded-md border border-border bg-muted p-4">
              <AddressIdenticon address={walletAddress} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{t("receive.address")}</p>
                <p className="mt-1 break-all font-mono text-sm">{walletAddress}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-border bg-muted p-4 text-center text-sm text-muted-foreground">
              {t("receive.notConnected")}
            </div>
          )}

          <div className="flex items-center justify-center rounded-md border border-border bg-white p-6">
            {walletAddress ? (
              <QRCodeSVG
                value={walletAddress}
                size={220}
                level="M"
                bgColor="#ffffff"
                fgColor="#0a0a0a"
                marginSize={1}
                title={t("receive.qrTitle")}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{t("receive.qrEmpty")}</p>
            )}
          </div>
          <Button className="w-full" onClick={copyAddress} disabled={!walletAddress}>
            {copied ? (
              <>
                <Check className="h-4 w-4" aria-hidden />
                {t("receive.copied")}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden />
                {t("receive.copy")}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Neutral identicon derived from the address (grayscale only).
 * @param address - Wallet address
 */
function AddressIdenticon({ address }: { address: string }) {
  const tone = (Number.parseInt(address.slice(2, 4), 16) % 55) + 22;
  return (
    <div
      className="h-10 w-10 shrink-0 rounded-full border border-border"
      style={{ background: `hsl(0 0% ${tone}%)` }}
      aria-hidden
    />
  );
}
