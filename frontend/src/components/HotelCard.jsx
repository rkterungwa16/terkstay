import Button from "./Button.jsx";
import { formatNaira, starString, tpl, plural } from "../utils/format.js";

export default function HotelCard({ hotel, availability, content, currencySymbol, onView }) {
  const { fits, totalLeft, cheapest } = availability;

  return (
    <div className={`hotel-card${fits ? "" : " no-match"}`}>
      <div className="hotel-visual">
        <span className="city-tag">{hotel.city}</span>
        <span className="stars">{starString(hotel.stars)}</span>
      </div>
      <div className="hotel-body">
        <h3>{hotel.name}</h3>
        <div className="area-line">
          {hotel.area}, {hotel.state} State
        </div>
        <div className="hotel-desc">{hotel.description}</div>
        <div className="avail-note">
          {fits ? tpl(content.availableLabel, { count: totalLeft, s: plural(totalLeft) }) : content.noFitLabel}
        </div>
        <div className="hotel-footer">
          <div className="price">
            {cheapest ? formatNaira(cheapest, currencySymbol) : "—"}
            <span>{content.fromLabel}</span>
          </div>
          <Button size="sm" disabled={!fits} onClick={() => fits && onView(hotel)}>
            {fits ? content.viewRoomsLabel : content.unavailableLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
