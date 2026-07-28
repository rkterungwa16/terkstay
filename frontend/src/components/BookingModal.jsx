import { useEffect, useRef, useState } from "react";
import Button from "./Button.jsx";
import PaymentOptions from "./PaymentOptions.jsx";
import BookingSummary from "./BookingSummary.jsx";
import ConfirmationView from "./ConfirmationView.jsx";
import { genBookingRef } from "../utils/format.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+0-9][0-9 ]{6,}$/;

function getFocusable(container) {
  if (!container) return [];
  return [
    ...container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ];
}

export default function BookingModal({ hotel, room, search, policies, modalContent, confirmationContent, onClose }) {
  const [step, setStep] = useState("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [requests, setRequests] = useState("");
  const [payMethod, setPayMethod] = useState(modalContent.paymentMethods[0]);
  const [showError, setShowError] = useState(false);
  const [reference, setReference] = useState("");

  const panelRef = useRef(null);
  const lastFocusedRef = useRef(null);

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

  // This component only ever renders while the modal is open (App.jsx
  // mounts/unmounts it based on `booking` state, unlike the mobile nav
  // drawer which stays mounted with an `open` prop) — so focus management
  // runs once on mount and restores on unmount, rather than reacting to an
  // open/closed transition. Same reasoning as the admin sidebar drawer and
  // MobileNavDrawer: capture what had focus, move focus in, restore on the
  // way out.
  useEffect(() => {
    lastFocusedRef.current = document.activeElement;
    const focusables = getFocusable(panelRef.current);
    (focusables[0] || panelRef.current)?.focus();

    return () => {
      if (lastFocusedRef.current && document.contains(lastFocusedRef.current)) {
        lastFocusedRef.current.focus();
      }
    };
  }, []);

  // Body scroll lock while the modal is up, and the Tab trap + Escape.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    function onKeydown(e) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = getFocusable(panelRef.current);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeydown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeydown);
    };
  }, [onClose]);

  if (!hotel || !room) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !EMAIL_RE.test(email.trim()) || !PHONE_RE.test(phone.trim())) {
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
      <div className="modal" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="bookingModalTitle">
        <div className="modal-head">
          <h3 id="bookingModalTitle">{step === "form" ? modalContent.title : modalContent.confirmedTitle}</h3>
          <button className="modal-close" aria-label="Close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          {step === "form" ? (
            <>
              <BookingSummary hotel={hotel} room={room} search={search} policies={policies} />
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="field full">
                    <label htmlFor="guestName">{modalContent.fields.name}</label>
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
                    <label htmlFor="guestEmail">{modalContent.fields.email}</label>
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
                    <label htmlFor="guestPhone">{modalContent.fields.phone}</label>
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
                    <label htmlFor="guestRequests">{modalContent.fields.requests}</label>
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
                  <div className="error-text" role="alert">
                    {modalContent.errorText}
                  </div>
                )}

                <div className="field" style={{ marginTop: 16 }}>
                  <label>{modalContent.paymentLabel}</label>
                  <PaymentOptions methods={modalContent.paymentMethods} selected={payMethod} onChange={setPayMethod} />
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
