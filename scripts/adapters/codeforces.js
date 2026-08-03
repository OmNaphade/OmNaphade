const fs = require("fs");
const path = require("path");

async function sync({ username, outDir }) {
  if (!username || username.startsWith("your-")) {
    console.log("[codeforces] no username configured in sync.config.json — skipping.");
    return 0;
  }

  const res = await fetch(`https://codeforces.com/api/user.status?handle=${username}`);
  const data = await res.json();
  if (data.status !== "OK") {
    throw new Error(`Codeforces API error: ${data.comment}`);
  }

  fs.mkdirSync(outDir, { recursive: true });

  const solved = new Map();
  for (const submission of data.result) {
    if (submission.verdict !== "OK") continue;
    const key = `${submission.problem.contestId}${submission.problem.index}`;
    const earliest = solved.get(key);
    if (!earliest || submission.creationTimeSeconds < earliest.creationTimeSeconds) {
      solved.set(key, submission);
    }
  }

  let added = 0;
  for (const [key, submission] of solved) {
    const filePath = path.join(outDir, `${key}.md`);
    if (fs.existsSync(filePath)) continue;

    const { problem } = submission;
    const solvedAt = new Date(submission.creationTimeSeconds * 1000).toISOString();
    fs.writeFileSync(
      filePath,
      `# ${problem.name}\n\n- **Problem:** [${key} — ${problem.name}](https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index})\n- **Rating:** ${problem.rating ?? "unrated"}\n- **Tags:** ${(problem.tags || []).join(", ") || "none"}\n- **Solved:** ${solvedAt}\n`
    );
    added++;
  }

  return added;
}

module.exports = { sync };
