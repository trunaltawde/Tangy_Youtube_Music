"use client";

import React, { useState } from "react";

type Item = {
  id: { videoId?: string } | string;
  snippet: { title: string; thumbnails?: any; channelTitle?: string };
};

export default function SearchClient() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function doSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setResults([]);
      } else {
        setResults(data.items || []);
      }
    } catch (err: any) {
      setError(err?.message || String(err));
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function getVideoId(item: Item) {
    if (typeof item.id === "string") return item.id;
    return (item.id as any)?.videoId || null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <form onSubmit={doSearch} className="flex gap-2 mb-4">
        <input
          className="flex-1 rounded border px-3 py-2"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search YouTube for music or song titles"
        />
        <button
          className="rounded bg-black text-white px-4"
          type="submit"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <div className="text-red-600 mb-4">Error: {error}</div>}

      <div className="md:flex gap-6">
        <div className="md:flex-1">
          <ul className="space-y-3">
            {results.map((it, idx) => {
              const vid = getVideoId(it) as string | null;
              const thumb = (it.snippet.thumbnails?.default?.url) || (it.snippet.thumbnails?.high?.url) || "";
              return (
                <li
                  key={idx}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded"
                  onClick={() => vid && setSelected(vid)}
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="thumb" width={120} height={68} />
                  ) : (
                    <div className="w-28 h-16 bg-gray-200" />
                  )}
                  <div>
                    <div className="font-medium">{it.snippet.title}</div>
                    <div className="text-sm text-gray-600">{it.snippet.channelTitle}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="md:w-96 mt-4 md:mt-0">
          {selected ? (
            <div>
              <div className="mb-2 font-medium">Now playing</div>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  width="100%"
                  height="315"
                  src={`https://www.youtube.com/embed/${selected}?autoplay=1&rel=0`}
                  title="YouTube player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            <div className="text-gray-600">Select a result to play</div>
          )}
        </div>
      </div>
    </div>
  );
}
