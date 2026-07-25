export default function Footer({ content, cities }) {
  return (
    <>
      <div className="adire-strip" />
      <footer>
        <div className="footer-inner">
          <div>
            <strong>{content.chainName}</strong> — {cities.join(" · ")}
          </div>
          <div>
            Reservations: {content.phone} · {content.email}
          </div>
        </div>
      </footer>
    </>
  );
}
