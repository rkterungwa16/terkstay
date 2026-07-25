// Room types a given hotel actually stocks (gated by roomType.minStars), with
// nightly price and rooms-left computed from that hotel's own config data.
export function getHotelRooms(hotel, roomTypes) {
  return roomTypes
    .filter((rt) => hotel.stars >= rt.minStars)
    .map((rt) => {
      const left = hotel.availability?.[rt.id] ?? 0;
      const nightly = Math.round((rt.basePrice * hotel.priceFactor) / 500) * 500;
      return { ...rt, nightly, left };
    });
}

// Does this hotel have at least one room that fits the guest count and has stock?
export function hotelAvailability(hotel, roomTypes, guests) {
  const rooms = getHotelRooms(hotel, roomTypes).filter((r) => r.capacity >= guests && r.left > 0);
  const totalLeft = rooms.reduce((sum, r) => sum + r.left, 0);
  const cheapest = rooms.length ? Math.min(...rooms.map((r) => r.nightly)) : null;
  return { fits: rooms.length > 0, totalLeft, cheapest };
}
