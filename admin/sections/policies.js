import { textField, numberField, sectionCard } from "../fields.js";

export default {
  key: "policies",
  label: "Policies",
  description: "Currency, tax, and defaults",

  render(container, draft, markDirty) {
    container.innerHTML = "";
    const p = draft.policies;

    const { card, grid } = sectionCard(
      "Booking policies",
      "Currency formatting, VAT/service rates, and default search values."
    );

    grid.appendChild(
      textField({
        label: "Currency code",
        value: p.currency,
        hint: 'ISO 4217, e.g. "NGN"',
        onChange: (v) => {
          p.currency = v;
          markDirty();
        }
      })
    );
    grid.appendChild(
      textField({
        label: "Currency symbol",
        value: p.currencySymbol,
        hint: 'Prefixed to prices, e.g. "₦"',
        onChange: (v) => {
          p.currencySymbol = v;
          markDirty();
        }
      })
    );
    grid.appendChild(
      numberField({
        label: "VAT rate",
        value: p.vatRate,
        step: 0.001,
        min: 0,
        max: 1,
        hint: "Decimal, e.g. 0.075 = 7.5%",
        onChange: (v) => {
          p.vatRate = v;
          markDirty();
        }
      })
    );
    grid.appendChild(
      numberField({
        label: "Service charge rate",
        value: p.serviceRate,
        step: 0.001,
        min: 0,
        max: 1,
        hint: "Decimal, e.g. 0.10 = 10%",
        onChange: (v) => {
          p.serviceRate = v;
          markDirty();
        }
      })
    );
    grid.appendChild(
      textField({
        label: "Date locale",
        value: p.dateLocale,
        hint: 'BCP 47 locale, e.g. "en-NG"',
        onChange: (v) => {
          p.dateLocale = v;
          markDirty();
        }
      })
    );
    grid.appendChild(
      numberField({
        label: "Default guests",
        value: p.defaultGuests,
        integer: true,
        min: 1,
        onChange: (v) => {
          p.defaultGuests = v;
          markDirty();
        }
      })
    );
    grid.appendChild(
      numberField({
        label: "Default nights",
        value: p.defaultNights,
        integer: true,
        min: 1,
        onChange: (v) => {
          p.defaultNights = v;
          markDirty();
        }
      })
    );

    container.appendChild(card);
  }
};
