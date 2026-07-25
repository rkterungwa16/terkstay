import HotelCard from "./HotelCard.jsx";
import ResultsHeader from "./ResultsHeader.jsx";
import { hotelAvailability } from "../utils/hotelData.js";
import { formatDate, tpl, plural } from "../utils/format.js";

export default function HotelList({ hotels, roomTypes, search, content, searchPanelContent, currencySymbol, dateLocale, onSelectHotel }) {
  const matches = hotels.filter((h) => !search.branch || h.city === search.branch);

  const title = search.branch
    ? tpl(searchPanelContent.searchingTitleBranch, { branch: search.branch })
    : searchPanelContent.searchingTitleAll;

  const meta = `${formatDate(search.checkIn, dateLocale)} → ${formatDate(search.checkOut, dateLocale)} · ${
    search.nights
  } night${plural(search.nights)} · ${search.guests} guest${plural(search.guests)}`;

  return (
    <>
      <ResultsHeader title={title} meta={meta} />
      {matches.length === 0 ? (
        <div className="results-empty">No hotels found for that branch.</div>
      ) : (
        <div className="hotel-grid">
          {matches.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              availability={hotelAvailability(hotel, roomTypes, search.guests)}
              content={content}
              currencySymbol={currencySymbol}
              onView={onSelectHotel}
            />
          ))}
        </div>
      )}
    </>
  );
}
