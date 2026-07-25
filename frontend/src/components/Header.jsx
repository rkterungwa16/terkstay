export default function Header({ content, cities }) {
  return (
    <>
      <header className="site">
        <div className="header-inner">
          <div className="logo">
            {content.logoText} <small>{content.logoSubtitle}</small>
          </div>
          {content.showBranchNav && (
            <nav className="branches">
              {cities.map((city) => (
                <span key={city}>{city}</span>
              ))}
            </nav>
          )}
        </div>
      </header>
      <div className="adire-strip" />
    </>
  );
}
