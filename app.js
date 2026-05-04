const TOTAL_COUNTRIES = 195;
const STORAGE_KEY = "nisso_state_v8";
const CLOUD_KEY = "nisso_supabase_config";

const COUNTRIES = [
  ["AF","Afghanistan","🇦🇫","Asia"],["AL","Albania","🇦🇱","Europe"],["DZ","Algeria","🇩🇿","Africa"],["AD","Andorra","🇦🇩","Europe"],["AO","Angola","🇦🇴","Africa"],["AR","Argentina","🇦🇷","Americas"],["AM","Armenia","🇦🇲","Asia"],["AU","Australia","🇦🇺","Oceania"],["AT","Austria","🇦🇹","Europe"],["AZ","Azerbaijan","🇦🇿","Asia"],["BS","Bahamas","🇧🇸","Americas"],["BH","Bahrain","🇧🇭","Middle East"],["BD","Bangladesh","🇧🇩","Asia"],["BE","Belgium","🇧🇪","Europe"],["BZ","Belize","🇧🇿","Americas"],["BO","Bolivia","🇧🇴","Americas"],["BA","Bosnia & Herzegovina","🇧🇦","Europe"],["BR","Brazil","🇧🇷","Americas"],["BG","Bulgaria","🇧🇬","Europe"],["CA","Canada","🇨🇦","Americas"],["CL","Chile","🇨🇱","Americas"],["CN","China","🇨🇳","Asia"],["CO","Colombia","🇨🇴","Americas"],["CR","Costa Rica","🇨🇷","Americas"],["HR","Croatia","🇭🇷","Europe"],["CY","Cyprus","🇨🇾","Europe"],["CZ","Czechia","🇨🇿","Europe"],["DK","Denmark","🇩🇰","Europe"],["DO","Dominican Republic","🇩🇴","Americas"],["EC","Ecuador","🇪🇨","Americas"],["EG","Egypt","🇪🇬","Middle East"],["EE","Estonia","🇪🇪","Europe"],["FI","Finland","🇫🇮","Europe"],["FR","France","🇫🇷","Europe"],["GE","Georgia","🇬🇪","Asia"],["DE","Germany","🇩🇪","Europe"],["GR","Greece","🇬🇷","Europe"],["GT","Guatemala","🇬🇹","Americas"],["HU","Hungary","🇭🇺","Europe"],["IS","Iceland","🇮🇸","Europe"],["IN","India","🇮🇳","Asia"],["ID","Indonesia","🇮🇩","Asia"],["IE","Ireland","🇮🇪","Europe"],["IL","Israel","🇮🇱","Middle East"],["IT","Italy","🇮🇹","Europe"],["JP","Japan","🇯🇵","Asia"],["JO","Jordan","🇯🇴","Middle East"],["KE","Kenya","🇰🇪","Africa"],["KR","South Korea","🇰🇷","Asia"],["LV","Latvia","🇱🇻","Europe"],["LT","Lithuania","🇱🇹","Europe"],["LU","Luxembourg","🇱🇺","Europe"],["MY","Malaysia","🇲🇾","Asia"],["MV","Maldives","🇲🇻","Asia"],["MT","Malta","🇲🇹","Europe"],["MX","Mexico","🇲🇽","Americas"],["MA","Morocco","🇲🇦","Africa"],["NL","Netherlands","🇳🇱","Europe"],["NZ","New Zealand","🇳🇿","Oceania"],["NO","Norway","🇳🇴","Europe"],["PE","Peru","🇵🇪","Americas"],["PH","Philippines","🇵🇭","Asia"],["PL","Poland","🇵🇱","Europe"],["PT","Portugal","🇵🇹","Europe"],["QA","Qatar","🇶🇦","Middle East"],["RO","Romania","🇷🇴","Europe"],["RU","Russia","🇷🇺","Europe"],["SA","Saudi Arabia","🇸🇦","Middle East"],["SG","Singapore","🇸🇬","Asia"],["SK","Slovakia","🇸🇰","Europe"],["SI","Slovenia","🇸🇮","Europe"],["ZA","South Africa","🇿🇦","Africa"],["ES","Spain","🇪🇸","Europe"],["SE","Sweden","🇸🇪","Europe"],["CH","Switzerland","🇨🇭","Europe"],["TH","Thailand","🇹🇭","Asia"],["TR","Turkey","🇹🇷","Europe"],["AE","United Arab Emirates","🇦🇪","Middle East"],["GB","United Kingdom","🇬🇧","Europe"],["US","United States","🇺🇸","Americas"],["UY","Uruguay","🇺🇾","Americas"],["VN","Vietnam","🇻🇳","Asia"]
].map(([code, name, flag, region]) => ({ code, name, flag, region })).sort((a, b) => a.name.localeCompare(b.name));

const NUMERIC_TO_ISO = {4:"AF",8:"AL",12:"DZ",24:"AO",32:"AR",36:"AU",40:"AT",48:"BH",50:"BD",56:"BE",68:"BO",70:"BA",76:"BR",84:"BZ",100:"BG",124:"CA",152:"CL",156:"CN",170:"CO",188:"CR",191:"HR",196:"CY",203:"CZ",208:"DK",214:"DO",218:"EC",233:"EE",246:"FI",250:"FR",268:"GE",276:"DE",300:"GR",320:"GT",348:"HU",352:"IS",356:"IN",360:"ID",372:"IE",376:"IL",380:"IT",392:"JP",400:"JO",404:"KE",410:"KR",428:"LV",440:"LT",442:"LU",458:"MY",462:"MV",470:"MT",484:"MX",504:"MA",528:"NL",554:"NZ",578:"NO",604:"PE",608:"PH",616:"PL",620:"PT",634:"QA",642:"RO",643:"RU",682:"SA",702:"SG",703:"SK",705:"SI",710:"ZA",724:"ES",752:"SE",756:"CH",764:"TH",792:"TR",784:"AE",826:"GB",840:"US",858:"UY",704:"VN"};
const REGIONS = ["All", "Europe", "Americas", "Asia", "Africa", "Middle East", "Oceania"];
const TRANSPORT = { plane: "✈", train: "🚆", car: "🚗", ship: "🚢" };

let state = {
  trips: [],
  wishlist: [],
  purposes: ["Leisure", "Work", "Studies"],
  theme: "dark",
  profile: { name: "Traveler", handle: "@houseofnisso" },
  updatedAt: null
};

let selectedCountry = null;
let stops = [];
let mapMode = "visited";
let regionFilter = "All";
let yearFilter = "All";
let mapGroup = null;
let mapPath = null;
let mapReady = false;
let saveTimer = null;
let dirtyForm = false;

const $ = (id) => document.getElementById(id);

class LocalStore {
  async load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }
  async save(nextState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    return nextState;
  }
}

class SupabaseStore {
  constructor(config) {
    this.config = config;
    this.client = window.supabase?.createClient(config.url, config.anonKey);
  }
  ready() {
    return Boolean(this.client);
  }
  async load() {
    const { data, error } = await this.client.from("travel_profiles").select("data").eq("profile_key", "default").maybeSingle();
    if (error) throw error;
    return data?.data || null;
  }
  async save(nextState) {
    const payload = { profile_key: "default", data: nextState, updated_at: new Date().toISOString() };
    const { error } = await this.client.from("travel_profiles").upsert(payload, { onConflict: "profile_key" });
    if (error) throw error;
    return nextState;
  }
}

function getCloudConfig() {
  try { return JSON.parse(localStorage.getItem(CLOUD_KEY) || "null"); } catch { return null; }
}

function getStore() {
  const config = getCloudConfig();
  return config?.url && config?.anonKey && window.supabase ? new SupabaseStore(config) : new LocalStore();
}

function normalizeImported(data) {
  return {
    ...state,
    ...data,
    profile: data.profile || { name: data.name || "Traveler", handle: data.handle || "@houseofnisso" },
    purposes: data.purposes || data.purp || ["Leisure", "Work", "Studies"],
    wishlist: data.wishlist || data.wish || [],
    trips: data.trips || []
  };
}

async function loadState() {
  try {
    const local = await new LocalStore().load();
    if (local) state = normalizeImported(local);
    const cloud = getStore();
    if (cloud instanceof SupabaseStore && cloud.ready()) {
      const remote = await cloud.load();
      if (remote) state = normalizeImported(remote);
      $("syncStatus").textContent = "Supabase connected. Cloud data loaded.";
    }
  } catch (error) {
    $("syncStatus").textContent = `Cloud unavailable: ${error.message}`;
  }
}

function queueSave() {
  state.updatedAt = new Date().toISOString();
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(async () => {
    await new LocalStore().save(state);
    const store = getStore();
    if (store instanceof SupabaseStore && store.ready()) {
      try {
        await store.save(state);
        $("syncStatus").textContent = `Synced ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      } catch (error) {
        $("syncStatus").textContent = `Sync failed: ${error.message}`;
      }
    }
  }, 180);
  render();
}

function toast(message, isError = false) {
  const node = $("toast");
  node.textContent = message;
  node.className = `toast show${isError ? " error" : ""}`;
  window.setTimeout(() => node.className = "toast", 2300);
  if ("vibrate" in navigator) navigator.vibrate(isError ? [18, 30, 18] : 12);
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $("themeBtn").textContent = theme === "dark" ? "☀" : "☾";
  $("theme-meta").setAttribute("content", theme === "dark" ? "#0c0c0c" : "#f5f2ee");
  if (mapReady) colorMap();
}

function visitedTrips() {
  return state.trips.filter((trip) => trip.status !== "planned" && trip.status !== "cancelled");
}

function countryByCode(code) {
  return COUNTRIES.find((country) => country.code === code);
}

function visitedSet() {
  return new Set(visitedTrips().map((trip) => trip.country?.code).filter(Boolean));
}

function plannedSet() {
  return new Set(state.trips.filter((trip) => trip.status === "planned").map((trip) => trip.country?.code).filter(Boolean));
}

function tripDays(trip) {
  return (trip.stops || []).reduce((sum, stop) => {
    if (!stop.arrival || !stop.departure) return sum;
    const days = Math.ceil((new Date(stop.departure) - new Date(stop.arrival)) / 86400000);
    return sum + Math.max(days, 0);
  }, 0);
}

function getStats() {
  const visited = visitedSet();
  const trips = visitedTrips();
  const days = trips.reduce((sum, trip) => sum + tripDays(trip), 0);
  const cities = new Set(trips.flatMap((trip) => trip.stops || []).map((stop) => stop.city).filter(Boolean));
  const hotels = new Set(trips.flatMap((trip) => trip.stops || []).flatMap((stop) => stop.hotels || []).filter(Boolean));
  const airports = new Set(trips.flatMap((trip) => trip.stops || []).flatMap((stop) => stop.airports || []).filter(Boolean));
  const years = new Set(trips.map((trip) => trip.stops?.[0]?.arrival?.slice(0, 4)).filter(Boolean));
  const byCountry = new Map();
  trips.forEach((trip) => byCountry.set(trip.country.code, (byCountry.get(trip.country.code) || 0) + tripDays(trip)));
  const top = [...byCountry.entries()].sort((a, b) => b[1] - a[1])[0];
  return { visited, trips, days, cities, hotels, airports, years, top };
}

function renderDashboard() {
  const stats = getStats();
  $("statPct").textContent = `${((stats.visited.size / TOTAL_COUNTRIES) * 100).toFixed(1)}%`;
  $("statCountries").textContent = stats.visited.size;
  $("statTrips").textContent = stats.trips.length;
  $("statDays").textContent = stats.days;
  const topCountry = stats.top ? `${countryByCode(stats.top[0])?.name || stats.top[0]} (${stats.top[1]} days)` : "Not enough data";
  $("insights").innerHTML = [
    ["Cities Visited", stats.cities.size],
    ["Hotels Stayed", stats.hotels.size],
    ["Airports Transit", stats.airports.size],
    ["Travel Years", stats.years.size],
    ["Top Country", topCountry]
  ].map(([label, value]) => `<div class="insight"><span>${label}</span><strong>${value}</strong></div>`).join("");
}

function renderRegionTabs() {
  $("regionTabs").innerHTML = REGIONS.map((region) => `<button class="${region === regionFilter ? "active" : ""}" data-region="${region}">${region}</button>`).join("");
}

function countryStatus(country) {
  if (visitedSet().has(country.code)) return "visited";
  if (plannedSet().has(country.code)) return "planned";
  if (state.wishlist.includes(country.code)) return "wishlist";
  return "";
}

function renderCountries() {
  const query = $("countrySearch").value.trim().toLowerCase();
  let countries = COUNTRIES;
  if (regionFilter !== "All") countries = countries.filter((country) => country.region === regionFilter);
  if (query) {
    countries = countries.filter((country) => {
      const status = countryStatus(country);
      return `${country.name} ${country.region} ${status}`.toLowerCase().includes(query);
    });
  }
  $("countryList").innerHTML = countries.map((country) => {
    const status = countryStatus(country);
    return `<button class="country-row" data-country="${country.code}">
      <span class="country-main"><span class="flag">${country.flag}</span><span><span class="country-name">${country.name}</span><span class="country-region">${country.region}</span></span></span>
      ${status ? `<span class="badge ${status}">${status}</span>` : ""}
    </button>`;
  }).join("");
}

function getYears() {
  const years = new Set(state.trips.map((trip) => trip.stops?.[0]?.arrival?.slice(0, 4)).filter(Boolean));
  return ["All", ...[...years].sort((a, b) => b.localeCompare(a))];
}

function renderYears() {
  $("yearTabs").innerHTML = getYears().map((year) => `<button class="${year === yearFilter ? "active" : ""}" data-year="${year}">${year}</button>`).join("");
}

function renderTimeline() {
  let trips = [...state.trips].sort((a, b) => new Date(b.stops?.[0]?.arrival || 0) - new Date(a.stops?.[0]?.arrival || 0));
  if (yearFilter !== "All") trips = trips.filter((trip) => trip.stops?.[0]?.arrival?.startsWith(yearFilter));
  if (!trips.length) {
    $("timeline").innerHTML = `<p class="muted" style="padding:32px 0;text-align:center">No trips here yet. Tap + to start.</p>`;
    return;
  }
  $("timeline").innerHTML = trips.map((trip) => {
    const days = tripDays(trip);
    const stopsHtml = (trip.stops || []).map((stop) => `<div>${stop.city || "Unknown city"}${stop.region ? `, ${stop.region}` : ""} · ${stop.arrival || "?"} to ${stop.departure || "?"}</div>`).join("");
    const tags = (trip.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("");
    const badge = trip.status === "planned" ? `<span class="badge planned">planned</span>` : "";
    return `<button class="trip-card" data-trip="${trip.id}">
      ${trip.photoUrl ? `<img src="${trip.photoUrl}" alt="">` : ""}
      <span class="trip-top"><span><h3>${trip.country?.flag || "🌍"} ${trip.country?.name || "Unknown"}</h3><p class="trip-meta">${days} day${days === 1 ? "" : "s"} · ${trip.purpose || ""}</p></span>${badge}<span>${TRANSPORT[trip.transport] || "✈"}</span></span>
      <span class="stop-list">${stopsHtml}</span>
      ${tags ? `<span class="tag-row">${tags}</span>` : ""}
    </button>`;
  }).join("");
}

function renderProfile() {
  $("profileName").textContent = state.profile.name || "Traveler";
  $("profileHandle").textContent = state.profile.handle || "@houseofnisso";
  $("purposeInput").innerHTML = state.purposes.map((purpose) => `<option value="${purpose}">${purpose}</option>`).join("");
  $("purposeList").innerHTML = state.purposes.map((purpose) => `<span class="chip">${purpose}<button data-purpose="${purpose}" aria-label="Remove ${purpose}">x</button></span>`).join("");
  const config = getCloudConfig() || {};
  $("supabaseUrl").value = config.url || "";
  $("supabaseAnon").value = config.anonKey || "";
}

function render() {
  applyTheme(state.theme);
  renderDashboard();
  renderRegionTabs();
  renderCountries();
  renderYears();
  renderTimeline();
  renderProfile();
  colorMap();
}

function mapColors() {
  return {
    visited: "#b8e060",
    wishlist: "#f0b84a",
    planned: "#7fb7ff",
    land: getComputedStyle(document.documentElement).getPropertyValue("--map-land").trim(),
    stroke: getComputedStyle(document.documentElement).getPropertyValue("--map-stroke").trim()
  };
}

function initMap() {
  fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
    .then((response) => response.json())
    .then((world) => {
      const geo = topojson.feature(world, world.objects.countries);
      geo.features.forEach((feature) => feature.properties.iso = NUMERIC_TO_ISO[Number(feature.id)]);
      mapPath = d3.geoPath().projection(d3.geoNaturalEarth1().scale(148).translate([450, 228]));
      const svg = d3.select("#mapSvg");
      mapGroup = svg.append("g");
      const zoom = d3.zoom().scaleExtent([1, 8]).translateExtent([[0, 0], [900, 440]]).on("zoom", (event) => mapGroup.attr("transform", event.transform));
      svg.call(zoom);
      mapGroup.selectAll("path").data(geo.features).enter().append("path")
        .attr("d", mapPath)
        .attr("stroke-width", .4)
        .on("click", (_, feature) => {
          const country = countryByCode(feature.properties.iso);
          if (country) openCountry(country);
        });
      mapReady = true;
      $("mapLoader").classList.add("gone");
      colorMap();
    })
    .catch(() => $("mapLoader").querySelector(".loader-copy").textContent = "Map unavailable offline");
}

function colorMap() {
  if (!mapGroup) return;
  const colors = mapColors();
  const visited = visitedSet();
  const planned = plannedSet();
  const wishlist = new Set(state.wishlist);
  mapGroup.selectAll("path")
    .attr("stroke", colors.stroke)
    .transition().duration(250)
    .attr("fill", (feature) => {
      const iso = feature.properties.iso;
      if (mapMode === "visited" && visited.has(iso)) return colors.visited;
      if (mapMode === "visited" && planned.has(iso)) return colors.planned;
      if (mapMode === "wishlist" && wishlist.has(iso)) return colors.wishlist;
      return colors.land;
    });
}

function openTrip(tripId = null, country = null) {
  dirtyForm = false;
  const trip = state.trips.find((item) => item.id === tripId);
  $("tripTitle").textContent = trip ? "Edit Trip" : "Log Trip";
  $("tripId").value = trip?.id || "";
  selectedCountry = trip?.country || country || null;
  $("countryInput").value = selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : "";
  $("purposeInput").value = trip?.purpose || state.purposes[0] || "Leisure";
  $("statusInput").value = trip?.status || "visited";
  setTransport(trip?.transport || "plane");
  $("tagsInput").value = (trip?.tags || []).join(", ");
  $("photoInput").value = trip?.photoUrl || "";
  $("notesInput").value = trip?.notes || "";
  stops = trip?.stops ? JSON.parse(JSON.stringify(trip.stops)) : [{ id: crypto.randomUUID(), city: "", region: "", arrival: today(), departure: today(), hotels: [], airports: [] }];
  $("deleteTripBtn").classList.toggle("hidden", !trip);
  renderStops();
  openOverlay("tripOverlay");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function setTransport(value) {
  document.querySelectorAll("#transportInput button").forEach((button) => button.classList.toggle("active", button.dataset.value === value));
}

function flushStops() {
  stops = stops.map((stop) => ({
    ...stop,
    city: $(`city-${stop.id}`)?.value.trim() || "",
    region: $(`region-${stop.id}`)?.value.trim() || "",
    arrival: $(`arrival-${stop.id}`)?.value || "",
    departure: $(`departure-${stop.id}`)?.value || "",
    hotels: ($(`hotels-${stop.id}`)?.value || "").split(",").map((item) => item.trim()).filter(Boolean),
    airports: ($(`airports-${stop.id}`)?.value || "").split(",").map((item) => item.trim().toUpperCase()).filter(Boolean)
  }));
}

function renderStops() {
  $("stops").innerHTML = stops.map((stop, index) => `<section class="stop">
    <div class="stop-head"><span>Stop ${index + 1}</span>${stops.length > 1 ? `<button type="button" data-remove-stop="${stop.id}">Remove</button>` : ""}</div>
    <div class="grid-2">
      <div class="field"><label for="city-${stop.id}">City</label><input id="city-${stop.id}" value="${escapeAttr(stop.city)}" placeholder="City..." /></div>
      <div class="field"><label for="region-${stop.id}">Region</label><input id="region-${stop.id}" value="${escapeAttr(stop.region)}" placeholder="State, region..." /></div>
    </div>
    <div class="grid-2">
      <div class="field"><label for="arrival-${stop.id}">Arrival</label><input id="arrival-${stop.id}" type="date" value="${stop.arrival || ""}" /></div>
      <div class="field"><label for="departure-${stop.id}">Departure</label><input id="departure-${stop.id}" type="date" value="${stop.departure || ""}" /></div>
    </div>
    <div class="field"><label for="hotels-${stop.id}">Hotels</label><input id="hotels-${stop.id}" value="${escapeAttr((stop.hotels || []).join(", "))}" placeholder="Hotel Alfonso, Aman..." /></div>
    <div class="field"><label for="airports-${stop.id}">Airports</label><input id="airports-${stop.id}" value="${escapeAttr((stop.airports || []).join(", "))}" placeholder="MAD, JFK..." /></div>
  </section>`).join("");
}

function escapeAttr(value) {
  return String(value || "").replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function validateTrip() {
  if (!selectedCountry) return "Select a destination country";
  if (!stops[0]?.city) return "Add at least one city";
  const invalidDates = stops.some((stop) => stop.arrival && stop.departure && new Date(stop.departure) < new Date(stop.arrival));
  if (invalidDates) return "Departure must be after arrival";
  const invalidAirports = stops.flatMap((stop) => stop.airports || []).some((code) => !/^[A-Z]{3}$/.test(code));
  if (invalidAirports) return "Airports must use 3-letter IATA codes";
  return "";
}

function saveTrip(event) {
  event.preventDefault();
  flushStops();
  const error = validateTrip();
  if (error) return toast(error, true);
  const id = $("tripId").value || crypto.randomUUID();
  const payload = {
    id,
    country: selectedCountry,
    purpose: $("purposeInput").value,
    status: $("statusInput").value,
    transport: document.querySelector("#transportInput button.active")?.dataset.value || "plane",
    tags: $("tagsInput").value.split(",").map((item) => item.trim()).filter(Boolean),
    photoUrl: $("photoInput").value.trim(),
    notes: $("notesInput").value.trim(),
    stops,
    updatedAt: new Date().toISOString()
  };
  const index = state.trips.findIndex((trip) => trip.id === id);
  if (index >= 0) state.trips[index] = payload;
  else state.trips.push(payload);
  if (payload.status === "visited") state.wishlist = state.wishlist.filter((code) => code !== payload.country.code);
  dirtyForm = false;
  closeOverlay("tripOverlay");
  queueSave();
  toast(index >= 0 ? "Trip updated" : "Trip added to your journal");
}

function openCountry(country) {
  const trips = state.trips.filter((trip) => trip.country?.code === country.code);
  const days = trips.reduce((sum, trip) => sum + tripDays(trip), 0);
  const cities = new Set(trips.flatMap((trip) => trip.stops || []).map((stop) => stop.city).filter(Boolean));
  const lastTrip = [...trips].sort((a, b) => new Date(b.stops?.[0]?.arrival || 0) - new Date(a.stops?.[0]?.arrival || 0))[0];
  const inWishlist = state.wishlist.includes(country.code);
  $("countryDetail").innerHTML = `<div style="text-align:center;margin-bottom:22px">
    <div style="font-size:64px">${country.flag}</div>
    <h2>${country.name}</h2>
    <p class="muted">${country.region}</p>
  </div>
  <div class="stats-grid" style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:16px">
    <article class="stat"><strong>${trips.length}</strong><span>Trips</span></article>
    <article class="stat"><strong>${days}</strong><span>Days</span></article>
    <article class="stat"><strong>${cities.size}</strong><span>Cities</span></article>
    <article class="stat"><strong>${lastTrip?.stops?.[0]?.arrival || "-"}</strong><span>Last</span></article>
  </div>
  <div class="button-row">
    <button class="btn ghost" data-country-wish="${country.code}">${inWishlist ? "Remove Wishlist" : "Add Wishlist"}</button>
    <button class="btn" data-country-log="${country.code}">Log Trip</button>
  </div>
  <div class="stop-list" style="margin-top:18px">${trips.length ? trips.map((trip) => `<button class="row-action" data-trip-from-country="${trip.id}">${trip.stops?.[0]?.arrival || "-"} · ${trip.stops?.map((stop) => stop.city).filter(Boolean).join(" / ")}</button>`).join("") : "<p class='muted' style='text-align:center'>No visits logged yet</p>"}</div>`;
  openOverlay("countryOverlay");
}

function openOverlay(id) {
  $(id).classList.add("open");
  $(id).setAttribute("aria-hidden", "false");
}

function closeOverlay(id) {
  $(id).classList.remove("open");
  $(id).setAttribute("aria-hidden", "true");
}

function confirmCloseTrip() {
  if (!dirtyForm || confirm("Close without saving changes?")) closeOverlay("tripOverlay");
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nisso-backup-${today()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  toast("Data exported");
}

async function importData(file) {
  try {
    const imported = JSON.parse(await file.text());
    state = normalizeImported(imported);
    queueSave();
    toast("Data imported");
  } catch {
    toast("Could not import that JSON", true);
  }
}

function bindEvents() {
  $("themeBtn").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    queueSave();
    toast(state.theme === "dark" ? "Dark mode" : "Light mode");
  });
  $("fab").addEventListener("click", () => openTrip());
  document.querySelector(".bottom-nav").addEventListener("click", (event) => {
    const button = event.target.closest("[data-screen]");
    if (!button) return;
    document.querySelectorAll(".bottom-nav button").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".screen").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    $(`screen-${button.dataset.screen}`).classList.add("active");
    $("fab").classList.toggle("hidden", ["profile", "roadmap"].includes(button.dataset.screen));
  });
  document.querySelector(".map-toggle").addEventListener("click", (event) => {
    const button = event.target.closest("[data-map-mode]");
    if (!button) return;
    mapMode = button.dataset.mapMode;
    document.querySelectorAll("[data-map-mode]").forEach((item) => item.classList.toggle("active", item === button));
    colorMap();
  });
  $("regionTabs").addEventListener("click", (event) => {
    const button = event.target.closest("[data-region]");
    if (!button) return;
    regionFilter = button.dataset.region;
    renderRegionTabs();
    renderCountries();
  });
  $("yearTabs").addEventListener("click", (event) => {
    const button = event.target.closest("[data-year]");
    if (!button) return;
    yearFilter = button.dataset.year;
    renderYears();
    renderTimeline();
  });
  $("countrySearch").addEventListener("input", renderCountries);
  $("countryList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-country]");
    if (button) openCountry(countryByCode(button.dataset.country));
  });
  $("timeline").addEventListener("click", (event) => {
    const card = event.target.closest("[data-trip]");
    if (card) openTrip(card.dataset.trip);
  });
  $("countryInput").addEventListener("input", () => {
    dirtyForm = true;
    const query = $("countryInput").value.toLowerCase();
    const results = COUNTRIES.filter((country) => country.name.toLowerCase().includes(query)).slice(0, 8);
    $("countrySuggestions").innerHTML = results.map((country) => `<button type="button" data-pick-country="${country.code}">${country.flag} ${country.name}</button>`).join("");
    $("countrySuggestions").classList.toggle("open", Boolean(query && results.length));
  });
  $("countrySuggestions").addEventListener("click", (event) => {
    const button = event.target.closest("[data-pick-country]");
    if (!button) return;
    selectedCountry = countryByCode(button.dataset.pickCountry);
    $("countryInput").value = `${selectedCountry.flag} ${selectedCountry.name}`;
    $("countrySuggestions").classList.remove("open");
  });
  $("transportInput").addEventListener("click", (event) => {
    const button = event.target.closest("[data-value]");
    if (button) setTransport(button.dataset.value);
  });
  $("tripForm").addEventListener("input", () => dirtyForm = true);
  $("tripForm").addEventListener("submit", saveTrip);
  $("stops").addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-stop]");
    if (!button) return;
    flushStops();
    stops = stops.filter((stop) => stop.id !== button.dataset.removeStop);
    renderStops();
  });
  document.body.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "close-trip") confirmCloseTrip();
    if (action === "close-country") closeOverlay("countryOverlay");
    if (action === "close-profile") closeOverlay("profileOverlay");
    if (action === "add-stop") { flushStops(); stops.push({ id: crypto.randomUUID(), city: "", region: "", arrival: today(), departure: today(), hotels: [], airports: [] }); renderStops(); }
    if (action === "edit-profile") { $("profileNameInput").value = state.profile.name; $("profileHandleInput").value = state.profile.handle; openOverlay("profileOverlay"); }
    if (action === "add-purpose") {
      const purpose = $("newPurpose").value.trim();
      if (purpose && !state.purposes.includes(purpose)) state.purposes.push(purpose);
      $("newPurpose").value = "";
      queueSave();
    }
    if (action === "export-data") exportData();
    if (action === "reset-data" && confirm("Erase all local travel data?")) { state.trips = []; state.wishlist = []; queueSave(); toast("Local data erased"); }
    if (action === "save-cloud") {
      localStorage.setItem(CLOUD_KEY, JSON.stringify({ url: $("supabaseUrl").value.trim(), anonKey: $("supabaseAnon").value.trim() }));
      toast("Supabase config saved");
    }
    if (action === "sync-now") {
      queueSave();
      toast("Sync queued");
    }
  });
  $("purposeList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-purpose]");
    if (!button) return;
    state.purposes = state.purposes.filter((purpose) => purpose !== button.dataset.purpose);
    queueSave();
  });
  $("profileForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.profile = { name: $("profileNameInput").value.trim() || "Traveler", handle: $("profileHandleInput").value.trim() || "@houseofnisso" };
    closeOverlay("profileOverlay");
    queueSave();
    toast("Profile updated");
  });
  $("deleteTripBtn").addEventListener("click", () => {
    const id = $("tripId").value;
    if (id && confirm("Delete this trip?")) {
      state.trips = state.trips.filter((trip) => trip.id !== id);
      closeOverlay("tripOverlay");
      queueSave();
      toast("Trip deleted");
    }
  });
  $("countryOverlay").addEventListener("click", (event) => {
    const wish = event.target.closest("[data-country-wish]");
    const log = event.target.closest("[data-country-log]");
    const trip = event.target.closest("[data-trip-from-country]");
    if (wish) {
      const code = wish.dataset.countryWish;
      state.wishlist = state.wishlist.includes(code) ? state.wishlist.filter((item) => item !== code) : [...state.wishlist, code];
      closeOverlay("countryOverlay");
      queueSave();
      toast("Wishlist updated");
    }
    if (log) { closeOverlay("countryOverlay"); openTrip(null, countryByCode(log.dataset.countryLog)); }
    if (trip) { closeOverlay("countryOverlay"); openTrip(trip.dataset.tripFromCountry); }
  });
  $("importFile").addEventListener("change", (event) => event.target.files?.[0] && importData(event.target.files[0]));
  ["tripOverlay", "countryOverlay", "profileOverlay"].forEach((id) => $(id).addEventListener("click", (event) => {
    if (event.target.id === "tripOverlay") confirmCloseTrip();
    if (event.target.id === "countryOverlay") closeOverlay("countryOverlay");
    if (event.target.id === "profileOverlay") closeOverlay("profileOverlay");
  }));
}

async function boot() {
  await loadState();
  bindEvents();
  render();
  initMap();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", boot);
