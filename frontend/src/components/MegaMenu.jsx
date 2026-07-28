export default function MegaMenu({ megaMenu, onNavigate }) {
  const { columns = [], featured } = megaMenu;

  return (
    <div className="mega-menu" role="menu">
      <div className="mega-menu-columns">
        {columns.map((col) => (
          <div className="mega-menu-column" key={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((link) => (
                <li key={link.title}>
                  <a href={link.url} onClick={onNavigate}>{link.title}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {featured && (
        <div className="mega-menu-featured">
          {featured.image && <img src={featured.image} alt="" />}
          <div className="mega-menu-featured-title">{featured.title}</div>
          {featured.description && <p>{featured.description}</p>}
          {featured.buttonText && (
            <a className="mega-menu-featured-btn" href={featured.buttonUrl || "#"} onClick={onNavigate}>
              {featured.buttonText}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
