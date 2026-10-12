import { useMemo } from "react";
import { ArrowDownLeft, ArrowUpRight, Bot, CreditCard } from "lucide-react";
import { LedgerTablePage } from "@/features/wallet/ledger-table-page";
import { useI18n } from "@/hooks/use-i18n";
import { useWalletTransactions } from "@/hooks/use-wallet-transactions";
import { useA2AStore } from "@/stores/a2a";

/**
 * Incoming transfers from chain history and local records.
 */
export function ReceiveLedgerPage() {
  const { t } = useI18n();
  const { rows, isLoading } = useWalletTransactions();
  const filtered = useMemo(
    () => rows.filter((item) => item.direction === "in"),
    [rows],
  );

  return (
    <LedgerTablePage
      icon={ArrowDownLeft}
      title={t("ledger.receiveTitle")}
      emptyText={isLoading ? t("ledger.loading") : t("ledger.emptyReceive")}
      rows={filtered}
      showTitleColumn={false}
    />
  );
}

/**
 * Outgoing transfers, excluding A2A settlements.
 */
export function PaymentLedgerPage() {
  const { t } = useI18n();
  const { rows, isLoading } = useWalletTransactions();
  const filtered = useMemo(
    () => rows.filter((item) => item.direction === "out" && item.kind !== "a2a"),
    [rows],
  );

  return (
    <LedgerTablePage
      icon={ArrowUpRight}
      title={t("ledger.transferTitle")}
      emptyText={isLoading ? t("ledger.loading") : t("ledger.emptyTransfer")}
      rows={filtered}
      showTitleColumn={false}
    />
  );
}

/**
 * All outgoing payments, including A2A.
 */
export function PayLedgerPage() {
  const { t } = useI18n();
  const { rows, isLoading } = useWalletTransactions();
  const a2aLedger = useA2AStore((s) => s.ledger);
  const filtered = useMemo(() => {
    const outgoing = rows.filter((item) => item.direction === "out");
    const seen = new Set(outgoing.map((item) => item.id));
    const a2a = (a2aLedger ?? []).filter(
      (item) => item.kind === "a2a" && !seen.has(item.id),
    );
    return [...outgoing, ...a2a].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [rows, a2aLedger]);

  return (
    <LedgerTablePage
      icon={CreditCard}
      title={t("ledger.payTitle")}
      emptyText={isLoading ? t("ledger.loading") : t("ledger.emptyPay")}
      rows={filtered}
    />
  );
}

/**
 * A2A dynamic-quote settlements.
 */
export function A2ALedgerPage() {
  const { t } = useI18n();
  const ledger = useA2AStore((s) => s.ledger);
  const rows = useMemo(
    () => (ledger ?? []).filter((item) => item.kind === "a2a"),
    [ledger],
  );

  return (
    <LedgerTablePage
      icon={Bot}
      title={t("ledger.a2aTitle")}
      emptyText={t("ledger.emptyA2a")}
      rows={rows}
    />
  );
}
