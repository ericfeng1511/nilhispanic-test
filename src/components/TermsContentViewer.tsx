import React, { Suspense, lazy, useEffect, useState } from 'react';

interface TermsContentViewerProps {
  htmlUrl?: string; // default: /terms/terms.html
  pdfUrl?: string;  // default: /terms/terms.pdf
}

// Keep PDF viewer lazy to avoid increasing main bundle
const TermsPdfViewer = lazy(() => import('./TermsPdfViewer'));

/**
 * Displays Terms & Conditions as HTML if available (no page breaks),
 * otherwise falls back to the PDF viewer.
 */
const TermsContentViewer: React.FC<TermsContentViewerProps> = ({
  htmlUrl = '/terms/terms.html',
  pdfUrl = '/terms/terms.pdf',
}) => {
  const [hasHtml, setHasHtml] = useState<boolean | null>(null);

  useEffect(() => {
    let aborted = false;

    // Check for HTML availability via HEAD request
    fetch(htmlUrl, { method: 'HEAD' })
      .then((res) => {
        if (aborted) return;
        setHasHtml(res.ok);
      })
      .catch(() => {
        if (aborted) return;
        setHasHtml(false);
      });

    return () => {
      aborted = true;
    };
  }, [htmlUrl]);

  if (hasHtml === null) {
    return <div className="p-4 text-sm text-gray-600">Loading terms...</div>;
  }

  if (hasHtml) {
    // Render HTML in an iframe for isolation and inherent continuous flow
    return (
      <div className="w-full h-[70vh] max-h-[70vh] overflow-hidden bg-white">
        <iframe
          title="Terms and Conditions"
          src={htmlUrl}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    );
  }

  // Fallback: use existing PDF viewer
  return (
    <div className="w-full h-[70vh] max-h-[70vh]">
      <Suspense fallback={<div className="p-4 text-sm text-gray-600">Loading terms...</div>}>
        <TermsPdfViewer fileUrl={pdfUrl} />
      </Suspense>
    </div>
  );
};

export default TermsContentViewer;
