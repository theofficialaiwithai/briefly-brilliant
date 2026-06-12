import { useEffect, useState } from "react";

export type RedditPost = {
  title: string;
  score: number;
  permalink: string;
  selftext: string;
  num_comments: number;
  subreddit: string;
};

const cache = new Map<string, RedditPost[]>();

export function useRedditPosts(query: string) {
  const [posts, setPosts] = useState<RedditPost[]>(() => cache.get(query) ?? []);
  const [loading, setLoading] = useState(() => !cache.has(query));
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }
    if (cache.has(query)) {
      setPosts(cache.get(query)!);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    // Proxy through Supabase Edge Function — Reddit blocks direct browser CORS requests
    // and 403s datacenter IPs; the function uses Pullpush.io (Reddit mirror, no auth)
    const url =
      `https://kmgndbewlfshtedavebd.supabase.co/functions/v1/reddit-search` +
      `?q=${encodeURIComponent(query)}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const result: RedditPost[] = (data?.posts ?? []) as RedditPost[];
        cache.set(query, result);
        setPosts(result);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        cache.set(query, []); // don't retry on error
        setError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return { posts, loading, error };
}
