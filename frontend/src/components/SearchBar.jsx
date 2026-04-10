import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch, onClear }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery('');
    onClear();
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <label
        htmlFor="search-files"
        className="mb-3 block text-xs font-medium uppercase tracking-[0.28em] text-slate-400"
      >
        Search library
      </label>
      <div className="surface-panel-soft relative flex items-center gap-3 rounded-3xl px-4 py-3">
        <Search className="h-5 w-5 shrink-0 text-slate-500" />

        <input
          id="search-files"
          type="text"
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            if (!value.trim()) {
              onClear();
            }
          }}
          placeholder="Search by filename, tags, or content..."
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-full p-2 text-slate-400 transition hover:bg-white/8 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
