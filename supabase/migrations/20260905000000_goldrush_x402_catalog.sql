-- Seed 20 GoldRush x402 demo endpoints (Base Sepolia settlement per GoldRush x402 config).
-- Concrete URLs only — templates with {placeholders} are not valid List entries.

insert into public.service_catalog (id, list_kind, name, description, url, status, sort_order)
values
  (
    'goldrush-native-balance',
    'x402',
    'Native balance',
    'Query native token balance for an address (demo: Vitalik on Base). Use when the user asks for ETH/native balance on Base.',
    'https://x402.goldrush.dev/v1/base-mainnet/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/balances_native/',
    'active',
    100
  ),
  (
    'goldrush-token-balances',
    'x402',
    'Token balances',
    'Fetch native + ERC-20 balances with spot prices for an address on Base.',
    'https://x402.goldrush.dev/v1/base-mainnet/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/balances_v2/',
    'active',
    110
  ),
  (
    'goldrush-nfts',
    'x402',
    'NFTs for address',
    'List ERC-721 / ERC-1155 NFTs held by an address on Base.',
    'https://x402.goldrush.dev/v1/base-mainnet/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/balances_nft/',
    'active',
    120
  ),
  (
    'goldrush-approvals',
    'x402',
    'Token approvals',
    'List ERC-20 / NFT approvals (spenders) for a wallet on Base. Use for approval / allowance security checks.',
    'https://x402.goldrush.dev/v1/base-mainnet/approvals/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/',
    'active',
    130
  ),
  (
    'goldrush-tx-summary',
    'x402',
    'Tx summary',
    'Earliest/latest tx, count, and gas spend summary for a wallet on Base.',
    'https://x402.goldrush.dev/v1/base-mainnet/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/transactions_summary/',
    'active',
    140
  ),
  (
    'goldrush-recent-txs',
    'x402',
    'Recent transactions',
    'Most recent transactions for an address on Base (decoded logs where available).',
    'https://x402.goldrush.dev/v1/base-mainnet/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/transactions_v3/',
    'active',
    150
  ),
  (
    'goldrush-address-activity',
    'x402',
    'Multichain activity',
    'Which chains an address is active on (single call). Use for “which networks does this wallet use?”.',
    'https://x402.goldrush.dev/v1/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/activity/',
    'active',
    160
  ),
  (
    'goldrush-allchains-balances',
    'x402',
    'Multichain balances',
    'Paginated native/token balances for one address across multiple EVM chains.',
    'https://x402.goldrush.dev/v1/allchains/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/balances/',
    'active',
    170
  ),
  (
    'goldrush-gas-prices',
    'x402',
    'Gas prices',
    'Real-time gas estimates on Base for ERC-20 style transfers. Use when the user asks about gas fees.',
    'https://x402.goldrush.dev/v1/base-mainnet/event/erc20/gas_prices/',
    'active',
    180
  ),
  (
    'goldrush-all-chains',
    'x402',
    'All chains',
    'List chains supported by GoldRush / Covalent. Use for “which chains are supported?”.',
    'https://x402.goldrush.dev/v1/chains/',
    'active',
    190
  ),
  (
    'goldrush-chain-statuses',
    'x402',
    'Chain statuses',
    'Status dashboard of all supported chains (sync health).',
    'https://x402.goldrush.dev/v1/chains/status/',
    'active',
    200
  ),
  (
    'goldrush-token-metadata',
    'x402',
    'USDC metadata',
    'ERC-20 contract metadata (liquidity, market cap, quotes) for USDC on Base.',
    'https://x402.goldrush.dev/v1/base-mainnet/tokens/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913/token_contract_metadata/',
    'active',
    210
  ),
  (
    'goldrush-historical-prices',
    'x402',
    'Historical USDC prices',
    'Historical large-cap token prices (USDC on Base, USD quote).',
    'https://x402.goldrush.dev/v1/pricing/historical_by_addresses_v2/base-mainnet/USD/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913/',
    'active',
    220
  ),
  (
    'goldrush-historical-balances',
    'x402',
    'Historical balances',
    'Historical native + ERC-20 balances for an address on Base (with daily prices).',
    'https://x402.goldrush.dev/v1/base-mainnet/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/historical_balances/',
    'active',
    230
  ),
  (
    'goldrush-portfolio',
    'x402',
    'Portfolio over time',
    'Daily portfolio value broken down by token for an address (default ~30 days).',
    'https://x402.goldrush.dev/v1/base-mainnet/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/portfolio_v2/',
    'active',
    240
  ),
  (
    'goldrush-erc20-transfers',
    'x402',
    'ERC-20 transfers',
    'ERC-20 transfer-in/out history with historical prices for an address on Base.',
    'https://x402.goldrush.dev/v1/base-mainnet/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/transfers_v2/',
    'active',
    250
  ),
  (
    'goldrush-block',
    'x402',
    'Get a block',
    'Fetch a single block by height on Base (demo height 20000000). Use for block explorer style queries.',
    'https://x402.goldrush.dev/v1/base-mainnet/block_v2/20000000/',
    'active',
    260
  ),
  (
    'goldrush-block-heights',
    'x402',
    'Block heights by date',
    'Block heights within a date range on Base (demo: 2024-01-01 to 2024-01-02).',
    'https://x402.goldrush.dev/v1/base-mainnet/block_v2/2024-01-01/2024-01-02/',
    'active',
    270
  ),
  (
    'goldrush-resolve-ens',
    'x402',
    'Resolve address (ENS)',
    'Resolve ENS / similar names to an address (demo wallet on Ethereum mainnet).',
    'https://x402.goldrush.dev/v1/eth-mainnet/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/resolve_address/',
    'active',
    280
  ),
  (
    'goldrush-top-holders',
    'x402',
    'Top USDC holders',
    'Top token holders over time for USDC on Base (25/day, last 30 days).',
    'https://x402.goldrush.dev/v1/base-mainnet/tokens/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913/top_holders/',
    'active',
    290
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  url = excluded.url,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = now();
