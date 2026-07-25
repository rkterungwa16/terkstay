import Button from "./Button.jsx";
import BookingSummary from "./BookingSummary.jsx";

export default function ConfirmationView({ content, hotel, room, search, policies, guestName, payMethod, reference, onNewBooking }) {
  return (
    <div className="confirm-wrap">
      <div className="stamp">
        <b>{content.stampWord}</b>
        <span>{content.badgeText}</span>
      </div>
      <div className="confirm-ref">{reference}</div>
      <p className="confirm-note">{content.note}</p>
      <BookingSummary
        hotel={hotel}
        room={room}
        search={search}
        policies={policies}
        extraRows={
          <>
            <div className="summary-row">
              <span>Guest</span>
              <span>{guestName}</span>
            </div>
            <div className="summary-row">
              <span>Payment method</span>
              <span>{payMethod}</span>
            </div>
          </>
        }
      />
      <div className="modal-actions" style={{ justifyContent: "center", marginTop: 24 }}>
        <Button onClick={onNewBooking}>{content.newBookingLabel}</Button>
      </div>
    </div>
  );
}
