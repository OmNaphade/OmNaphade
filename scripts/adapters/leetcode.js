const fs = require("fs");
const path = require("path");

const PAGE_SIZE = 20;

async function fetchPage(offset, session, csrfToken) {
  const res = await fetch(`https://leetcode.com/api/submissions/?offset=${offset}&limit=${PAGE_SIZE}`, {
    headers: {
      Cookie: `LEETCODE_SESSION=${session}; csrftoken=${csrfToken}`,
      "x-csrftoken": csrfToken,
      Referer: "https://leetcode.com",
    },
  });
  if (!res.ok) {
    throw new Error(`LeetCode API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// LeetCode's submissions API is scoped to whoever owns the session cookie —
// there's no per-username query, so `username` is informational only here.
async function sync({ outDir }) {
  const session = process.env.LEETCODE_SESSION;
  const csrfToken = process.env.LEETCODE_CSRF_TOKEN;
  if (!session || !csrfToken) {
    console.log("[leetcode] LEETCODE_SESSION / LEETCODE_CSRF_TOKEN not set — skipping.");
    return 0;
  }

  fs.mkdirSync(outDir, { recursive: true });

  let offset = 0;
  let added = 0;
  let stop = false;

  // Submissions come back newest-first, so we can stop paging as soon as we
  // hit one we've already recorded.
  while (!stop) {
    const data = await fetchPage(offset, session, csrfToken);
    const submissions = data.submissions_dump || [];
    if (submissions.length === 0) break;

    for (const submission of submissions) {
      if (submission.status_display !== "Accepted") continue;

      const filePath = path.join(outDir, `${submission.title_slug}.md`);
      if (fs.existsSync(filePath)) {
        stop = true;
        break;
      }

      const solvedAt = new Date(submission.timestamp * 1000).toISOString();
      fs.writeFileSync(
        filePath,
        `# ${submission.title}\n\n- **Problem:** [${submission.title}](https://leetcode.com/problems/${submission.title_slug}/)\n- **Language:** ${submission.lang}\n- **Solved:** ${solvedAt}\n`
      );
      added++;
    }

    if (!data.has_next) break;
    offset += PAGE_SIZE;
  }

  return added;
}

module.exports = { sync };
