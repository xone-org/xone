import { useState, type FormEvent } from "react";
import {
  Hotel,
  Power,
  Save,
  SlidersHorizontal,
  TrainFront,
  UtensilsCrossed,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/use-i18n";
import type { MessageKey } from "@/lib/i18n/messages";
import { useA2AStore, type ConnectedAgent } from "@/stores/a2a";
import { cn } from "@/lib/utils";

const AGENT_ICONS: Record<string, LucideIcon> = {
  "agent-rail": TrainFront,
  "agent-hotel": Hotel,
  "agent-food": UtensilsCrossed,
};

const AGENT_COPY: Record<string, { name: MessageKey; category: MessageKey; nameZh: string; categoryZh: string; nameEn: string; categoryEn: string }> = {
  "agent-rail": {
    name: "a2a.agent.rail",
    category: "a2a.category.travel",
    nameZh: "车票预订 Agent",
    nameEn: "Rail booking",
    categoryZh: "出行",
    categoryEn: "Travel",
  },
  "agent-hotel": {
    name: "a2a.agent.hotel",
    category: "a2a.category.stay",
    nameZh: "酒店预订 Agent",
    nameEn: "Hotel booking",
    categoryZh: "住宿",
    categoryEn: "Stay",
  },
  "agent-food": {
    name: "a2a.agent.food",
    category: "a2a.category.daily",
    nameZh: "餐饮外卖 Agent",
    nameEn: "Food delivery",
    categoryZh: "生活",
    categoryEn: "Daily",
  },
};

/**
 * Shows the built-in label when the stored value is still a default.
 * @param stored - Value from the account
 * @param defaults - Known seed strings
 * @param translated - Locale-specific label
 */
function preferTranslated(stored: string, defaults: string[], translated: string): string {
  return defaults.includes(stored) ? translated : stored;
}

/**
 * Spend limits for connected agents. Editing stays collapsed until requested.
 */
export function A2APayPage() {
  const { t } = useI18n();
  const agents = useA2AStore((s) => s.agents);
  const setAgentEnabled = useA2AStore((s) => s.setAgentEnabled);
  const updateAgentLimits = useA2AStore((s) => s.updateAgentLimits);

  const [toast, setToast] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { maxAmount: string; maxSingle: string }>>(
    {},
  );

  /**
   * Shows a short-lived feedback banner.
   */
  function showToast(tone: "ok" | "err", text: string) {
    setToast({ tone, text });
    window.setTimeout(() => setToast(null), 2800);
  }

  /**
   * Returns editable draft limits for an agent, falling back to stored values.
   */
  function getDraft(agent: ConnectedAgent) {
    return (
      drafts[agent.id] ?? {
        maxAmount: String(agent.maxAmount),
        maxSingle: String(agent.maxSinglePayment),
      }
    );
  }

  /**
   * Persists limit fields for one agent.
   */
  async function onSaveLimits(event: FormEvent, agent: ConnectedAgent) {
    event.preventDefault();
    const draft = getDraft(agent);
    const error = await updateAgentLimits(
      agent.id,
      Number(draft.maxAmount),
      Number(draft.maxSingle),
    );
    if (error) {
      showToast("err", error);
      return;
    }
    setEditingId(null);
    showToast("ok", t("a2a.saved", { name: agentTitle(agent) }));
  }

  /**
   * Locale label for a known agent, or the stored name.
   */
  function agentTitle(agent: ConnectedAgent): string {
    const copy = AGENT_COPY[agent.id];
    if (!copy) return agent.name;
    return preferTranslated(agent.name, [copy.nameZh, copy.nameEn, t(copy.name)], t(copy.name));
  }

  /**
   * Locale category for a known agent, or the stored category.
   */
  function agentCategory(agent: ConnectedAgent): string {
    const copy = AGENT_COPY[agent.id];
    if (!copy) return agent.category;
    return preferTranslated(
      agent.category,
      [copy.categoryZh, copy.categoryEn, t(copy.category)],
      t(copy.category),
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 animate-in">
      <PageHeader icon={SlidersHorizontal} title={t("a2a.limitsTitle")} tone="slate" />
      <p className="-mt-3 text-sm text-muted-foreground">{t("a2a.limitsHint")}</p>

      {toast ? (
        <div
          className={cn(
            "message-in rounded-md border px-4 py-3 text-sm",
            toast.tone === "ok"
              ? "border-border bg-muted"
              : "border-[var(--color-destructive)]/30 bg-red-50 text-destructive",
          )}
          role="status"
        >
          {toast.text}
        </div>
      ) : null}

      <div className="space-y-4">
        {agents.map((agent) => {
          const draft = getDraft(agent);
          const Icon = AGENT_ICONS[agent.id] ?? WalletCards;
          const editing = editingId === agent.id;
          const cap = agent.maxAmount > 0 ? agent.maxAmount : 0;
          const ratio = cap > 0 ? Math.min(1, agent.spentAmount / cap) : 0;
          const dirty =
            Number(draft.maxAmount) !== agent.maxAmount ||
            Number(draft.maxSingle) !== agent.maxSinglePayment;
          const draftValid =
            Number.isFinite(Number(draft.maxAmount)) &&
            Number(draft.maxAmount) > 0 &&
            Number.isFinite(Number(draft.maxSingle)) &&
            Number(draft.maxSingle) > 0;

          return (
            <Card key={agent.id}>
              <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted">
                      <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    <CardTitle>{agentTitle(agent)}</CardTitle>
                    <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                      {agentCategory(agent)}
                    </span>
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs",
                        agent.enabled
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {agent.enabled ? t("a2a.enabled") : t("a2a.disabled")}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("a2a.spent", { spent: agent.spentAmount, max: agent.maxAmount })}
                    </p>
                    <div
                      className="mt-2 h-1 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={agent.maxAmount}
                      aria-valuenow={agent.spentAmount}
                    >
                      <div
                        className="h-full bg-foreground"
                        style={{ width: `${ratio * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingId(editing ? null : agent.id)}
                  >
                    {editing ? t("a2a.hideLimits") : t("a2a.editLimits")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={agent.enabled ? "outline" : "default"}
                    onClick={() => void setAgentEnabled(agent.id, !agent.enabled)}
                  >
                    <Power className="h-3.5 w-3.5" aria-hidden />
                    {agent.enabled ? t("a2a.pause") : t("a2a.enable")}
                  </Button>
                </div>
              </CardHeader>
              {editing ? (
                <CardContent>
                  <form
                    className="grid gap-4 sm:grid-cols-2"
                    onSubmit={(e) => void onSaveLimits(e, agent)}
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor={`${agent.id}-max`}>
                        {t("a2a.totalCap")}
                      </label>
                      <Input
                        id={`${agent.id}-max`}
                        inputMode="decimal"
                        value={draft.maxAmount}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [agent.id]: { ...getDraft(agent), maxAmount: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor={`${agent.id}-single`}>
                        {t("a2a.perPayment")}
                      </label>
                      <Input
                        id={`${agent.id}-single`}
                        inputMode="decimal"
                        value={draft.maxSingle}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [agent.id]: { ...getDraft(agent), maxSingle: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Button type="submit" disabled={!dirty || !draftValid}>
                        <Save className="h-3.5 w-3.5" aria-hidden />
                        {t("a2a.save")}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
