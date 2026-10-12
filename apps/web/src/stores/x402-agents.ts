import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchServiceCatalog } from "@/lib/service-catalog-api";

/** Shared x402 catalog entry (name / URL / description are platform-owned). */
export type X402Agent = {
  id: string;
  name: string;
  /** Absolute x402 resource URL. */
  url: string;
  /** What this endpoint does (for the model + UI). */
  description: string;
  enabled: boolean;
};

const SELLER = "https://xone-x402-seller.tskwangyi.workers.dev";
/** PocketFactory Korean public-data APIs (Base Sepolia testnet host). */
const PF_KR = "https://pf-x402-api-testnet.ahndohun1.workers.dev";

/**
 * Fallback when API is unreachable (matches DB seed — consumer-oriented x402).
 */
export const SHARED_X402_CATALOG: Omit<X402Agent, "enabled">[] = [
  {
    id: "x402-weather",
    name: "天气查询",
    url: `${SELLER}/weather`,
    description:
      "查询天气信息的 x402 付费接口。用户询问天气、气温、预报时优先选用。",
  },
  {
    id: "x402-bocha-search",
    name: "Bocha Search",
    url: `${SELLER}/bocha/search`,
    description:
      "Use Bocha web search to answer factual / current-events questions. Pass the question as pay_x402.query. Price is AI-estimated between $0.01–$0.10 USDC per call.",
  },
  {
    id: "x402-text-generate",
    name: "Text Generate",
    url: `${SELLER}/api/generate`,
    description:
      "Paid text generation demo (x402 upto pricing on Base Sepolia). Use for short generate / sample content requests.",
  },
  {
    id: "x402-kr-news",
    name: "韩国新闻搜索",
    url: `${PF_KR}/v1/kr/news/search`,
    description:
      "Search Korean news (Hankookilbo) with a natural-language query. Pass the search text as pay_x402.query (?q=). ~$0.01 USDC on Base Sepolia.",
  },
  {
    id: "x402-kr-business-status",
    name: "韩国企业状态",
    url: `${PF_KR}/v1/kr/business/status`,
    description:
      "Check whether a Korean business registration number (10 digits, b_no) is active/suspended/closed. Pass the 10-digit number as pay_x402.query. ~$0.02 USDC on Base Sepolia.",
  },
];

type X402AgentsState = {
  /** Per-id enabled overrides (missing = default enabled). */
  enabledById: Record<string, boolean>;
  catalog: Omit<X402Agent, "enabled">[];
  agents: X402Agent[];
  loading: boolean;
  error: string | null;
  /**
   * Reloads catalog from wallet-api (admin-managed).
   */
  refreshCatalog: () => Promise<void>;
  /**
   * Toggles enabled for a catalog entry.
   * @param id - Catalog id
   */
  toggleEnabled: (id: string) => void;
};

/**
 * Resolves catalog rows with user enable overrides.
 * @param catalog - Platform rows
 * @param enabledById - Overrides (missing = enabled)
 */
function resolveAgents(
  catalog: Omit<X402Agent, "enabled">[],
  enabledById: Record<string, boolean>,
): X402Agent[] {
  return catalog.map((item) => ({
    ...item,
    enabled: enabledById[item.id] ?? true,
  }));
}

/**
 * X402 List catalog store (Service List → X402 List).
 */
export const useX402AgentsStore = create<X402AgentsState>()(
  persist(
    (set, get) => ({
      enabledById: {},
      catalog: SHARED_X402_CATALOG,
      agents: resolveAgents(SHARED_X402_CATALOG, {}),
      loading: false,
      error: null,

      async refreshCatalog() {
        set({ loading: true, error: null });
        try {
          const items = await fetchServiceCatalog("x402");
          const catalog =
            items.length > 0
              ? items.map((i) => ({
                  id: i.id,
                  name: i.name,
                  url: i.url,
                  description: i.description,
                }))
              : SHARED_X402_CATALOG;
          set({
            catalog,
            agents: resolveAgents(catalog, get().enabledById),
            loading: false,
            error: null,
          });
        } catch (err) {
          set({
            loading: false,
            error: err instanceof Error ? err.message : "Failed to load catalog",
          });
        }
      },

      toggleEnabled(id) {
        const enabledById = {
          ...get().enabledById,
          [id]: !(get().enabledById[id] ?? true),
        };
        set({
          enabledById,
          agents: resolveAgents(get().catalog, enabledById),
        });
      },
    }),
    {
      name: "xone-x402-agents",
      partialize: (s) => ({ enabledById: s.enabledById }),
    },
  ),
);
