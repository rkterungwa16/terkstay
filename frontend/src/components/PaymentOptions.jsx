export default function PaymentOptions({ methods, selected, onChange }) {
  return (
    <div className="pay-options">
      {methods.map((method) => (
        <label key={method} className={`pay-option${method === selected ? " selected" : ""}`}>
          <input
            type="radio"
            name="payMethod"
            value={method}
            checked={method === selected}
            onChange={() => onChange(method)}
          />
          {method}
        </label>
      ))}
    </div>
  );
}
