import type { LucideIcon } from "lucide-react";
import { ExternalLink } from "lucide-react";
import { getTxExplorerUrl } from "@xone/config";
import { PageHeader } from "@/components/layout/page-header";
import { TablePagination } from "@/components/layout/table-pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClientPagination } from "@/hooks/use-client-pagination";
import { useI18n } from "@/hooks/use-i18n";
import type { MessageKey } from "@/lib/i18n/messages";
import type { LedgerRecord } from "@/stores/a2a";

type LedgerTablePageProps = {
  icon: LucideIcon;
  title: string;
  emptyText: string;
  rows: LedgerRecord[];
  /** Show signed amount with + / - based on direction. */
  signedAmount?: boolean;
  /** Whether to show the title column (kept for A2A order labels). */
  showTitleColumn?: boolean;
};

/**
 * Shared ledger detail page rendered as a table.
 */
export function LedgerTablePage({
  icon,
  title,
  emptyText,
  rows,
  signedAmount = true,
  showTitleColumn = true,
}: LedgerTablePageProps) {
  const { t, locale } = useI18n();
  const pager = useClientPagination(rows);
  const dateLocale = locale === "zh" ? "zh-CN" : "en";

  return (
    <div className="w-full max-w-5xl space-y-6 animate-in md:mx-0">
      <PageHeader icon={icon} title={title} tone="slate" />

      <Card className="fade-up overflow-hidden">
        <CardContent className="p-6">
          {rows.length === 0 ? (
            <Empty className="border-0 py-10 md:py-12">
              <EmptyHeader>
                <EmptyTitle>{emptyText}</EmptyTitle>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("ledger.time")}</TableHead>
                    {showTitleColumn ? <TableHead>{t("ledger.titleCol")}</TableHead> : null}
                    <TableHead>{t("ledger.counterparty")}</TableHead>
                    <TableHead>{t("ledger.amount")}</TableHead>
                    <TableHead>{t("ledger.status")}</TableHead>
                    <TableHead>{t("ledger.tx")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pager.pageItems.map((item) => (
                    <TableRow key={item.id} className="message-in">
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString(dateLocale)}
                      </TableCell>
                      {showTitleColumn ? (
                        <TableCell className="font-medium">{item.title}</TableCell>
                      ) : null}
                      <TableCell className="max-w-[160px] truncate">{item.counterparty}</TableCell>
                      <TableCell className="font-mono whitespace-nowrap">
                        {signedAmount ? (item.direction === "in" ? "+" : "-") : ""}
                        {item.amount} {item.asset}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} label={ledgerStatusLabel(item.status, t)} />
                      </TableCell>
                      <TableCell className="max-w-[240px]">
                        <TxHashCell note={item.note} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                page={pager.page}
                pageCount={pager.pageCount}
                total={pager.total}
                pageSize={pager.pageSize}
                canPrev={pager.canPrev}
                canNext={pager.canNext}
                onPrev={pager.onPrev}
                onNext={pager.onNext}
                onPageChange={pager.setPage}
                onPageSizeChange={pager.setPageSize}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Renders a tx hash as an explorer link when possible.
 * @param note - Ledger note, usually a 0x hash
 */
function TxHashCell({ note }: { note: string }) {
  const hash = note.trim();
  if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
    return (
      <span className="truncate text-muted-foreground" title={note}>
        {note}
      </span>
    );
  }
  const url = getTxExplorerUrl(hash);
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex max-w-full items-center gap-1 font-mono text-xs text-muted-foreground underline-offset-2 hover:underline"
      title={hash}
    >
      <span className="truncate">
        {hash.slice(0, 10)}…{hash.slice(-8)}
      </span>
      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
    </a>
  );
}

const STATUS_KEYS: Record<string, MessageKey> = {
  success: "ledger.status.success",
  confirmed: "ledger.status.confirmed",
  pending: "ledger.status.pending",
  submitted: "ledger.status.submitted",
  failed: "ledger.status.failed",
  blocked: "ledger.status.blocked",
  rejected: "ledger.status.rejected",
};

/**
 * User-facing label for a ledger status, falling back to the raw value.
 * @param status - Ledger status string
 * @param t - Translator
 */
function ledgerStatusLabel(
  status: string,
  t: (key: MessageKey) => string,
): string {
  const key = STATUS_KEYS[status];
  return key ? t(key) : status;
}

/**
 * Compact status badge for ledger rows.
 * @param status - Ledger status string
 * @param label - Translated status
 */
function StatusBadge({ status, label }: { status: string; label: string }) {
  const variant =
    status === "confirmed" || status === "success"
      ? "default"
      : status === "failed" || status === "rejected"
        ? "destructive"
        : "secondary";
  return <Badge variant={variant}>{label}</Badge>;
}
