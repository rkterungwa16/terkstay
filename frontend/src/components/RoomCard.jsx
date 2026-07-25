import Button from "./Button.jsx";
import AmenityIcon from "./AmenityIcon.jsx";
import { formatNaira, tpl, plural } from "../utils/format.js";

export default function RoomCard({ room, guests, amenities, content, currencySymbol, onBook }) {
  const fitsGuests = room.capacity >= guests;
  const soldOut = room.left <= 0;
  const disabled = soldOut || !fitsGuests;

  return (
    <div className={`room-card${disabled ? " sold-out" : ""}`}>
      <div className="room-visual" style={{ background: room.color }}>
        <span className="tier-tag">{room.tag}</span>
      </div>
      <div className="room-body">
        <h3>{room.tag}</h3>
        <div className="amenity-list">
          {room.amenities.map((key) => {
            const a = amenities[key];
            if (!a) return null;
            return (
              <span className="amenity-pill" key={key}>
                <AmenityIcon name={a.icon} />
                {a.label}
              </span>
            );
          })}
        </div>
        <div className="capacity-note">
          {tpl(content.sleepsLabel, { n: room.capacity, s: plural(room.capacity) })}
          {!fitsGuests && content.notEnoughLabel}
        </div>
        {!disabled && (
          <div className="left-note">{tpl(content.leftLabel, { n: room.left, s: plural(room.left) })}</div>
        )}
        <div className="room-footer">
          <div className="price room-price">
            {formatNaira(room.nightly, currencySymbol)}
            <span>per night</span>
          </div>
          <Button disabled={disabled} onClick={() => !disabled && onBook(room)}>
            {soldOut ? content.soldOutLabel : content.bookLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
