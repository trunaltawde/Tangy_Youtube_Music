"use client";

import React, { useState, useEffect } from "react";

type Item = {
  id: { videoId?: string } | string;
  snippet: { title: string; thumbnails?: any; channelTitle?: string };
};

type Favorite = {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  addedAt: number;
};

type Mood = "peaceful" | "energetic" | "romantic" | "chill" | "focused" | "party";

const moodThemes: Record<Mood, { bg: string; bgImage: string; emoji: string; label: string }> = {
  peaceful: {
    bg: "bg-gradient-to-br from-blue-400 via-cyan-300 to-orange-300",
    bgImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
    emoji: "🌅",
    label: "Peaceful (Beach Sunset)",
  },
  energetic: {
    bg: "bg-gradient-to-br from-red-500 via-yellow-400 to-orange-500",
    bgImage:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=80",
    emoji: "⚡",
    label: "Energetic (Fire)",
  },
  romantic: {
    bg: "bg-gradient-to-br from-pink-400 via-red-300 to-purple-400",
    bgImage:
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1920&q=80",
    emoji: "💕",
    label: "Romantic (Sunset Love)",
  },
  chill: {
    bg: "bg-gradient-to-br from-indigo-500 via-purple-400 to-pink-300",
    bgImage:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80",
    emoji: "😌",
    label: "Chill (Night Sky)",
  },
  focused: {
    bg: "bg-gradient-to-br from-gray-700 via-blue-700 to-gray-800",
    bgImage:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1920&q=80",
    emoji: "🎯",
    label: "Focused (Workspace)",
  },
  party: {
    bg: "bg-gradient-to-br from-purple-600 via-pink-500 to-red-500",
    bgImage:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80",
    emoji: "🎉",
    label: "Party (Crowd)",
  },
};

export default function SearchClient() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [volume, setVolume] = useState(100);
  const [activeTab, setActiveTab] = useState<"search" | "favorites" | "history">("search");
  const [mounted, setMounted] = useState(false);
  const [mood, setMood] = useState<Mood>("peaceful");

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    const savedFavorites = localStorage.getItem("favorites");
    const savedHistory = localStorage.getItem("history");
    const savedSearches = localStorage.getItem("recentSearches");
    const savedVolume = localStorage.getItem("volume");
    const savedMood = localStorage.getItem("mood") as Mood | null;

    if (savedTheme) setTheme(savedTheme);
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedSearches) setRecentSearches(JSON.parse(savedSearches));
    if (savedVolume) setVolume(parseInt(savedVolume));
    if (savedMood) setMood(savedMood);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    localStorage.setItem("volume", volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem("mood", mood);
  }, [mood]);

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
        if (!recentSearches.includes(q)) {
          setRecentSearches([q, ...recentSearches.slice(0, 4)]);
        }
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

  function playVideo(videoId: string, title: string = "", channel: string = "") {
    setSelected(videoId);
    if (!history.includes(videoId)) {
      setHistory([videoId, ...history.slice(0, 9)]);
    }
  }

  function toggleFavorite(item: Item) {
    const videoId = getVideoId(item) as string;
    const isFav = favorites.some((f) => f.videoId === videoId);
    if (isFav) {
      setFavorites(favorites.filter((f) => f.videoId !== videoId));
    } else {
      setFavorites([
        ...favorites,
        {
          videoId,
          title: item.snippet.title,
          channel: item.snippet.channelTitle || "Unknown",
          thumbnail: item.snippet.thumbnails?.default?.url || "",
          addedAt: Date.now(),
        },
      ]);
    }
  }

  function isFavorited(videoId: string | null) {
    return favorites.some((f) => f.videoId === videoId);
  }

  if (!mounted) return null;

  const bgClass = theme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const containerClass = theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900";
  const borderClass = theme === "dark" ? "border-gray-700" : "border-gray-300";

  return (
    <div
      className={`min-h-screen bg-cover bg-center bg-fixed p-4 sm:p-8 transition-all duration-1000`}
      style={{
        backgroundImage: `url('${moodThemes[mood].bgImage}')`,
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay for better text visibility */}
      <div className="fixed inset-0 bg-black/40 pointer-events-none transition-opacity duration-1000" />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Theme Toggle & Mood Selector */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-white drop-shadow-lg">
              🎵 Tangy Music Player
            </h1>
            <p className="text-white/80 drop-shadow">
              Search and play music directly from YouTube
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                theme === "dark"
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                  : "bg-gray-800 hover:bg-gray-900 text-white"
              }`}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Mood Selector */}
        <div className="mb-8 bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 shadow-lg">
          <p className="text-white font-semibold mb-4 text-lg">
            ✨ How is your mood? Choose one to change the vibe:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {(Object.keys(moodThemes) as Mood[]).map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`px-4 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                  mood === m
                    ? "bg-white text-gray-900 shadow-xl ring-4 ring-white/50"
                    : "bg-white/20 text-white hover:bg-white/30 border border-white/30"
                }`}
              >
                <div className="text-2xl mb-1">{moodThemes[m].emoji}</div>
                <div className="text-xs capitalize">{m}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={doSearch}
          className={`mb-8 flex flex-col sm:flex-row gap-2 ${containerClass} rounded-lg p-3 shadow-lg hover:shadow-xl transition-shadow border ${borderClass}`}
        >
          <input
            className={`flex-1 ${theme === "dark" ? "bg-gray-700 text-white placeholder-gray-500" : "bg-gray-100 text-gray-900 placeholder-gray-400"} px-4 py-3 rounded outline-none transition-all`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for songs, artists, playlists..."
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold transition-colors disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? "🔍 Searching..." : "🔍 Search"}
          </button>
        </form>

        {/* Recent Searches Quick Access */}
        {recentSearches.length > 0 && activeTab === "search" && (
          <div className="mb-6">
            <p className={`text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Recent Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQ(search);
                    setTimeout(doSearch, 0);
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    theme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-300 hover:bg-gray-400 text-gray-900"
                  }`}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className={`mb-6 border px-4 py-3 rounded-lg ${
            theme === "dark"
              ? "bg-red-900/20 border-red-500 text-red-400"
              : "bg-red-100 border-red-400 text-red-700"
          }`}>
            ❌ Error: {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          {(["search", "favorites", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-semibold transition-colors capitalize ${
                activeTab === tab
                  ? "border-b-2 border-blue-500 text-blue-400"
                  : theme === "dark"
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "search" && `🔍 Search`}
              {tab === "favorites" && `❤️ Favorites (${favorites.length})`}
              {tab === "history" && `📝 History (${history.length})`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Results List */}
          <div className="lg:col-span-2">
            {activeTab === "search" && (
              <>
                {results.length === 0 && !loading && !error && (
                  <div className={`${containerClass} rounded-lg p-8 text-center border ${borderClass}`}>
                    <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                      Search for a song to get started!
                    </p>
                  </div>
                )}
                {results.length > 0 && (
                  <div className={`${containerClass} rounded-lg overflow-hidden shadow-lg border ${borderClass}`}>
                    <div className={`p-4 border-b ${borderClass}`}>
                      <h2 className="text-xl font-semibold">Search Results ({results.length})</h2>
                    </div>
                    <ul className={`divide-y ${borderClass} max-h-[600px] overflow-y-auto`}>
                      {results.map((it, idx) => {
                        const vid = getVideoId(it) as string | null;
                        const thumb = it.snippet.thumbnails?.default?.url || it.snippet.thumbnails?.high?.url || "";
                        const isSelected = vid === selected;
                        const isFav = isFavorited(vid);
                        return (
                          <li
                            key={idx}
                            className={`flex items-center gap-4 p-4 cursor-pointer transition-all ${
                              isSelected
                                ? theme === "dark"
                                  ? "bg-blue-600/30 border-l-4 border-blue-500"
                                  : "bg-blue-100 border-l-4 border-blue-500"
                                : theme === "dark"
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            {thumb ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={thumb}
                                alt="thumb"
                                width={60}
                                height={60}
                                className="rounded object-cover cursor-pointer"
                                onClick={() => vid && playVideo(vid, it.snippet.title, it.snippet.channelTitle)}
                              />
                            ) : (
                              <div className={`w-16 h-16 ${theme === "dark" ? "bg-gray-700" : "bg-gray-300"} rounded`} />
                            )}
                            <div className="flex-1 min-w-0" onClick={() => vid && playVideo(vid, it.snippet.title, it.snippet.channelTitle)}>
                              <div className="font-medium text-sm sm:text-base truncate">
                                {it.snippet.title}
                              </div>
                              <div className={`text-xs sm:text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} truncate`}>
                                {it.snippet.channelTitle}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(it);
                              }}
                              className={`text-xl transition-transform hover:scale-110 ${isFav ? "text-red-500" : "text-gray-400"}`}
                            >
                              {isFav ? "❤️" : "🤍"}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </>
            )}

            {activeTab === "favorites" && (
              <div className={`${containerClass} rounded-lg overflow-hidden shadow-lg border ${borderClass}`}>
                <div className={`p-4 border-b ${borderClass}`}>
                  <h2 className="text-xl font-semibold">Your Favorites</h2>
                </div>
                {favorites.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                      No favorites yet. Add songs by clicking the heart icon!
                    </p>
                  </div>
                ) : (
                  <ul className={`divide-y ${borderClass} max-h-[600px] overflow-y-auto`}>
                    {favorites.map((fav) => (
                      <li
                        key={fav.videoId}
                        className={`flex items-center gap-4 p-4 cursor-pointer transition-all ${
                          fav.videoId === selected
                            ? theme === "dark"
                              ? "bg-blue-600/30"
                              : "bg-blue-100"
                            : theme === "dark"
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => playVideo(fav.videoId, fav.title, fav.channel)}
                      >
                        {fav.thumbnail && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={fav.thumbnail}
                            alt="thumb"
                            width={60}
                            height={60}
                            className="rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm sm:text-base truncate">{fav.title}</div>
                          <div className={`text-xs sm:text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} truncate`}>
                            {fav.channel}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFavorites(favorites.filter((f) => f.videoId !== fav.videoId));
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          ❌
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className={`${containerClass} rounded-lg overflow-hidden shadow-lg border ${borderClass}`}>
                <div className={`p-4 border-b ${borderClass}`}>
                  <h2 className="text-xl font-semibold">Recently Played</h2>
                </div>
                {history.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                      No history yet. Play a song to get started!
                    </p>
                  </div>
                ) : (
                  <ul className={`divide-y ${borderClass} max-h-[600px] overflow-y-auto`}>
                    {history.map((videoId, idx) => {
                      const item = results.find((r) => getVideoId(r) === videoId);
                      const fav = favorites.find((f) => f.videoId === videoId);
                      const title = item?.snippet.title || fav?.title || "Unknown";
                      const channel = item?.snippet.channelTitle || fav?.channel || "Unknown";
                      const thumbnail = fav?.thumbnail || item?.snippet.thumbnails?.default?.url || "";

                      return (
                        <li
                          key={idx}
                          className={`flex items-center gap-4 p-4 cursor-pointer transition-all ${
                            videoId === selected
                              ? theme === "dark"
                                ? "bg-blue-600/30"
                                : "bg-blue-100"
                              : theme === "dark"
                              ? "hover:bg-gray-700"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => playVideo(videoId, title, channel)}
                        >
                          {thumbnail && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumbnail}
                              alt="thumb"
                              width={60}
                              height={60}
                              className="rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm sm:text-base truncate">{title}</div>
                            <div className={`text-xs sm:text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} truncate`}>
                              {channel}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Player Panel */}
          <div className="lg:col-span-1">
            <div className={`sticky top-4 ${containerClass} rounded-lg shadow-lg p-6 border ${borderClass}`}>
              <h2 className="text-xl font-semibold mb-4">Now Playing</h2>
              {selected ? (
                <div className="space-y-4">
                  <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-xl">
                    <div className="aspect-video">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${selected}?autoplay=1&rel=0`}
                        title="YouTube player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded"
                      />
                    </div>
                  </div>

                  {/* Volume Control */}
                  <div className={`space-y-2 p-3 rounded ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
                    <label className="text-sm font-semibold">Volume: {volume}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={() => setSelected(null)}
                    className={`w-full ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"} px-4 py-2 rounded font-medium transition-colors`}
                  >
                    ⏹️ Stop
                  </button>
                </div>
              ) : (
                <div className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-lg p-8 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  <p className="text-sm">👈 Select a song to play</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
