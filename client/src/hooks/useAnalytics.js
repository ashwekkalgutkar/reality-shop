import { useState, useEffect, useCallback, useRef } from 'react';

const EVENT_WEIGHTS = [
  { type: 'view', weight: 0.60 },
  { type: 'click', weight: 0.25 },
  { type: 'add_to_cart', weight: 0.15 }
];

const API_BASE_URL = import.meta.env.VITE_API_URL || '';


function getRandomEventType() {
  const rand = Math.random();
  let cumulative = 0;
  for (const item of EVENT_WEIGHTS) {
    cumulative += item.weight;
    if (rand <= cumulative) {
      return item.type;
    }
  }
  return 'view';
}

export function useAnalytics(initialPage = 1, initialLimit = 10) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastSimulationEvent, setLastSimulationEvent] = useState(null);
  const [error, setError] = useState(null);

  // Request sequence guard & AbortController refs to prevent race conditions
  const requestSeqRef = useRef(0);
  const abortControllerRef = useRef(null);

  // Fetch paginated videos with sequence guard & AbortController
  const fetchVideos = useCallback(async (targetPage = page, targetLimit = limit, options = {}) => {
    const { isInitial = false, showRefetching = true } = typeof options === 'boolean' 
      ? { showRefetching: options } 
      : options;

    // Abort any ongoing fetch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Sequence guard counter
    const currentSeq = ++requestSeqRef.current;

    if (isInitial || data.length === 0) {
      setLoading(true);
    } else if (showRefetching) {
      setIsRefetching(true);
    }
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/analytics/videos?page=${targetPage}&limit=${targetLimit}`, {
        signal: controller.signal
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch analytics (Status ${res.status})`);
      }
      
      const json = await res.json();

      // Ignore response if a newer request was dispatched in the meantime
      if (currentSeq !== requestSeqRef.current) {
        return;
      }

      setData(json.data);
      setPage(json.page);
      setLimit(json.limit);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    } catch (err) {
      if (err.name === 'AbortError') {
        return; // Silently ignore aborted request
      }
      if (currentSeq === requestSeqRef.current) {
        setError(err.message || 'An error occurred while fetching video analytics.');
      }
    } finally {
      if (currentSeq === requestSeqRef.current) {
        setLoading(false);
        setIsRefetching(false);
      }
    }
  }, [page, limit, data.length]);

  // Fetch overall summary metrics
  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/analytics/summary`);
      if (res.ok) {
        const json = await res.json();
        setSummary(json.data);
      }
    } catch (err) {
      // Non-critical summary fetch fallback
    }
  }, []);

  // Initial load & page/limit changes
  useEffect(() => {
    fetchVideos(page, limit, { isInitial: data.length === 0, showRefetching: true });
    fetchSummary();
  }, [page, limit]);

  // Simulate Traffic handler with Optimistic UI & Rollback
  const simulateTraffic = async () => {
    if (isSimulating) return; // Prevent duplicate submit
    setIsSimulating(true);
    setError(null);

    // 1. Fetch available video IDs or pick from existing table data
    let videoIds = data.map(v => v.id);
    if (videoIds.length === 0) {
      try {
        const idsRes = await fetch(`${API_BASE_URL}/api/analytics/video-ids`);
        if (idsRes.ok) {
          const idsJson = await idsRes.json();
          videoIds = idsJson.data;
        }
      } catch (e) {
        // Fallback
      }
    }

    if (!videoIds || videoIds.length === 0) {
      setError('No videos available to simulate traffic.');
      setIsSimulating(false);
      return;
    }

    const randomVideoId = videoIds[Math.floor(Math.random() * videoIds.length)];
    const randomEventType = getRandomEventType();
    const targetVideo = data.find(v => v.id === randomVideoId);

    // Save previous state snapshots for rollback if server request fails
    const previousData = [...data];
    const previousSummary = summary ? { ...summary } : null;

    // OPTIMISTIC UPDATE: Update UI counts immediately before server response
    if (targetVideo) {
      setData(prevData =>
        prevData.map(row => {
          if (row.id !== randomVideoId) return row;
          return {
            ...row,
            views: randomEventType === 'view' ? Number(row.views) + 1 : row.views,
            clicks: randomEventType === 'click' ? Number(row.clicks) + 1 : row.clicks,
            add_to_cart: randomEventType === 'add_to_cart' ? Number(row.add_to_cart) + 1 : row.add_to_cart
          };
        })
      );
    }

    if (summary) {
      setSummary(prevSummary => ({
        ...prevSummary,
        total_views: randomEventType === 'view' ? prevSummary.total_views + 1 : prevSummary.total_views,
        total_clicks: randomEventType === 'click' ? prevSummary.total_clicks + 1 : prevSummary.total_clicks,
        total_add_to_cart: randomEventType === 'add_to_cart' ? prevSummary.total_add_to_cart + 1 : prevSummary.total_add_to_cart
      }));
    }

    setLastSimulationEvent({
      videoTitle: targetVideo ? targetVideo.title : `Video #${randomVideoId}`,
      eventType: randomEventType,
      timestamp: new Date().toISOString()
    });

    try {
      // 2. POST /api/events
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: randomVideoId,
          eventType: randomEventType
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.message || 'Traffic simulation failed.');
      }

      // 3. Silent Server Reconciliation: Re-fetch real metrics from server
      await Promise.all([
        fetchVideos(page, limit, { showRefetching: false }),
        fetchSummary()
      ]);

    } catch (err) {
      // ROLLBACK on failure
      setData(previousData);
      if (previousSummary) setSummary(previousSummary);
      setError(`Simulation Failed: ${err.message}. Optimistic changes rolled back.`);
    } finally {
      setIsSimulating(false);
    }
  };

  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
    }
  };

  const changeLimit = (newLimit) => {
    if (newLimit !== limit) {
      setLimit(newLimit);
      setPage(1);
    }
  };

  const refetch = async () => {
    await Promise.all([
      fetchVideos(page, limit, { showRefetching: true }),
      fetchSummary()
    ]);
  };

  return {
    data,
    page,
    limit,
    total,
    totalPages,
    summary,
    loading,
    isRefetching,
    isSimulating,
    lastSimulationEvent,
    error,
    changePage,
    changeLimit,
    simulateTraffic,
    refetch
  };
}
