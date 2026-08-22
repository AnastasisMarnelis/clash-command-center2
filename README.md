# Clash Command Center — LIVE

This is a real full-stack starting point for clan **#2GYLPCRRR**.

## What it does
- Live clan profile
- Live member list
- War log
- Current/CWL endpoints
- Player detail endpoints
- CWL starting-15 recommendation
- Server-side API token support
- ClashKing fallback for richer historical/war data

## Run locally
1. Install Node.js 20+.
2. Open this folder in a terminal.
3. Run `npm install`
4. Copy `.env.example` to `.env`
5. Put your clan tag in `CLAN_TAG` (already set to #2GYLPCRRR).
6. Recommended: create a Supercell API key at https://developer.clashofclans.com/ and put it in `COC_API_TOKEN`.
7. Run `npm start`
8. Open http://localhost:3000

## Important API setup
The official Clash of Clans API requires a bearer/JWT token and its routes include clan, members, war log, current war, CWL group/war, player profiles and battle logs. The key should stay on the server, never in browser JavaScript.

If `COC_API_TOKEN` is empty, the app tries ClashKing's public endpoints for basic/richer historical data. ClashKing says its data is collected by polling the official API and is cached/rate-limited, so it is not a replacement for the official API.

## Production
Deploy this Node app to Render/Railway/Fly/etc. Add `COC_API_TOKEN` and `CLAN_TAG` as environment variables. Do not commit `.env`.

## Next upgrade
For the best CWL selector, persist every war/CWL attack into PostgreSQL and calculate:
- 3-star rate
- average destruction
- TH-difficulty-adjusted performance
- missed attack rate
- recent-form score
- CWL-only score
- ranked/Legend score
- matchup suitability
Then lock the recommended 15 from those historical metrics.
