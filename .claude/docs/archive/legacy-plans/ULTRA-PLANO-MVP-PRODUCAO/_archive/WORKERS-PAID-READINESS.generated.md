# Workers Paid Readiness Report

> Generated at: 2026-02-26T13:13:52.825Z

## Summary

- Queues producers enabled blocks: **0**
- Queues consumers enabled blocks: **0**
- Triggers section enabled: **no**

## Queue Bindings (declared in wrangler.toml comments or active blocks)

- EMAIL_QUEUE: present
- VIDEO_ENCODE_QUEUE: present
- PDF_QUEUE: present
- AI_QUEUE: present

## Cron Expressions Found

- none detected

## Operational Recommendation

1. Confirm Workers Paid is active in Cloudflare dashboard.
2. Enable queues + triggers in wrangler.toml only after approval.
3. Execute release gate and controlled deploy.
