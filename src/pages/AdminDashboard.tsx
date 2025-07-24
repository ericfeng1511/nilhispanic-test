import React from 'react';

import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Athlete {
  name: string;
  sport: string;
  college: string;
  photo: string | null;
}

const PAGE_SIZE = 100;

// Fetch all athletes with timeout & abortController (single bulk fetch)
async function fetchAllAthletes(): Promise<Athlete[]> {
  console.debug('[Athletes] Fetching ALL rows');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15-s guard
  try {
    const { data, error } = await supabase
      .from('student_athletes')
      .select('name,sport,college,photo')
      .abortSignal(controller.signal);
    if (error) throw error;
    return data as Athlete[];
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      console.warn('[Athletes] Bulk fetch aborted');
    } else {
      console.error('[Athletes] Bulk fetch error', err);
      throw err;
    }
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

// (legacy paged fetch kept below but unused) 
// Fetcher with timeout & abortController
async function fetchAthletes(page: number): Promise<{ data: Athlete[]; count: number }> {
  console.debug(`[Athletes] Fetching page ${page}`);

    const controller = new AbortController();
  // Use a longer timeout (12 s) and defer if tab is hidden to avoid premature aborts
  const delay = document.visibilityState === 'visible' ? 12000 : 0;
  const timeout = delay ? setTimeout(() => controller.abort(), delay) : undefined;

  try {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count, error } = await supabase
      .from('student_athletes')
      .select('name,sport,college,photo', { count: 'exact' })
      .range(from, to)
      .abortSignal(controller.signal);

    if (error) throw error;
    return { data: data as Athlete[], count: count ?? 0 };
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      console.warn('[Athletes] Fetch aborted');
    } else {
      console.error('[Athletes] Fetch error', err);
      throw err;
    }
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

const queryClient = new QueryClient();

const AdminDashboard: React.FC = () => {
  const [page, setPage] = useState(0);

  const {
    data,
    isLoading,
    isError
  } = useQuery<Athlete[], Error>({
    queryKey: ['athletes-all'],
    queryFn: fetchAllAthletes,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24, // keep in cache for 24h
    retry: 2,
    refetchOnWindowFocus: false
  });

  const athletes: Athlete[] = data ?? [];

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(athletes.length / PAGE_SIZE));
  }, [athletes]);

  const pageSlice = useMemo(() => {
    const start = page * PAGE_SIZE;
    return athletes.slice(start, start + PAGE_SIZE);
  }, [athletes, page]);

  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;

  const handlePrev = () => canPrev && setPage((p) => p - 1);
  const handleNext = () => canNext && setPage((p) => p + 1);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Student Athletes</h1>

            {/* Error State */}
            {isError && (
              <div className="text-red-600 mb-4">
                Failed to load athletes.
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin h-8 w-8 text-gray-600" />
              </div>
            )}

            {/* Grid */}
            {!isLoading && athletes.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {pageSlice.map((athlete, idx) => (
                    <div
                      key={`${athlete.name}-${idx}`}
                      className="bg-gray-100 rounded shadow-sm p-4 flex flex-col items-center"
                    >
                      <img
                        src={athlete.photo ?? '/placeholder.png'}
                        alt={athlete.name}
                        loading="lazy"
                        className="w-20 h-20 object-cover rounded-full mb-2"
                      />
                      <p className="font-semibold text-center text-sm">{athlete.name}</p>
                      <p className="text-xs text-gray-500 text-center">
                        {athlete.sport} — {athlete.college}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <button
                    onClick={handlePrev}
                    disabled={!canPrev}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded border text-sm ${
                      canPrev ? 'bg-white hover:bg-gray-50' : 'bg-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <span className="text-sm">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={!canNext}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded border text-sm ${
                      canNext ? 'bg-white hover:bg-gray-50' : 'bg-gray-200 cursor-not-allowed'
                    }`}
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default AdminDashboard;