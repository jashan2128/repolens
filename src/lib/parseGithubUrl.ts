export type RepoRef = {
  owner: string;
  repo: string;
  cloneUrl: string;
};

// Accepts: github.com/owner/repo, https://github.com/owner/repo(.git)
// Strict on purpose: nothing else ever reaches git.
const GITHUB_URL = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/;

export function parseGithubUrl(input: string): RepoRef | null {
  const match = input.trim().match(GITHUB_URL);
  if (!match) return null;

  const [, owner, repo] = match;
  return { owner, repo, cloneUrl: `https://github.com/${owner}/${repo}.git` };
}
