import React, { useState } from 'react';
import { useGitHubProfile } from '../hooks/useGitHubProfile';
import { Loader, AlertCircle } from 'lucide-react';

export function GitHubProfileInput({ onProfileFetched }: { onProfileFetched?: (profile: any) => void }) {
  const [input, setInput] = useState('');
  const { profile, loading, error } = useGitHubProfile(input);

  // Callback for parent to use the profile in analysis
  React.useEffect(() => {
    if (profile && onProfileFetched) onProfileFetched(profile);
  }, [profile, onProfileFetched]);

  return (
    <div>
      <label htmlFor="github-url" style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>
        GitHub Profile URL or Username
      </label>
      <input
        id="github-url"
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="https://github.com/username or username"
        style={{
          width: '100%',
          padding: 8,
          fontSize: '1rem',
          borderRadius: 6,
          border: '1px solid #ccc',
          marginBottom: 12,
        }}
      />
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Loader size={16} className="spin" /> Loading GitHub profile...
        </div>
      )}
      {error && (
        <div style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {profile && (
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src={profile.avatar_url}
            alt={`${profile.login} avatar`}
            style={{ width: 48, height: 48, borderRadius: '50%' }}
          />
          <div>
            <a href={profile.html_url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: '700', color: 'var(--accent)' }}>
              {profile.name || profile.login}
            </a>
            {profile.bio && <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>{profile.bio}</p>}
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {profile.public_repos} public repos • {profile.followers} followers
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
