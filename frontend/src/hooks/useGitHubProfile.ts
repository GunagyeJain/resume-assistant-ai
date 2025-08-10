import { useState, useEffect } from 'react';

export interface GitHubProfile {
  login: string;
  avatar_url: string;
  html_url: string;
  name?: string;
  bio?: string;
  followers: number;
  following: number;
  public_repos: number;
}

export function useGitHubProfile(profileUrlOrUsername: string) {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileUrlOrUsername) {
      setProfile(null);
      setError(null);
      return;
    }
    // Normalize to username
    let username = profileUrlOrUsername.trim().toLowerCase();
    if (username.includes('github.com/')) {
      username = username.split('/').filter(Boolean).pop()!;
    }
    if (!username) {
      setError('Invalid GitHub username or URL');
      setProfile(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`https://api.github.com/users/${username}`)
      .then(resp => {
        if (!resp.ok) throw new Error('GitHub user not found');
        return resp.json();
      })
      .then(data => setProfile(data))
      .catch(e => {
        setError(e.message);
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, [profileUrlOrUsername]);

  return { profile, loading, error };
}
