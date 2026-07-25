import { textField, numberField, sectionCard } from "../fields.js";
import { wireField } from "../state.js";

export default {
  key: "policies",
  label: "Policies",
  description: "Currency, tax, and defaults",

  render(container, { state, bus }) {
    container.innerHTML = "";

    const { card, grid } = sectionCard(
      "Booking policies",
      "Currency formatting, VAT/service rates, and default search values."
    );

    const w = (fieldFn, path, opts) => grid.appendChild(wireField(fieldFn, { bus, state, path, ...opts }));

    w(textField, "policies.currency", { label: "Currency code", hint: 'ISO 4217, e.g. "NGN"' });
    w(textField, "policies.currencySymbol", { label: "Currency symbol", hint: 'Prefixed to prices, e.g. "₦"' });
    w(numberField, "policies.vatRate", { label: "VAT rate", step: 0.001, min: 0, max: 1, hint: "Decimal, e.g. 0.075 = 7.5%" });
    w(numberField, "policies.serviceRate", { label: "Service charge rate", step: 0.001, min: 0, max: 1, hint: "Decimal, e.g. 0.10 = 10%" });
    w(textField, "policies.dateLocale", { label: "Date locale", hint: 'BCP 47 locale, e.g. "en-NG"' });
    w(numberField, "policies.defaultGuests", { label: "Default guests", integer: true, min: 1 });
    w(numberField, "policies.defaultNights", { label: "Default nights", integer: true, min: 1 });

    container.appendChild(card);
  }
};
