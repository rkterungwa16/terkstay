import { SearchIcon } from "./HeaderIcons.jsx";

export default function SearchToggle({ onActivate }) {
  return (
    <button type="button" className="header-icon-btn" aria-label="Search hotels" onClick={onActivate}>
      <SearchIcon />
    </button>
  );
}
