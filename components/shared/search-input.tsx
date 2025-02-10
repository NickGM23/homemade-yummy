'use client';

import { Search } from 'lucide-react';
import React from 'react';

export const SearchInput = () => {
  return (
    <>
      <div className="relative flex h-11 flex-1 justify-between rounded-2xl">
        <Search className="absolute left-3 top-1/2 h-5 translate-y-[-50%] text-gray-400" />
        <input
          className="w-full rounded-2xl bg-gray-50 pl-11 outline-none"
          type="text"
          placeholder="Знайти смаколик..."
        />
      </div>
    </>
  );
};
