import Button from "./Button.jsx";

export default function SearchPanel({
  content,
  buttonLabel,
  cities,
  branch,
  onBranchChange,
  checkIn,
  onCheckInChange,
  checkOut,
  onCheckOutChange,
  guests,
  onGuestsChange,
  minDate,
  onSubmit
}) {
  return (
    <form className="search-panel" id="searchPanelForm" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="branchSelect">{content.labels.branch}</label>
        <select id="branchSelect" value={branch} onChange={(e) => onBranchChange(e.target.value)}>
          <option value="">{content.allBranchesLabel}</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="checkIn">{content.labels.checkIn}</label>
        <input
          type="date"
          id="checkIn"
          value={checkIn}
          min={minDate}
          onChange={(e) => onCheckInChange(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="checkOut">{content.labels.checkOut}</label>
        <input
          type="date"
          id="checkOut"
          value={checkOut}
          onChange={(e) => onCheckOutChange(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="guestsInput">{content.labels.guests}</label>
        <input
          type="number"
          id="guestsInput"
          min="1"
          max="8"
          value={guests}
          onChange={(e) => onGuestsChange(parseInt(e.target.value, 10) || 1)}
          required
        />
      </div>
      <div className="field search-btn-cell">
        <Button type="submit">{buttonLabel}</Button>
      </div>
    </form>
  );
}
