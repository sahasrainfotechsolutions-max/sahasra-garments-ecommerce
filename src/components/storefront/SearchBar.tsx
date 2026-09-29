'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search sarees, shirts, kurtis, denim...',
  className = '',
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-100 hover:bg-neutral-200/70 focus:bg-white border border-transparent focus:border-neutral-300 rounded-full transition outline-none placeholder:text-neutral-400"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute left-3 text-neutral-400 hover:text-neutral-700 transition"
      >
        <Search size={16} />
      </button>
    </form>
  );
};
