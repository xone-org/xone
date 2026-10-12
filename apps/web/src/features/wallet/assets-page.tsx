import { Link } from "react-router-dom";
import { Coins } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/hooks/use-i18n";
import { useWalletBalances } from "@/hooks/use-wallet-balances";

/**
 * Formats a token balance with stable decimals.
 * @param symbol - Asset symbol
 * @param value - Raw display value
 */
function formatAssetAmount(symbol: string, value: string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value;
  const maximumFractionDigits = symbol === "USDC" ? 2 : 4;
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  });
}

/**
 * Asset list for the current network.
 */
export function AssetsPage() {
  const { t } = useI18n();
  const { balances, isLoading } = useWalletBalances();
  const assets = balances.length
    ? [...balances].sort((a, b) => (a.symbol === "USDC" ? -1 : b.symbol === "USDC" ? 1 : 0))
    : [
        { symbol: "USDC", name: "USD Coin", displayValue: "0" },
        { symbol: "ETH", name: "Ether", displayValue: "0" },
      ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 animate-in">
      <PageHeader icon={Coins} title={t("assets.title")} tone="slate" />

      <div className="divide-y divide-border rounded-md border border-border bg-white fade-up">
        {assets.map((asset) => (
          <div key={asset.symbol} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <div className="min-w-0">
              <p className="font-medium">{asset.symbol}</p>
              <p className="text-xs text-muted-foreground">
                {asset.symbol === "ETH" ? `${asset.name} · ${t("assets.gasHint")}` : asset.name}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {isLoading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <p className="font-mono tabular-nums">
                  {formatAssetAmount(asset.symbol, asset.displayValue)}
                </p>
              )}
              {asset.symbol === "USDC" ? (
                <div className="flex gap-1">
                  <Button type="button" size="sm" variant="outline" asChild>
                    <Link to="/app/send">{t("assets.send")}</Link>
                  </Button>
                  <Button type="button" size="sm" variant="outline" asChild>
                    <Link to="/app/receive">{t("assets.receive")}</Link>
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
