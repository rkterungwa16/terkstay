import { formatNaira, formatDate, plural } from "../utils/format.js";

export default function BookingSummary({ hotel, room, search, policies, extraRows }) {
  const sub = room.nightly * search.nights;
  const vat = sub * policies.vatRate;
  const service = sub * policies.serviceRate;
  const total = sub + vat + service;

  return (
    <div className="summary-box">
      <div className="summary-row">
        <span>
          {room.tag} — {hotel.name}
        </span>
        <span>
          {search.nights} night{plural(search.nights)}
        </span>
      </div>
      <div className="summary-row">
        <span>
          {formatDate(search.checkIn, policies.dateLocale)} → {formatDate(search.checkOut, policies.dateLocale)}
        </span>
        <span>
          {search.guests} guest{plural(search.guests)}
        </span>
      </div>
      <div className="summary-row">
        <span>Room subtotal</span>
        <span>{formatNaira(sub, policies.currencySymbol)}</span>
      </div>
      <div className="summary-row">
        <span>VAT ({(policies.vatRate * 100).toFixed(1)}%)</span>
        <span>{formatNaira(vat, policies.currencySymbol)}</span>
      </div>
      <div className="summary-row">
        <span>Service charge ({(policies.serviceRate * 100).toFixed(0)}%)</span>
        <span>{formatNaira(service, policies.currencySymbol)}</span>
      </div>
      {extraRows}
      <div className="summary-row total">
        <span>Total due</span>
        <span>{formatNaira(total, policies.currencySymbol)}</span>
      </div>
    </div>
  );
}

export function computeTotal(room, search, policies) {
  const sub = room.nightly * search.nights;
  const vat = sub * policies.vatRate;
  const service = sub * policies.serviceRate;
  return sub + vat + service;
}
