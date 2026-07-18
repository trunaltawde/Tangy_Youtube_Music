'use client';

import React, { useState, useEffect } from 'react';

interface SearchResult {
  id: string | { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: { medium: { url: string } };
  };
}

interface Favorite {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  addedAt: number;
}

interface Playlist {
  id: string;
  name: string;
  songs: Favorite[];
  createdAt: number;
}

type Mood = 'peaceful' | 'energetic' | 'romantic' | 'chill' | 'focused' | 'party';

const moodThemes: Record<Mood, { label: string; image: string; colors: { primary: string; secondary: string } }> = {
  peaceful: {
    label: 'Peaceful',
    image: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1200&q=80',
    colors: { primary: 'from-blue-400', secondary: 'to-cyan-300' },
  },
  energetic: {
    label: 'Energetic',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80',
    colors: { primary: 'from-red-500', secondary: 'to-orange-400' },
  },
  romantic: {
    label: 'Romantic',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
    colors: { primary: 'from-pink-500', secondary: 'to-red-400' },
  },
  chill: {
    label: 'Chill',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80',
    colors: { primary: 'from-indigo-500', secondary: 'to-purple-400' },
  },
  focused: {
    label: 'Focused',
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=80',
    colors: { primary: 'from-amber-600', secondary: 'to-orange-500' },
  },
  party: {
    label: 'Party',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80',
    colors: { primary: 'from-violet-500', secondary: 'to-pink-500' },
  },
};

export default function SearchClient() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'favorites' | 'playlists' | 'recommendations'>('search');
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number>(-1);
  const [volume, setVolume] = useState(70);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [selectedMood, setSelectedMood] = useState<Mood>('peaceful');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showPlaylistForm, setShowPlaylistForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [recommendations, setRecommendations] = useState<Favorite[]>([]);

  useEffect(() => {
    setMounted(true);
    const savedFavorites = localStorage.getItem('favorites');
    const savedVolume = localStorage.getItem('volume');
    const savedTheme = localStorage.getItem('isDarkTheme');
    const savedMood = localStorage.getItem('selectedMood');
    const savedRecentSearches = localStorage.getItem('recentSearches');
    const savedPlaylists = localStorage.getItem('playlists');

    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedVolume) setVolume(JSON.parse(savedVolume));
    if (savedTheme !== null) setIsDarkTheme(JSON.parse(savedTheme));
    if (savedMood) setSelectedMood(JSON.parse(savedMood));
    if (savedRecentSearches) setRecentSearches(JSON.parse(savedRecentSearches));
    if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('volume', JSON.stringify(volume));
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('isDarkTheme', JSON.stringify(isDarkTheme));
  }, [isDarkTheme]);

  useEffect(() => {
    localStorage.setItem('selectedMood', JSON.stringify(selectedMood));
  }, [selectedMood]);

  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    localStorage.setItem('playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    generateRecommendations();
  }, [favorites, selectedMood]);

  const generateRecommendations = () => {
    if (favorites.length === 0) {
      setRecommendations([]);
      return;
    }

    const moodKeywords: Record<Mood, string[]> = {
      peaceful: ['lo-fi', 'ambient', 'meditation', 'sleep', 'relaxing'],
      energetic: ['party', 'workout', 'pump up', 'dance', 'electronic'],
      romantic: ['love songs', 'romantic', 'couples', 'ballad', 'slow'],
      chill: ['chill', 'indie', 'alternative', 'folk', 'acoustic'],
      focused: ['focus', 'study', 'jazz', 'classical', 'concentration'],
      party: ['party', 'club', 'edm', 'hip hop', 'pop'],
    };

    const keywords = moodKeywords[selectedMood];
    const shuffledFavorites = [...favorites].sort(() => Math.random() - 0.5);
    const recommended = shuffledFavorites.slice(0, Math.min(5, favorites.length));

    setRecommendations(recommended);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      let searchResults = data.items || [];

      if (shuffleMode) {
        searchResults = searchResults.sort(() => Math.random() - 0.5);
      }

      setResults(searchResults);
      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s !== query);
        return [query, ...filtered].slice(0, 5);
      });
    } catch (err) {
      setError('Failed to search. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (video: SearchResult) => {
    const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
    const isFavorited = favorites.some((f) => f.videoId === videoId);

    if (isFavorited) {
      setFavorites((prev) => prev.filter((f) => f.videoId !== videoId));
    } else {
      const newFavorite: Favorite = {
        videoId,
        title: video.snippet.title,
        channel: video.snippet.channelTitle,
        thumbnail: video.snippet.thumbnails.medium.url,
        addedAt: Date.now(),
      };
      setFavorites((prev) => [...prev, newFavorite]);
    }
  };

  const isFavorited = (videoId: string) => {
    return favorites.some((f) => f.videoId === videoId);
  };

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName,
      songs: [],
      createdAt: Date.now(),
    };

    setPlaylists((prev) => [...prev, newPlaylist]);
    setNewPlaylistName('');
    setShowPlaylistForm(false);
  };

  const addToPlaylist = (playlistId: string, song: Favorite) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId && !p.songs.some((s) => s.videoId === song.videoId)) {
          return { ...p, songs: [...p.songs, song] };
        }
        return p;
      })
    );
  };

  const removeFromPlaylist = (playlistId: string, videoId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          return { ...p, songs: p.songs.filter((s) => s.videoId !== videoId) };
        }
        return p;
      })
    );
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    setSelectedPlaylist(null);
  };

  const shuffleResults = () => {
    setResults((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const shuffleFavorites = () => {
    const shuffled = [...favorites].sort(() => Math.random() - 0.5);
    setFavorites(shuffled);
  };

  const playNext = () => {
    if (results.length === 0) return;
    const nextIndex = (currentPlayingIndex + 1) % results.length;
    const nextVideo = results[nextIndex];
    const videoId = typeof nextVideo.id === 'string' ? nextVideo.id : nextVideo.id.videoId;
    setCurrentPlayingIndex(nextIndex);
    setPlayingVideoId(videoId);
  };

  const playPrevious = () => {
    if (results.length === 0) return;
    const prevIndex = currentPlayingIndex <= 0 ? results.length - 1 : currentPlayingIndex - 1;
    const prevVideo = results[prevIndex];
    const videoId = typeof prevVideo.id === 'string' ? prevVideo.id : prevVideo.id.videoId;
    setCurrentPlayingIndex(prevIndex);
    setPlayingVideoId(videoId);
  };

  const playVideo = (videoId: string, index: number) => {
    setCurrentPlayingIndex(index);
    setPlayingVideoId(videoId);
  };

  if (!mounted) return null;

  const theme = isDarkTheme ? 'dark bg-gray-900 text-white' : 'light bg-white text-gray-900';
  const moodImage = moodThemes[selectedMood].image;

  return (
    <div className={`${theme} transition-colors duration-300 min-h-screen`}>
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${moodImage})` }}
      >
        <div className={`absolute inset-0 ${isDarkTheme ? 'bg-black/40' : 'bg-white/20'}`} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className={`${isDarkTheme ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm border-b ${isDarkTheme ? 'border-gray-800' : 'border-gray-200'} sticky top-0 p-4`}>
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">🎵 Tangy Youtube Music</h1>

            <div className="flex items-center gap-2">
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value as Mood)}
                className={`px-3 py-2 rounded border ${
                  isDarkTheme
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-900'
                }`}
              >
                {Object.entries(moodThemes).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsDarkTheme(!isDarkTheme)}
                className={`px-3 py-2 rounded transition ${
                  isDarkTheme
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {isDarkTheme ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content - Split Layout */}
        <main className="flex-1 w-full p-2 flex gap-2 overflow-hidden">
          {/* Left Side - Search and Results (1/4 width) */}
          <div className={`w-1/4 flex flex-col space-y-2 overflow-y-auto ${isDarkTheme ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm rounded-lg p-2`}>
            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {(['search', 'favorites', 'playlists', 'recommendations'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-sm rounded font-semibold transition ${
                    activeTab === tab
                      ? isDarkTheme
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-400 text-white'
                      : isDarkTheme
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                >
                  {tab === 'search' ? 'Search' : tab === 'favorites' ? `Favorites (${favorites.length})` : tab === 'playlists' ? `Playlists (${playlists.length})` : 'Recommendations'}
                </button>
              ))}
            </div>

            {/* SEARCH TAB */}
            {activeTab === 'search' && (
            <div className="space-y-2">
              <div className="flex gap-1 flex-col items-stretch">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search..."
                  className={`px-2 py-1 text-sm rounded border ${
                    isDarkTheme
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <div className="flex gap-1">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className={`flex-1 px-2 py-1 text-xs rounded font-semibold transition ${
                    isDarkTheme
                      ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700'
                      : 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300'
                  }`}
                >
                  {loading ? 'Search...' : 'Search'}
                </button>
                <button
                  onClick={() => {
                    setShuffleMode(!shuffleMode);
                    if (results.length > 0) shuffleResults();
                  }}
                  className={`flex-1 px-2 py-1 text-xs rounded font-semibold transition ${
                    shuffleMode
                      ? isDarkTheme
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-green-500 hover:bg-green-600'
                      : isDarkTheme
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                >
                  🔀 {shuffleMode ? 'ON' : 'OFF'}
                </button>
                </div>
              </div>

              {/* Recent Searches - Hidden to save space */}
              {recentSearches.length > 0 && (
                <div className="space-y-1 hidden">
                  <p className="text-xs opacity-70">Recent:</p>
                  <div className="flex gap-1 flex-wrap">
                    {recentSearches.map((search) => (
                      <button
                        key={search}
                        onClick={() => {
                          setQuery(search);
                          setTimeout(() => {
                            setQuery(search);
                            handleSearch();
                          }, 0);
                        }}
                        className={`px-2 py-0.5 rounded text-xs transition ${
                          isDarkTheme
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && <div className="text-xs text-red-500 font-semibold">{error}</div>}

              {/* Results Grid - Ultra compact */}
              <div className="grid grid-cols-1 gap-2 auto-rows-max">
                {results.map((video, index) => {
                  const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
                  const isFav = isFavorited(videoId);

                  return (
                    <div
                      key={videoId}
                      className={`rounded overflow-hidden shadow transition transform hover:scale-105 cursor-pointer flex gap-2 ${
                        isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'
                      }`}
                    >
                      <img
                        src={video.snippet.thumbnails.medium.url}
                        alt={video.snippet.title}
                        className="w-16 h-16 object-cover flex-shrink-0"
                        onClick={() => playVideo(videoId, index)}
                      />
                      <div className="p-1 flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-xs line-clamp-2">{video.snippet.title}</h3>
                          <p className="text-xs opacity-70 line-clamp-1">{video.snippet.channelTitle}</p>
                        </div>
                        <div className="flex gap-1 mt-1">
                          <button
                            onClick={() => toggleFavorite(video)}
                            className={`flex-1 px-1 py-0.5 rounded text-xs font-semibold transition ${
                              isFav
                                ? isDarkTheme
                                  ? 'bg-red-600 hover:bg-red-700'
                                  : 'bg-red-500 hover:bg-red-600'
                                : isDarkTheme
                                  ? 'bg-gray-700 hover:bg-gray-600'
                                  : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                          >
                            {isFav ? '❤️' : '🤍'}
                          </button>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                addToPlaylist(e.target.value, {
                                  videoId,
                                  title: video.snippet.title,
                                  channel: video.snippet.channelTitle,
                                  thumbnail: video.snippet.thumbnails.medium.url,
                                  addedAt: Date.now(),
                                });
                                e.target.value = '';
                              }
                            }}
                            className={`flex-1 px-1 py-0.5 rounded text-xs ${
                              isDarkTheme
                                ? 'bg-gray-700 text-white'
                                : 'bg-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="">Add to PL</option>
                            {playlists.map((pl) => (
                              <option key={pl.id} value={pl.id}>
                                {pl.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FAVORITES TAB */}
          {activeTab === 'favorites' && (
            <div className="space-y-4">
              {favorites.length > 0 && (
                <button
                  onClick={shuffleFavorites}
                  className={`px-4 py-2 rounded font-semibold transition ${
                    isDarkTheme
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  🔀 Shuffle Favorites
                </button>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-max">
                {favorites.map((fav) => (
                  <div
                    key={fav.videoId}
                    className={`rounded-lg overflow-hidden shadow-lg transition transform hover:scale-105 cursor-pointer ${
                      isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'
                    }`}
                  >
                    <img
                      src={fav.thumbnail}
                      alt={fav.title}
                      className="w-full h-40 object-cover"
                      onClick={() => setPlayingVideoId(fav.videoId)}
                    />
                    <div className="p-3">
                      <h3 className="font-bold text-sm line-clamp-2">{fav.title}</h3>
                      <p className="text-xs opacity-70">{fav.channel}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => setPlayingVideoId(fav.videoId)}
                          className={`flex-1 px-2 py-1 rounded text-sm font-semibold transition ${
                            isDarkTheme
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'bg-blue-500 hover:bg-blue-600'
                          }`}
                        >
                          ▶️ Play
                        </button>
                        <button
                          onClick={() => setFavorites((prev) => prev.filter((f) => f.videoId !== fav.videoId))}
                          className={`flex-1 px-2 py-1 rounded text-sm font-semibold transition ${
                            isDarkTheme
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-red-500 hover:bg-red-600'
                          }`}
                        >
                          ❌ Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PLAYLISTS TAB */}
          {activeTab === 'playlists' && (
            <div className="space-y-4">
              <button
                onClick={() => setShowPlaylistForm(!showPlaylistForm)}
                className={`px-4 py-2 rounded font-semibold transition ${
                  isDarkTheme
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                ➕ New Playlist
              </button>

              {showPlaylistForm && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Playlist name..."
                    className={`flex-1 px-3 py-2 rounded border ${
                      isDarkTheme
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                    onKeyPress={(e) => e.key === 'Enter' && createPlaylist()}
                  />
                  <button
                    onClick={createPlaylist}
                    className={`px-4 py-2 rounded font-semibold ${
                      isDarkTheme ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    Create
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className={`rounded-lg p-4 border ${
                      isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{playlist.name}</h3>
                        <p className="text-sm opacity-70">{playlist.songs.length} songs</p>
                      </div>
                      <button
                        onClick={() => deletePlaylist(playlist.id)}
                        className="px-3 py-1 rounded text-sm font-semibold bg-red-600 hover:bg-red-700 text-white"
                      >
                        🗑️ Delete
                      </button>
                    </div>

                    {playlist.songs.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {playlist.songs.map((song) => (
                          <div
                            key={song.videoId}
                            className={`rounded p-2 ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-200'}`}
                          >
                            <p className="font-semibold text-sm line-clamp-2">{song.title}</p>
                            <button
                              onClick={() => removeFromPlaylist(playlist.id, song.videoId)}
                              className="text-xs mt-2 text-red-500 hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RECOMMENDATIONS TAB */}
          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <div className={`rounded-lg p-4 ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <p className="text-sm opacity-70">
                  {recommendations.length > 0
                    ? `Based on your ${selectedMood} mood and favorites:`
                    : 'Add favorites to get personalized recommendations'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-max">
                {recommendations.map((rec) => (
                  <div
                    key={rec.videoId}
                    className={`rounded-lg overflow-hidden shadow-lg transition transform hover:scale-105 cursor-pointer ${
                      isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'
                    }`}
                  >
                    <img
                      src={rec.thumbnail}
                      alt={rec.title}
                      className="w-full h-40 object-cover"
                      onClick={() => setPlayingVideoId(rec.videoId)}
                    />
                    <div className="p-3">
                      <h3 className="font-bold text-sm line-clamp-2">{rec.title}</h3>
                      <p className="text-xs opacity-70">{rec.channel}</p>
                      <button
                        onClick={() => setPlayingVideoId(rec.videoId)}
                        className={`w-full mt-2 px-2 py-1 rounded text-sm font-semibold transition ${
                          isDarkTheme
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                      >
                        ▶️ Play
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
            </div>
            
          {/* Right Side - Player (3/4 width) - Transparent background */}
          {playingVideoId ? (
            <div className={`flex-1 rounded-lg p-4 flex flex-col bg-transparent`}>
              <div className="space-y-4 flex-1 flex flex-col">
                {/* Player Iframe - Big */}
                <div className="flex-1 flex flex-col">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${playingVideoId}?autoplay=1`}
                    frameBorder="0"
                    allow="autoplay"
                    className="rounded flex-1"
                  />
                </div>

                {/* Track Info */}
                {results.length > 0 && (
                  <div className="text-center text-sm opacity-70 pb-2">
                    Playing {currentPlayingIndex + 1} of {results.length}
                  </div>
                )}

                {/* Controls */}
                <div className="space-y-2">
                  <button
                    onClick={playPrevious}
                    disabled={results.length === 0}
                    className={`w-full px-3 py-2 rounded font-semibold transition ${
                      results.length === 0
                        ? isDarkTheme
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isDarkTheme
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    ⏮️ Previous
                  </button>
                  <button
                    onClick={playNext}
                    disabled={results.length === 0}
                    className={`w-full px-3 py-2 rounded font-semibold transition ${
                      results.length === 0
                        ? isDarkTheme
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isDarkTheme
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    Next ⏭️
                  </button>
                  <button
                    onClick={() => setPlayingVideoId(null)}
                    className="w-full px-3 py-2 rounded bg-red-600 hover:bg-red-700 font-semibold text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex-1 ${isDarkTheme ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm rounded-lg p-4 flex items-center justify-center`}>
              <div className="text-center">
                <p className="text-6xl opacity-70">🎵</p>
                <p className="text-lg opacity-70">Select a song to play</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
