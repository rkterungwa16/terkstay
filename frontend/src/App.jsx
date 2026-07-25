import { useEffect, useMemo, useState } from "react";
import { useConfig } from "./hooks/useConfig.js";
import { applyTheme } from "./theme/applyTheme.js";
import { applyComponentStyles } from "./theme/applyComponentStyles.js";
import { nightsBetween } from "./utils/format.js";
import { hotelAvailability } from "./utils/hotelData.js";

import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import SearchPanel from "./components/SearchPanel.jsx";
import HotelList from "./components/HotelList.jsx";
import RoomList from "./components/RoomList.jsx";
import Footer from "./components/Footer.jsx";
import BookingModal from "./components/BookingModal.jsx";

export default function App() {
  const { config, loading, error } = useConfig();

  // Search/navigation state — lives here, passed down as props
  const [branch, setBranch] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [currentHotelId, setCurrentHotelId] = useState(null);
  const [booking, setBooking] = useState(null); // { hotel, room } while the modal is open

  // Apply theme + per-component styles as soon as config arrives, and again if it changes
  useEffect(() => {
    if (!config) return;
    applyTheme(config.theme);
    applyComponentStyles(config.components);
  }, [config]);

  // Seed default dates/guests from policies, once, when config first arrives
  useEffect(() => {
    if (!config || checkIn) return;
    const today = new Date();
    const inDate = new Date(today.getTime() + 86400000);
    const outDate = new Date(today.getTime() + (1 + config.policies.defaultNights) * 86400000);
    setCheckIn(inDate.toISOString().slice(0, 10));
    setCheckOut(outDate.toISOString().slice(0, 10));
    setGuests(config.policies.defaultGuests);
  }, [config, checkIn]);

  const cities = useMemo(() => (config ? [...new Set(config.hotels.map((h) => h.city))] : []), [config]);

  const search = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    return { branch, checkIn, checkOut, nights: nightsBetween(checkIn, checkOut), guests };
  }, [branch, checkIn, checkOut, guests]);

  const currentHotel = useMemo(() => {
    if (!config || !currentHotelId) return null;
    return config.hotels.find((h) => h.id === currentHotelId) || null;
  }, [config, currentHotelId]);

  // If the active filters no longer match the hotel being viewed, fall back to the list
  useEffect(() => {
    if (!config || !currentHotel || !search) return;
    const stillFits = hotelAvailability(currentHotel, config.roomTypes, search.guests).fits;
    const stillInBranch = !search.branch || currentHotel.city === search.branch;
    if (!stillFits || !stillInBranch) setCurrentHotelId(null);
  }, [config, currentHotel, search]);

  if (loading) {
    return <div className="app-status">Loading…</div>;
  }

  if (error) {
    return (
      <div className="app-status">
        <h2>Could not load configuration</h2>
        <p>{error.message}</p>
        <p>
          Make sure the Node server is running: <code>node server.js</code>, then open{" "}
          <code>http://localhost:3000</code>.
        </p>
      </div>
    );
  }

  if (!config || !search) return null;

  const C = config.components;
  const today = new Date().toISOString().slice(0, 10);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (search.nights <= 0) alert("Check-out date must be after check-in date.");
  }

  return (
    <>
      <Header content={C.header.content} cities={cities} />

      <Hero content={C.hero.content}>
        <SearchPanel
          content={C.searchPanel.content}
          buttonLabel={C.hero.content.searchButtonLabel}
          cities={cities}
          branch={branch}
          onBranchChange={setBranch}
          checkIn={checkIn}
          onCheckInChange={setCheckIn}
          checkOut={checkOut}
          onCheckOutChange={setCheckOut}
          guests={guests}
          onGuestsChange={setGuests}
          minDate={today}
          onSubmit={handleSearchSubmit}
        />
      </Hero>

      <main>
        {search.nights <= 0 ? (
          <div className="results-empty">Check-out date must be after check-in date.</div>
        ) : currentHotel ? (
          <RoomList
            hotel={currentHotel}
            roomTypes={config.roomTypes}
            amenities={config.amenities}
            search={search}
            hotelCardContent={C.hotelCard.content}
            roomCardContent={C.roomCard.content}
            currencySymbol={config.policies.currencySymbol}
            dateLocale={config.policies.dateLocale}
            onBack={() => setCurrentHotelId(null)}
            onBookRoom={(hotel, room) => setBooking({ hotel, room })}
          />
        ) : (
          <HotelList
            hotels={config.hotels}
            roomTypes={config.roomTypes}
            search={search}
            content={C.hotelCard.content}
            searchPanelContent={C.searchPanel.content}
            currencySymbol={config.policies.currencySymbol}
            dateLocale={config.policies.dateLocale}
            onSelectHotel={(hotel) => setCurrentHotelId(hotel.id)}
          />
        )}
      </main>

      <Footer content={C.footer.content} cities={cities} />

      {booking && (
        <BookingModal
          hotel={booking.hotel}
          room={booking.room}
          search={search}
          policies={config.policies}
          modalContent={C.bookingModal.content}
          confirmationContent={C.confirmation.content}
          onClose={() => setBooking(null)}
        />
      )}
    </>
  );
}
