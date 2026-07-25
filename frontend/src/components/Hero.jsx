export default function Hero({ content, children }) {
  return (
    <section className="hero adire-bg">
      <div className="hero-eyebrow">{content.eyebrow}</div>
      <h1>{content.heading}</h1>
      <p className="lede">{content.lede}</p>
      {children}
    </section>
  );
}
