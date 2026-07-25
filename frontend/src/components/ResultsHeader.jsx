export default function ResultsHeader({ title, meta, backLabel, onBack }) {
  return (
    <>
      {backLabel && (
        <button className="back-link" onClick={onBack}>
          {backLabel}
        </button>
      )}
      <div className="section-heading">
        <h2>{title}</h2>
        <div className="meta">{meta}</div>
      </div>
    </>
  );
}
