---
name: facebook-groups-poster
description: Use to publish or schedule messages to the user's Facebook groups through the Graph API (curl, no browser). Covers posting one message, listing the user's groups, and running a timed multi-post campaign at configurable random intervals (e.g. ~40 posts across groups over ~5 hours). Invoke when the user asks to post to Facebook groups now, periodically, or on a schedule.
user-invocable: true
---
# Facebook Groups Poster (Graph API)

Publish and schedule posts to Facebook groups via the official Graph API (`POST /{group-id}/feed`). No browser automation needed, so it is immune to the web "Publicar" button that Facebook hides from automation.

## Token (app token, never the account password)
- The user must create a Facebook app in development mode at developers.facebook.com, add the `publish_to_groups` (and `groups_access_member_info`) permission, and authorize it for their own account to get a User token.
- Store the token at `scripts/fb-poster/.fb_token` (chmod 600) or export `FB_APP_TOKEN`. The token may be exchanged for a long-lived one; see the Graph API docs.
- Never persist the login password; only the app token.

## Location
`<root-workspace>/scripts/fb-poster/`: `post.sh`, `list_groups.sh`, `scheduler.py`, `config.json`.

## Commands (run from the FB-poster dir)
- List groups to fill `config.json` `group_ids`:
  `bash list_groups.sh`
- Post one message to one group (quickest test):
  `bash post.sh <group_id> '<mensaje>'`  -> success signal `RESULT=OK` and `"id"` in the JSON body.
- Preview a distribution (no posting):
  `python3 scheduler.py --dry-run --posts 40 --min 7 --max 8`
- Run a scheduled campaign:
  `python3 scheduler.py --posts 40 --min 7 --max 8 --message '<texto>' [--start-delay 5]`

## Scheduling math
- N posts spread over D hours needs average interval = D*60/N minutes.
- ~40 posts over ~5 hours → interval ≈ 7–8 min (tune `--min/--max`).
- The same scheduler with `--min 20 --max 40` spans ~20h for 40 posts; adapt posts/duration to the need.
- Good practice to add jitter (random gaps) which the scheduler does automatically, and a modest `--start-delay`.

## Verification
- Single post: `RESULT=OK` + `"id"`. A JSON `"error"` object means the group/token rejected it (that group may disallow API posts) — log and continue to the next.
- Campaign: inspect `run_AAAAMMDD.log` for `ok=True` per post; optionally confirm with `GET /{group-id}/feed?access_token=...`.

## Cautions
- Respect Facebook rate limits and each group's rules; cap posts per group.
- Groups that disable API posting will error — skip them.
- The Graph API needs the `publish_to_groups` permission; if a group's post returns permission errors, re-check token scopes and that the user is a member.