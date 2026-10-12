-- Add Weather + Text Generate to Agent List (own x402 seller, Base Sepolia).

insert into public.service_catalog (id, list_kind, name, description, url, status, sort_order)
values
  (
    'agent-weather',
    'agent',
    'Weather',
    'Paid weather report agent (Base Sepolia x402). Prefer when the user asks about weather, temperature, or forecast.',
    'https://xone-x402-seller.tskwangyi.workers.dev/weather',
    'active',
    20
  ),
  (
    'agent-text-generate',
    'agent',
    'Text Generate',
    'Paid text generation demo agent (x402 upto pricing on Base Sepolia). Use for short generate / sample content requests.',
    'https://xone-x402-seller.tskwangyi.workers.dev/api/generate',
    'active',
    30
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  url = excluded.url,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = now();
