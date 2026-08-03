const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "..", "sync.config.json");
const CONTRIBUTIONS_DIR = path.join(__dirname, "..", "contributions");

const adapters = {
  leetcode: require("./adapters/leetcode"),
  codeforces: require("./adapters/codeforces"),
  geeksforgeeks: require("./adapters/geeksforgeeks"),
  hackerrank: require("./adapters/hackerrank"),
  codechef: require("./adapters/codechef"),
  interviewbit: require("./adapters/interviewbit"),
  hackerearth: require("./adapters/hackerearth"),
};

async function main() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  let totalAdded = 0;

  for (const [platform, settings] of Object.entries(config)) {
    if (!settings.enabled) continue;

    const adapter = adapters[platform];
    if (!adapter) {
      console.warn(`No adapter registered for platform "${platform}" — skipping.`);
      continue;
    }

    const outDir = path.join(CONTRIBUTIONS_DIR, platform);
    try {
      const added = await adapter.sync({ username: settings.username, outDir });
      if (added > 0) {
        console.log(`[${platform}] synced ${added} new item(s).`);
      }
      totalAdded += added;
    } catch (err) {
      console.error(`[${platform}] sync failed:`, err.message);
    }
  }

  console.log(`Total new items synced: ${totalAdded}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
