import React, { useEffect } from 'react';

interface InstagramPostProps {
  url: string;
  className?: string;
}

const InstagramPost: React.FC<InstagramPostProps> = ({ url, className }) => {
  useEffect(() => {
    const scriptId = 'instagram-embed-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    }

    // The script, once loaded, automatically processes blockquotes with the 'instagram-media' class.
    // If posts are added dynamically after the initial load, we might need to re-trigger the processing.
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }

  }, [url]); // Re-run if the URL changes, though not expected in this use case

  if (!url) return null;

  return (
    <div className={`flex justify-center ${className}`}>
        <blockquote
            className="instagram-media"
            data-instgrm-permalink={url}
            data-instgrm-version="14"
            style={{
                margin: '1px',
                padding: '0',
                width: '100%',
                maxWidth: '450px',
                minWidth: '326px',
                background: '#FFF',
                border: '0',
                borderRadius: '3px',
                boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
            }}
        >
        </blockquote>
    </div>
  );
};

export default InstagramPost;
