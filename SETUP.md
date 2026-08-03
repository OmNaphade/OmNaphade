# Sync setup

`sync.config.json` already has real handles filled in for every platform.
Only LeetCode and Codeforces are `enabled: true` today — those are the only
two with a working adapter.

## Coding contribution sync

`.github/workflows/contribution-sync.yml` runs every 15 minutes, reads
`sync.config.json`, and syncs solved problems into this repo as real commits
so they show up in the GitHub contribution graph instead of a separate card
per platform:

- LeetCode and Codeforces have working adapters (`scripts/adapters/`).
- GeeksforGeeks, HackerRank, CodeChef, InterviewBit, and HackerEarth have no
  public API, so their adapters are stubs — flip `enabled: true` for a
  platform in `sync.config.json` once/if a real data source is wired up for it.

**LeetCode caveat:** the LeetCode adapter is scoped to whichever account
owns `LEETCODE_SESSION` below, not the `username` field in the config — make
sure that session belongs to the `Om_Naphade` account, or the sync will pull
the wrong person's solves.

This is polling, not a live push — there's no webhook from these sites, so
"instant" sync on submit isn't possible; 15 minutes is close to the
practical floor before GitHub starts delaying scheduled runs.

Add under **Settings → Secrets and variables → Actions**:

- Secrets: `LEETCODE_SESSION`, `LEETCODE_CSRF_TOKEN` (from your browser
  cookies while logged into leetcode.com).
- Variables: `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL` — your own GitHub
  username and a verified email on your account (a GitHub-provided noreply
  address like `ID+username@users.noreply.github.com` works well). Without
  this, sync commits are attributed to `github-actions[bot]` and won't
  count toward your contribution graph.

## Contribution snake

`.github/workflows/snake.yml` renders your real GitHub contribution graph
as an animated snake and pushes the SVGs to an `output` branch, which the
README embeds directly. No secrets needed beyond the default `GITHUB_TOKEN`
— just make sure the repo allows Actions to push (**Settings → Actions →
General → Workflow permissions → Read and write permissions**).
