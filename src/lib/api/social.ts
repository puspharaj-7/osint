// ============================================================
// src/lib/api/social.ts
// OSINT-style social profile lookup
// - GitHub: uses public GitHub API (no key required)
// - Twitter/X, LinkedIn: generates advisory notes with direct search URLs
// ============================================================

import { uid, nowISO } from './client';
import type { ApiEvidence, ApiAlert } from './types';

interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  email: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  avatar_url: string;
  html_url: string;
}

export async function lookupGitHub(username: string): Promise<ApiEvidence[]> {
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });

    if (res.status === 404) {
      return [{
        id: uid('gh'),
        source: 'GitHub',
        type: 'social' as const,
        title: `GitHub: No profile found for "${username}"`,
        content: `No public GitHub account exists for username "${username}".`,
        confidence: 90,
        timestamp: nowISO(),
      }];
    }

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const data: GitHubUser = await res.json();

    const details = [
      `Name: ${data.name ?? 'Not set'}`,
      `Username: @${data.login}`,
      `Bio: ${data.bio ?? 'No bio'}`,
      `Company: ${data.company ?? 'N/A'}`,
      `Location: ${data.location ?? 'N/A'}`,
      `Public Email: ${data.email ?? 'Private'}`,
      `Website: ${data.blog ?? 'N/A'}`,
      `Public Repos: ${data.public_repos}`,
      `Followers: ${data.followers} | Following: ${data.following}`,
      `Account Created: ${new Date(data.created_at).toLocaleDateString()}`,
      `Profile URL: ${data.html_url}`,
    ].join('\n');

    return [{
      id: uid('gh'),
      source: 'GitHub',
      type: 'social' as const,
      title: `GitHub Profile: @${data.login}`,
      content: details,
      confidence: 95,
      timestamp: nowISO(),
    }];
  } catch (err) {
    console.error('[Social] GitHub lookup failed:', err);
    return [];
  }
}

export async function lookupSocialProfiles(username: string): Promise<{ evidence: ApiEvidence[]; alerts: ApiAlert[] }> {
  const evidence: ApiEvidence[] = [];

  // GitHub public API lookup
  const githubResults = await lookupGitHub(username);
  evidence.push(...githubResults);

  // Twitter/X advisory
  evidence.push({
    id: uid('twt'),
    source: 'Twitter / X',
    type: 'social' as const,
    title: `Twitter/X Search: @${username}`,
    content: `Manual search recommended.\n\nDirect search URL:\nhttps://twitter.com/search?q=${encodeURIComponent(username)}&f=user\n\nAlso try:\nhttps://x.com/${encodeURIComponent(username)}`,
    confidence: 30,
    timestamp: nowISO(),
  });

  // LinkedIn advisory
  evidence.push({
    id: uid('li'),
    source: 'LinkedIn',
    type: 'social' as const,
    title: `LinkedIn Search: ${username}`,
    content: `Manual search recommended.\n\nDirect search URL:\nhttps://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(username)}\n\nAlso try:\nhttps://www.linkedin.com/in/${encodeURIComponent(username)}`,
    confidence: 25,
    timestamp: nowISO(),
  });

  return { evidence, alerts: [] };
}
