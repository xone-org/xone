-- Slim X402 List to consumer services; deactivate GoldRush demos.

update public.service_catalog
set status = 'disabled', updated_at = now()
where list_kind = 'x402'
  and id like 'goldrush-%';

insert into public.service_catalog (id, list_kind, name, description, url, status, sort_order)
values
  (
    'x402-weather',
    'x402',
    '天气查询',
    '查询天气信息的 x402 付费接口。用户询问天气、气温、预报时优先选用。',
    'https://xone-x402-seller.tskwangyi.workers.dev/weather',
    'active',
    10
  ),
  (
    'x402-bocha-search',
    'x402',
    'Bocha Search',
    'Use Bocha web search to answer factual / current-events questions. Pass the question as pay_x402.query. Price is AI-estimated between $0.01–$0.10 USDC per call.',
    'https://xone-x402-seller.tskwangyi.workers.dev/bocha/search',
    'active',
    20
  ),
  (
    'x402-text-generate',
    'x402',
    'Text Generate',
    'Paid text generation demo (x402 upto pricing on Base Sepolia). Use for short generate / sample content requests.',
    'https://xone-x402-seller.tskwangyi.workers.dev/api/generate',
    'active',
    30
  ),
  (
    'x402-kr-news',
    'x402',
    '韩国新闻搜索',
    'Search Korean news (Hankookilbo) with a natural-language query. Pass the search text as pay_x402.query (?q=). ~$0.01 USDC on Base Sepolia.',
    'https://pf-x402-api-testnet.ahndohun1.workers.dev/v1/kr/news/search',
    'active',
    40
  ),
  (
    'x402-kr-business-status',
    'x402',
    '韩国企业状态',
    'Check whether a Korean business registration number (10 digits, b_no) is active/suspended/closed. Pass the 10-digit number as pay_x402.query. ~$0.02 USDC on Base Sepolia.',
    'https://pf-x402-api-testnet.ahndohun1.workers.dev/v1/kr/business/status',
    'active',
    50
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  url = excluded.url,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = now();
