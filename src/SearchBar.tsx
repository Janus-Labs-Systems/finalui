import React, { useState } from "react";

const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        className="search-box"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search... any locker number"
      />
      {"  "}
      <button className="search-click" type="submit">
        Search
      </button>
    </form>
  );
};
export default SearchBar;
