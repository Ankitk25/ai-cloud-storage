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
    <form onSubmit={handleSearch} className="relative mb-6">
      <div className="relative flex items-center">
        <Search className="absolute left-3 text-gray-400 w-5 h-5" />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by filename, tags, or content..."
          className="
            w-full px-4 py-3 rounded-xl
            bg-[#0f1720]
            border border-cyan-500/20
            text-white
            placeholder-gray-500
            focus:outline-none
            focus:ring-2 focus:ring-cyan-500/40
            focus:border-cyan-400
            transition"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-14 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <button
          type="submit"
          className="absolute right-2 bg-indigo-600 text-white px-3 py-1 text-sm rounded-md hover:bg-indigo-700 transition"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;