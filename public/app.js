(function(){

  const ICONS = {
    wifi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 8.5a16 16 0 0 1 20 0"/><path d="M5.5 12.5a11 11 0 0 1 13 0"/><path d="M9 16.5a6 6 0 0 1 6 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>',
    power: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></svg>',
    breakfast: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10h14v3a7 7 0 0 1-14 0v-3z"/><path d="M17 10h2a3 3 0 0 1 0 6h-2"/><path d="M6 2c0 1.5-1.5 1.5-1.5 3S6 6.5 6 8"/><path d="M10 2c0 1.5-1.5 1.5-1.5 3S10 6.5 10 8"/></svg>',
    pool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 17c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0"/><path d="M7 13V6a3 3 0 0 1 6 0"/><path d="M17 13v-3"/></svg>',
    gym: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16"/><path d="M4 8v8M20 8v8M8 10v4M16 10v4"/></svg>',
    shuttle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="16" height="9" rx="1.5"/><path d="M18 10h3l1 3v3h-4"/><circle cx="6.5" cy="18" r="1.5"/><circle cx="16.5" cy="18" r="1.5"/></svg>'
  };

  /* ---------------- Config-driven state ---------------- */
  let CONFIG, THEME, POLICIES, AMENITIES, ROOM_TYPES, HOTELS, C; // C = components

  // App/UI state
  let currentSearch = null;   // {branch, checkIn, checkOut, nights, guests}
  let currentHotel = null;    // hotel object currently being viewed (step 2)
  let selectedRoom = null;    // {hotel, roomType, nightly} chosen for booking

  /* ---------------- Helpers ---------------- */
  function naira(n){ return POLICIES.currencySymbol + Math.round(n).toLocaleString("en-NG"); }
  function fmtDate(d){ return new Date(d).toLocaleDateString(POLICIES.dateLocale,{day:"numeric",month:"short",year:"numeric"}); }
  function nightsBetween(a,b){ return Math.round((new Date(b) - new Date(a)) / 86400000); }
  function genRef(){ return "ADIRE-" + Math.random().toString(36).slice(2,7).toUpperCase(); }
  function starString(n){ return "★".repeat(n) + "☆".repeat(5-n); }
  function tpl(str, vars){
    return Object.keys(vars).reduce((s,k)=> s.replace(new RegExp("\\{"+k+"\\}","g"), vars[k]), str);
  }
  function plural(n){ return n === 1 ? "" : "s"; }

  /* ---------------- Load config from the Node server ---------------- */
  async function loadConfig(){
    const res = await fetch("/api/config", { cache: "no-store" });
    if(!res.ok) throw new Error("Could not load /api/config (status " + res.status + ")");
    return res.json();
  }

  /* ---------------- Apply theme + component styles as CSS variables ---------------- */
  function applyTheme(theme){
    const root = document.documentElement.style;
    const c = theme.colors;
    root.setProperty("--indigo-deep", c.indigoDeep);
    root.setProperty("--indigo-mid", c.indigoMid);
    root.setProperty("--indigo-pale", c.indigoPale);
    root.setProperty("--gold", c.gold);
    root.setProperty("--gold-light", c.goldLight);
    root.setProperty("--ivory", c.ivory);
    root.setProperty("--ivory-dim", c.ivoryDim);
    root.setProperty("--ink", c.ink);
    root.setProperty("--palm", c.palm);
    root.setProperty("--rust", c.rust);
    root.setProperty("--white", c.white);

    root.setProperty("--font-display", theme.typography.fontDisplay);
    root.setProperty("--font-body", theme.typography.fontBody);
    root.setProperty("--radius", theme.radius);

    root.setProperty("--pattern-dot", theme.pattern.dotColor);
    root.setProperty("--pattern-cell", theme.pattern.cellSize);
    root.setProperty("--strip-height", theme.pattern.stripHeight);

    const fontsLink = document.getElementById("googleFontsLink");
    if(theme.typography.googleFontsUrl) fontsLink.href = theme.typography.googleFontsUrl;
  }

  function setVars(prefix, style){
    if(!style) return;
    const root = document.documentElement.style;
    const map = {
      background:"bg", textColor:"text", accentColor:"accent", labelColor:"label",
      fieldBorder:"field-border", badgeBg:"badge-bg", starColor:"star", priceColor:"price",
      availableColor:"available", border:"border", tierBadgeText:"badge-text",
      leftNoteColor:"left", headerBg:"header-bg", headerText:"header-text",
      payOptionBorder:"pay-border", payOptionSelectedBg:"pay-selected-bg",
      stampBorder:"stamp-border", stampText:"stamp-text", eyebrowColor:"eyebrow", ledeColor:"lede",
      primaryBg:"primary-bg", primaryText:"primary-text", primaryHoverBg:"primary-hover",
      outlineBorder:"outline-border", outlineText:"outline-text", outlineHoverBg:"outline-hover"
    };
    Object.keys(style).forEach(key=>{
      const suffix = map[key];
      if(suffix) root.setProperty(`--${prefix}-${suffix}`, style[key]);
    });
  }

  function applyComponentStyles(components){
    setVars("header", components.header.style);
    setVars("hero", components.hero.style);
    setVars("search", components.searchPanel.style);
    setVars("hotelcard", components.hotelCard.style);
    setVars("roomcard", components.roomCard.style);
    setVars("modal", components.bookingModal.style);
    setVars("pay", components.bookingModal.style);
    setVars("stamp", components.confirmation.style);
    setVars("footer", components.footer.style);
    setVars("btn", components.buttons.style);
  }

  /* ---------------- Apply static text content from config ---------------- */
  function applyContent(components){
    // Header
    const logoEl = document.getElementById("logoText");
    logoEl.innerHTML = `${components.header.content.logoText} <small>${components.header.content.logoSubtitle}</small>`;

    // Hero
    document.getElementById("heroEyebrow").textContent = components.hero.content.eyebrow;
    document.getElementById("heroHeading").textContent = components.hero.content.heading;
    document.getElementById("heroLede").textContent = components.hero.content.lede;
    document.getElementById("searchButton").textContent = components.hero.content.searchButtonLabel;

    // Search panel labels
    const sp = components.searchPanel.content;
    document.getElementById("labelBranch").textContent = sp.labels.branch;
    document.getElementById("labelCheckIn").textContent = sp.labels.checkIn;
    document.getElementById("labelCheckOut").textContent = sp.labels.checkOut;
    document.getElementById("labelGuests").textContent = sp.labels.guests;
    document.getElementById("resultsEmpty").textContent = sp.emptyStateText;

    // Booking modal labels
    const bm = components.bookingModal.content;
    document.getElementById("labelGuestName").textContent = bm.fields.name;
    document.getElementById("guestName").placeholder = bm.fields.namePlaceholder;
    document.getElementById("labelGuestEmail").textContent = bm.fields.email;
    document.getElementById("guestEmail").placeholder = bm.fields.emailPlaceholder;
    document.getElementById("labelGuestPhone").textContent = bm.fields.phone;
    document.getElementById("guestPhone").placeholder = bm.fields.phonePlaceholder;
    document.getElementById("labelGuestRequests").textContent = bm.fields.requests;
    document.getElementById("guestRequests").placeholder = bm.fields.requestsPlaceholder;
    document.getElementById("formError").textContent = bm.errorText;
    document.getElementById("labelPayment").textContent = bm.paymentLabel;
    document.getElementById("cancelBooking").textContent = bm.cancelLabel;
    document.getElementById("confirmBookingBtn").textContent = bm.confirmLabel;

    const payOptions = document.getElementById("payOptions");
    payOptions.innerHTML = "";
    bm.paymentMethods.forEach((method, i)=>{
      const label = document.createElement("label");
      label.className = "pay-option" + (i === 0 ? " selected" : "");
      label.innerHTML = `<input type="radio" name="payMethod" value="${method}" ${i===0?"checked":""}> ${method}`;
      payOptions.appendChild(label);
    });

    // Confirmation
    const cf = components.confirmation.content;
    document.getElementById("stampWord").textContent = cf.stampWord;
    document.getElementById("stampBadge").textContent = cf.badgeText;
    document.getElementById("confirmNote").textContent = cf.note;
    document.getElementById("newBookingBtn").textContent = cf.newBookingLabel;

    // Footer
    const ft = components.footer.content;
    document.getElementById("footerChainName").textContent = ft.chainName;
    document.getElementById("footerContact").textContent = `Reservations: ${ft.phone} · ${ft.email}`;

    // Back link
    document.getElementById("backToHotels").textContent = components.hotelCard.content.backToHotelsLabel;
  }

  /* ---------------- Data helpers ---------------- */

  // Room types actually stocked by a given hotel, with computed nightly price + rooms left
  function getHotelRooms(hotel){
    return ROOM_TYPES
      .filter(rt => hotel.stars >= rt.minStars)
      .map(rt => {
        const left = (hotel.availability && hotel.availability[rt.id] !== undefined) ? hotel.availability[rt.id] : 0;
        const nightly = Math.round(rt.basePrice * hotel.priceFactor / 500) * 500;
        return Object.assign({}, rt, { nightly, left });
      });
  }

  function hotelAvailability(hotel, guests){
    const rooms = getHotelRooms(hotel).filter(r => r.capacity >= guests && r.left > 0);
    const totalLeft = rooms.reduce((sum,r)=>sum+r.left, 0);
    const cheapest = rooms.length ? Math.min(...rooms.map(r=>r.nightly)) : null;
    return { fits: rooms.length > 0, totalLeft, cheapest };
  }

  function amenityPillsHtml(keys){
    return keys.map(key=>{
      const a = AMENITIES[key];
      if(!a) return "";
      return `<span class="amenity-pill">${ICONS[a.icon] || ""}${a.label}</span>`;
    }).join("");
  }

  /* ---------------- Populate branch select + nav from hotel data ---------------- */
  function initBranches(){
    const branchSelect = document.getElementById("branchSelect");
    const branchNav = document.getElementById("branchNav");
    const cities = [...new Set(HOTELS.map(h=>h.city))];

    const allOpt = document.createElement("option");
    allOpt.value = "";
    allOpt.textContent = C.searchPanel.content.allBranchesLabel;
    branchSelect.appendChild(allOpt);

    branchNav.innerHTML = "";
    cities.forEach(city=>{
      const opt = document.createElement("option");
      opt.value = city; opt.textContent = city;
      branchSelect.appendChild(opt);

      if(C.header.content.showBranchNav){
        const span = document.createElement("span");
        span.textContent = city;
        branchNav.appendChild(span);
      }
    });
  }

  function initDefaultDates(){
    const today = new Date();
    const checkInDefault = new Date(today.getTime() + 86400000);
    const checkOutDefault = new Date(today.getTime() + (1 + POLICIES.defaultNights) * 86400000);
    const checkInEl = document.getElementById("checkIn");
    const checkOutEl = document.getElementById("checkOut");
    checkInEl.value = checkInDefault.toISOString().slice(0,10);
    checkOutEl.value = checkOutDefault.toISOString().slice(0,10);
    checkInEl.min = today.toISOString().slice(0,10);
    document.getElementById("guestsInput").value = POLICIES.defaultGuests;
  }

  /* ---------------- Search + rendering ---------------- */
  function runSearch(showAlertOnBadDates){
    const branchSelect = document.getElementById("branchSelect");
    const checkIn = document.getElementById("checkIn").value;
    const checkOut = document.getElementById("checkOut").value;
    const guests = parseInt(document.getElementById("guestsInput").value,10) || 1;

    const nights = nightsBetween(checkIn, checkOut);
    if(nights <= 0){
      if(showAlertOnBadDates) alert("Check-out date must be after check-in date.");
      return;
    }

    const branch = branchSelect.value;
    currentSearch = {branch, checkIn, checkOut, nights, guests};

    if(currentHotel && hotelAvailability(currentHotel, guests).fits && (!branch || currentHotel.city === branch)){
      renderRoomList();
    } else {
      currentHotel = null;
      renderHotelList();
    }
  }

  function renderHotelList(){
    const hotelGrid = document.getElementById("hotelGrid");
    const roomGrid = document.getElementById("roomGrid");
    const resultsEmpty = document.getElementById("resultsEmpty");
    const backToHotels = document.getElementById("backToHotels");
    const content = C.hotelCard.content;
    const spContent = C.searchPanel.content;

    backToHotels.style.display = "none";
    roomGrid.style.display = "none";
    hotelGrid.style.display = "grid";
    hotelGrid.innerHTML = "";

    const matches = HOTELS.filter(h => !currentSearch.branch || h.city === currentSearch.branch);

    document.getElementById("resultsTitle").textContent = currentSearch.branch
      ? tpl(spContent.searchingTitleBranch, {branch: currentSearch.branch})
      : spContent.searchingTitleAll;
    document.getElementById("resultsMeta").textContent =
      `${fmtDate(currentSearch.checkIn)} → ${fmtDate(currentSearch.checkOut)} · ${currentSearch.nights} night${plural(currentSearch.nights)} · ${currentSearch.guests} guest${plural(currentSearch.guests)}`;

    if(matches.length === 0){
      hotelGrid.style.display = "none";
      resultsEmpty.style.display = "block";
      resultsEmpty.textContent = "No hotels found for that branch.";
      return;
    }
    resultsEmpty.style.display = "none";

    matches.forEach(hotel=>{
      const av = hotelAvailability(hotel, currentSearch.guests);
      const card = document.createElement("div");
      card.className = "hotel-card" + (av.fits ? "" : " no-match");
      card.innerHTML = `
        <div class="hotel-visual">
          <span class="city-tag">${hotel.city}</span>
          <span class="stars">${starString(hotel.stars)}</span>
        </div>
        <div class="hotel-body">
          <h3>${hotel.name}</h3>
          <div class="area-line">${hotel.area}, ${hotel.state} State</div>
          <div class="hotel-desc">${hotel.description}</div>
          <div class="avail-note">${av.fits ? tpl(content.availableLabel, {count: av.totalLeft, s: plural(av.totalLeft)}) : content.noFitLabel}</div>
          <div class="hotel-footer">
            <div class="price">${av.cheapest ? naira(av.cheapest) : "—"}<span>${content.fromLabel}</span></div>
            <button class="btn btn-gold btn-sm" ${av.fits ? "" : "disabled"}>${av.fits ? content.viewRoomsLabel : content.unavailableLabel}</button>
          </div>
        </div>
      `;
      if(av.fits){
        card.querySelector("button").addEventListener("click", ()=>{
          currentHotel = hotel;
          renderRoomList();
          const mainEl = document.querySelector("main");
          if(mainEl) window.scrollTo({top: mainEl.offsetTop - 20, behavior:"smooth"});
        });
      }
      hotelGrid.appendChild(card);
    });
  }

  function renderRoomList(){
    const hotelGrid = document.getElementById("hotelGrid");
    const roomGrid = document.getElementById("roomGrid");
    const resultsEmpty = document.getElementById("resultsEmpty");
    const backToHotels = document.getElementById("backToHotels");
    const content = C.roomCard.content;

    hotelGrid.style.display = "none";
    resultsEmpty.style.display = "none";
    roomGrid.style.display = "grid";
    roomGrid.innerHTML = "";
    backToHotels.style.display = "inline-flex";

    const hotel = currentHotel;
    document.getElementById("resultsTitle").textContent = `${hotel.name} — ${hotel.area}`;
    document.getElementById("resultsMeta").textContent =
      `${fmtDate(currentSearch.checkIn)} → ${fmtDate(currentSearch.checkOut)} · ${currentSearch.nights} night${plural(currentSearch.nights)} · ${currentSearch.guests} guest${plural(currentSearch.guests)}`;

    const rooms = getHotelRooms(hotel);

    rooms.forEach(r=>{
      const fitsGuests = r.capacity >= currentSearch.guests;
      const soldOut = r.left <= 0;
      const card = document.createElement("div");
      card.className = "room-card" + (soldOut || !fitsGuests ? " sold-out" : "");
      card.innerHTML = `
        <div class="room-visual" style="background:${r.color};"><span class="tier-tag">${r.tag}</span></div>
        <div class="room-body">
          <h3>${r.tag}</h3>
          <div class="amenity-list">${amenityPillsHtml(r.amenities)}</div>
          <div class="capacity-note">${tpl(content.sleepsLabel, {n:r.capacity, s:plural(r.capacity)})}${fitsGuests ? "" : content.notEnoughLabel}</div>
          ${!soldOut && fitsGuests ? `<div class="left-note">${tpl(content.leftLabel, {n:r.left, s:plural(r.left)})}</div>` : ""}
          <div class="room-footer">
            <div class="price room-price">${naira(r.nightly)}<span>per night</span></div>
            <button class="btn btn-gold" ${soldOut || !fitsGuests ? "disabled" : ""}>${soldOut ? content.soldOutLabel : content.bookLabel}</button>
          </div>
        </div>
      `;
      if(!soldOut && fitsGuests){
        card.querySelector("button").addEventListener("click", ()=> openBooking(hotel, r));
      }
      roomGrid.appendChild(card);
    });
  }

  /* ---------------- Booking modal ---------------- */
  function pricingBreakdown(){
    const sub = selectedRoom.nightly * currentSearch.nights;
    const vat = sub * POLICIES.vatRate;
    const service = sub * POLICIES.serviceRate;
    return { sub, vat, service, total: sub + vat + service };
  }

  function updateSummary(){
    const {hotel, roomType} = selectedRoom;
    const p = pricingBreakdown();
    document.getElementById("bookingSummary").innerHTML = `
      <div class="summary-row"><span>${roomType.tag} — ${hotel.name}</span><span>${currentSearch.nights} night${plural(currentSearch.nights)}</span></div>
      <div class="summary-row"><span>${fmtDate(currentSearch.checkIn)} → ${fmtDate(currentSearch.checkOut)}</span><span>${currentSearch.guests} guest${plural(currentSearch.guests)}</span></div>
      <div class="summary-row"><span>Room subtotal</span><span>${naira(p.sub)}</span></div>
      <div class="summary-row"><span>VAT (${(POLICIES.vatRate*100).toFixed(1)}%)</span><span>${naira(p.vat)}</span></div>
      <div class="summary-row"><span>Service charge (${(POLICIES.serviceRate*100).toFixed(0)}%)</span><span>${naira(p.service)}</span></div>
      <div class="summary-row total"><span>Total due</span><span>${naira(p.total)}</span></div>
    `;
  }

  function openBooking(hotel, roomType){
    selectedRoom = {hotel, roomType, nightly: roomType.nightly};
    const bookingForm = document.getElementById("bookingForm");
    document.getElementById("bookingModalTitle").textContent = C.bookingModal.content.title;
    bookingForm.style.display = "block";
    document.getElementById("confirmView").style.display = "none";
    bookingForm.reset();
    document.getElementById("formError").style.display = "none";
    // re-select first payment method visually
    document.querySelectorAll(".pay-option").forEach((el,i)=>el.classList.toggle("selected", i===0));
    updateSummary();
    document.getElementById("bookingOverlay").classList.add("open");
  }

  function bindModalEvents(){
    const overlay = document.getElementById("bookingOverlay");
    document.getElementById("closeBooking").addEventListener("click", ()=> overlay.classList.remove("open"));
    document.getElementById("cancelBooking").addEventListener("click", ()=> overlay.classList.remove("open"));
    overlay.addEventListener("click", (e)=>{ if(e.target === overlay) overlay.classList.remove("open"); });

    document.getElementById("payOptions").addEventListener("change", (e)=>{
      document.querySelectorAll(".pay-option").forEach(el=>el.classList.remove("selected"));
      e.target.closest(".pay-option").classList.add("selected");
    });

    document.getElementById("bookingForm").addEventListener("submit", function(e){
      e.preventDefault();
      const name = document.getElementById("guestName").value.trim();
      const email = document.getElementById("guestEmail").value.trim();
      const phone = document.getElementById("guestPhone").value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const phoneOk = /^[+0-9][0-9 ]{6,}$/.test(phone);

      if(!name || !emailOk || !phoneOk){
        document.getElementById("formError").style.display = "block";
        return;
      }
      document.getElementById("formError").style.display = "none";

      const payMethod = document.querySelector('input[name="payMethod"]:checked').value;
      const ref = genRef();
      const p = pricingBreakdown();
      const {hotel, roomType} = selectedRoom;

      document.getElementById("confirmRef").textContent = ref;
      document.getElementById("confirmSummary").innerHTML = `
        <div class="summary-row"><span>Guest</span><span>${name}</span></div>
        <div class="summary-row"><span>${roomType.tag}</span><span>${hotel.name}, ${hotel.city}</span></div>
        <div class="summary-row"><span>${fmtDate(currentSearch.checkIn)} → ${fmtDate(currentSearch.checkOut)}</span><span>${currentSearch.nights} night${plural(currentSearch.nights)}</span></div>
        <div class="summary-row"><span>Payment method</span><span>${payMethod}</span></div>
        <div class="summary-row total"><span>Total paid</span><span>${naira(p.total)}</span></div>
      `;

      document.getElementById("bookingForm").style.display = "none";
      document.getElementById("confirmView").style.display = "block";
      document.getElementById("bookingModalTitle").textContent = C.bookingModal.content.confirmedTitle;
    });

    document.getElementById("newBookingBtn").addEventListener("click", ()=>{
      overlay.classList.remove("open");
    });
  }

  function bindSearchEvents(){
    const branchSelect = document.getElementById("branchSelect");
    const guestsEl = document.getElementById("guestsInput");
    const checkInEl = document.getElementById("checkIn");
    const checkOutEl = document.getElementById("checkOut");

    document.getElementById("searchForm").addEventListener("submit", function(e){
      e.preventDefault();
      runSearch(true);
    });

    // Filters apply live, without needing to press the Search button again
    branchSelect.addEventListener("change", ()=> runSearch(false));
    guestsEl.addEventListener("change", ()=> runSearch(false));
    checkInEl.addEventListener("change", ()=> runSearch(false));
    checkOutEl.addEventListener("change", ()=> runSearch(false));

    document.getElementById("backToHotels").addEventListener("click", ()=>{
      currentHotel = null;
      renderHotelList();
    });
  }

  /* ---------------- Boot ---------------- */
  async function main(){
    try{
      CONFIG = await loadConfig();
    } catch(err){
      document.body.innerHTML = `<div style="padding:60px;font-family:sans-serif;max-width:640px;margin:0 auto;">
        <h2>Could not load configuration</h2>
        <p>${err.message}</p>
        <p>Make sure the Node server is running: <code>node server.js</code>, then open <code>http://localhost:3000</code>.</p>
      </div>`;
      return;
    }

    THEME = CONFIG.theme;
    POLICIES = CONFIG.policies;
    AMENITIES = CONFIG.amenities;
    ROOM_TYPES = CONFIG.roomTypes;
    HOTELS = CONFIG.hotels;
    C = CONFIG.components;

    applyTheme(THEME);
    applyComponentStyles(C);
    applyContent(C);
    initBranches();
    initDefaultDates();
    bindSearchEvents();
    bindModalEvents();

    runSearch(false);
  }

  main();

})();
