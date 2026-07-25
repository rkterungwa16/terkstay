# terksay
A configurable way to manage your hotel websites, bookings, etc.

A config-driven hotel booking app. All styling and all hotel content lives in
`public/config.json` — nothing is hard-coded in the HTML/CSS/JS.

## Run it

```
node server.js
```

Then open http://localhost:3000. No `npm install` needed — the server uses
only Node's built-in `http` and `fs` modules.

## Project layout

```
server.js          Static file server + a small config API (zero dependencies)
public/
  index.html        Markup only — every piece of text/data is filled in by app.js
  styles.css        Structural CSS, entirely driven by CSS custom properties
  app.js            Fetches config.json, applies it, and runs the booking flow
  config.json       Every style token and every piece of hotel content
```

## Editing styles

Open `public/config.json`. Each UI component has its own `style` block, e.g.:

```json
"hotelCard": {
  "style": {
    "background": "var(--white)",
    "border": "#EAE2CC",
    "priceColor": "var(--indigo-deep)"
  }
}
```

Change a value, save the file, and reload the page in your browser (or POST/PUT
it through the API described below) — the change applies immediately with no
rebuild step. Global theme tokens (colors, fonts, radius, the Adire dot pattern)
live in the top-level `theme` block and cascade into every component via CSS
variables.

## Editing hotel information

The `hotels` array is the full inventory — one object per property:

```json
{
  "id": "lag-vi",
  "name": "Adire Victoria Island",
  "city": "Lagos",
  "area": "Victoria Island",
  "state": "Lagos",
  "stars": 5,
  "description": "...",
  "priceFactor": 1.30,
  "availability": { "Standard": 4, "Deluxe": 2, "Executive": 1, "Presidential": 0 }
}
```

- `priceFactor` multiplies each room type's `basePrice` (in `roomTypes`) to get
  that hotel's nightly rate — Lagos/Abuja run higher, Enugu/Kano lower.
- `availability` is rooms-left per room-type `id`. Omit a tier entirely if that
  hotel doesn't stock it (this is also enforced automatically by each room
  type's `minStars` — a 3-star hotel will never show a Presidential Suite even
  if you add it to `availability`).
- Add a new hotel by adding a new object to the array — branch filters, the
  header nav, and availability search all pick it up automatically.

`roomTypes`, `amenities`, and `policies` (VAT rate, service charge, currency)
are also just data — edit them the same way.

## Config API (basic CMS behavior)

The server also exposes:

- `GET /api/config` — returns the current `config.json`
- `PUT /api/config` — overwrites `config.json` with the JSON body you send

This is what `app.js` calls on page load, and it means an admin tool (or a
`curl`/Postman request) can update styles or hotel data without touching
files directly:

```
curl -X PUT http://localhost:3000/api/config \
  -H "Content-Type: application/json" \
  --data @public/config.json
```
