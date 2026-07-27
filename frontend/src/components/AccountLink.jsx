import { UserIcon } from "./HeaderIcons.jsx";

export default function AccountLink() {
  return (
    <a href="#" className="header-icon-btn header-account-link" aria-label="My account">
      <UserIcon />
    </a>
  );
}
