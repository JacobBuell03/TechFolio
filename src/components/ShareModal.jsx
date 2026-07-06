import { useState } from 'react';

export default function ShareModal({ url, onClose }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the input
      document.getElementById('share-url-input')?.select();
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Share Your Portfolio</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          <p>
            Share this link with interviewers or add it to your resume. Anyone with the link
            can view your portfolio — no login required.
          </p>
          <div className="url-copy-row">
            <input
              id="share-url-input"
              type="text"
              value={url}
              readOnly
              className="url-input"
              onClick={e => e.target.select()}
            />
            <button className="btn btn-primary" onClick={handleCopy}>
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <p className="share-note">
            {url.includes('/#/p/')
              ? '✅ Short link generated — regenerate after making profile changes.'
              : '💡 Your data is encoded in the link. Regenerate after making changes.'}
          </p>
        </div>
      </div>
    </div>
  );
}
