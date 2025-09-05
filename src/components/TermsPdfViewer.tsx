import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Use CDN worker to avoid bundler-specific worker config.
// Match the worker version to the runtime API version reported by pdfjs.
// If you update react-pdf/pdfjs, bump this version to match.
pdfjs.GlobalWorkerOptions.workerSrc =
  'https://unpkg.com/pdfjs-dist@5.3.93/build/pdf.worker.min.mjs';

interface TermsPdfViewerProps {
  fileUrl: string;
}

// A simple, scroll-only PDF viewer: renders all pages in sequence with no toolbars
const TermsPdfViewer: React.FC<TermsPdfViewerProps> = ({ fileUrl }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages: nextNumPages }: { numPages: number }) => {
    setNumPages(nextNumPages);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => setWidth(el.clientWidth);
    updateWidth();

    const ro = new ResizeObserver(() => updateWidth());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-[70vh] max-h-[70vh] overflow-y-auto">
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={(e) => {
          const msg = (e as any)?.message || '';
          // Ignore expected teardown errors when closing/unmounting mid-load
          if (/abort|destroy(ed)?/i.test(msg)) return;
          setError(msg || 'Failed to load PDF');
        }}
        loading={<div className="p-4 text-sm text-gray-600">Loading terms...</div>}
        error={
          <div className="p-4 text-sm text-red-600">Failed to load PDF. Please try again later.</div>
        }
        externalLinkTarget="_blank"
      >
        {numPages && width > 0 && (
          <div className="flex flex-col items-center gap-4 py-2">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNumber) => (
              <Page
                key={pageNumber}
                pageNumber={pageNumber}
                width={Math.min(width, 800)}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ))}
          </div>
        )}
      </Document>

      {error && (
        <div className="p-4 text-sm text-red-600">{error}</div>
      )}
    </div>
  );
};

export default TermsPdfViewer;
