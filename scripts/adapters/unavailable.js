// Shared stub for platforms with no public API to pull submission data from.
// Swap this out for a real adapter (same `sync({ username, outDir })` shape
// as leetcode.js / codeforces.js) if/when a data source becomes available,
// then flip `enabled: true` for the platform in sync.config.json.
function makeUnavailableAdapter(platformName) {
  return {
    async sync({ username }) {
      if (username && !username.startsWith("your-")) {
        console.log(`[${platformName}] no public API available — cannot sync automatically. Skipping.`);
      }
      return 0;
    },
  };
}

module.exports = { makeUnavailableAdapter };
