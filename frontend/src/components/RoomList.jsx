import RoomCard from "./RoomCard.jsx";
import ResultsHeader from "./ResultsHeader.jsx";
import { getHotelRooms } from "../utils/hotelData.js";
import { formatDate, plural } from "../utils/format.js";

export default function RoomList({
  hotel,
  roomTypes,
  amenities,
  search,
  hotelCardContent,
  roomCardContent,
  currencySymbol,
  dateLocale,
  onBack,
  onBookRoom
}) {
  const rooms = getHotelRooms(hotel, roomTypes);
  const title = `${hotel.name} — ${hotel.area}`;
  const meta = `${formatDate(search.checkIn, dateLocale)} → ${formatDate(search.checkOut, dateLocale)} · ${
    search.nights
  } night${plural(search.nights)} · ${search.guests} guest${plural(search.guests)}`;

  return (
    <>
      <ResultsHeader title={title} meta={meta} backLabel={hotelCardContent.backToHotelsLabel} onBack={onBack} />
      <div className="room-grid">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            guests={search.guests}
            amenities={amenities}
            content={roomCardContent}
            currencySymbol={currencySymbol}
            onBook={(r) => onBookRoom(hotel, r)}
          />
        ))}
      </div>
    </>
  );
}
