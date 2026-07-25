import { useEffect, useState } from "react";
import Button from "./Button.jsx";
import PaymentOptions from "./PaymentOptions.jsx";
import BookingSummary from "./BookingSummary.jsx";
import ConfirmationView from "./ConfirmationView.jsx";
import { genBookingRef } from "../utils/format.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+0-9][0-9 ]{6,}$/;

export default function BookingModal({
  hotel,
  room,
  search,
  policies,
  modalContent,
  confirmationContent,
  onClose,
}) {
  const [step, setStep] = useState("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [requests, setRequests] = useState("");
  const [payMethod, setPayMethod] = useState(modalContent.paymentMethods[0]);
  const [showError, setShowError] = useState(false);
  const [reference, setReference] = useState("");

  // Reset local form state whenever a new room is opened for booking
  useEffect(() => {
    setStep("form");
    setName("");
    setEmail("");
    setPhone("");
    setRequests("");
    setPayMethod(modalContent.paymentMethods[0]);
    setShowError(false);
  }, [hotel, room, modalContent.paymentMethods]);

  if (!hotel || !room) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (
      !name.trim() ||
      !EMAIL_RE.test(email.trim()) ||
      !PHONE_RE.test(phone.trim())
    ) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setReference(genBookingRef());
    setStep("confirmed");
  }

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <h3>
            {step === "form" ? modalContent.title : modalContent.confirmedTitle}
          </h3>
          <button className="modal-close" aria-label="Close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          {step === "form" ? (
            <>
              <BookingSummary
                hotel={hotel}
                room={room}
                search={search}
                policies={policies}
              />
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="field full">
                    <label htmlFor="guestName">
                      {modalContent.fields.name}
                    </label>
                    <input
                      type="text"
                      id="guestName"
                      placeholder={modalContent.fields.namePlaceholder}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="guestEmail">
                      {modalContent.fields.email}
                    </label>
                    <input
                      type="email"
                      id="guestEmail"
                      placeholder={modalContent.fields.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="guestPhone">
                      {modalContent.fields.phone}
                    </label>
                    <input
                      type="tel"
                      id="guestPhone"
                      placeholder={modalContent.fields.phonePlaceholder}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="field full">
                    <label htmlFor="guestRequests">
                      {modalContent.fields.requests}
                    </label>
                    <input
                      type="text"
                      id="guestRequests"
                      placeholder={modalContent.fields.requestsPlaceholder}
                      value={requests}
                      onChange={(e) => setRequests(e.target.value)}
                    />
                  </div>
                </div>

                {showError && (
                  <div className="error-text">{modalContent.errorText}</div>
                )}

                <div className="field" style={{ marginTop: 16 }}>
                  <label>{modalContent.paymentLabel}</label>
                  <PaymentOptions
                    methods={modalContent.paymentMethods}
                    selected={payMethod}
                    onChange={setPayMethod}
                  />
                </div>

                <div className="modal-actions">
                  <Button variant="outline" type="button" onClick={onClose}>
                    {modalContent.cancelLabel}
                  </Button>
                  <Button type="submit">{modalContent.confirmLabel}</Button>
                </div>
              </form>
            </>
          ) : (
            <ConfirmationView
              content={confirmationContent}
              hotel={hotel}
              room={room}
              search={search}
              policies={policies}
              guestName={name}
              payMethod={payMethod}
              reference={reference}
              onNewBooking={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
