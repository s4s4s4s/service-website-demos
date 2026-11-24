const providers = [
  {name: "Mara Chen, MD", initials: "MC", specialty: "Family medicine", location: "River District", languages: ["English", "Mandarin"], accepting: true},
  {name: "Lucía Ortega, NP", initials: "LO", specialty: "Family medicine", location: "East Juniper", languages: ["English", "Spanish"], accepting: true},
  {name: "Elias Martin, MD", initials: "EM", specialty: "Pediatrics", location: "North Park", languages: ["English", "French"], accepting: false},
  {name: "Noor Haddad, PA", initials: "NH", specialty: "Pediatrics", location: "East Juniper", languages: ["Arabic", "English"], accepting: true},
  {name: "Jordan Reed, LCSW", initials: "JR", specialty: "Behavioral health", location: "River District", languages: ["English"], accepting: true},
  {name: "Camila Flores, DDS", initials: "CF", specialty: "Dental care", location: "North Park", languages: ["English", "Spanish"], accepting: false},
];

const filters = document.querySelector("#filters");
const results = document.querySelector("#results");
const summary = document.querySelector("#summary");
const profile = document.querySelector("#profile");
const searchFields = ["specialty", "location", "language"];
let profileTrigger;

for (const field of searchFields) {
  const options = providers.flatMap(provider => field === "language" ? provider.languages : provider[field]);
  const select = filters.elements[field];
  for (const option of [...new Set(options)].sort()) {
    select.add(new Option(option, option));
  }
}

const initial = new URLSearchParams(window.location.search);
for (const field of ["q", ...searchFields]) {
  const value = initial.get(field);
  const control = filters.elements[field];
  if (value && (field === "q" || [...control.options].some(option => option.value === value))) {
    control.value = value;
  }
}
filters.elements.accepting.checked = initial.get("accepting") === "1";

function node(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function availability(provider) {
  return provider.accepting ? "Accepting new patients" : "Not accepting new patients";
}

function detailRows(provider, includeAvailability = false) {
  const details = [["Location", provider.location], ["Languages", provider.languages.join(", ")]];
  if (includeAvailability) details.push(["Availability", availability(provider)]);
  return details.flatMap(([term, value]) => [node("dt", term), node("dd", value)]);
}

function showProfile(provider, trigger) {
  profileTrigger = trigger;
  document.querySelector("#profile-specialty").textContent = provider.specialty;
  document.querySelector("#profile-name").textContent = provider.name;
  document.querySelector("#profile-details").replaceChildren(...detailRows(provider, true));
  profile.showModal();
}

function createCard(provider) {
  const card = node("article", "", "person");
  const top = node("div", "", "person-top");
  const avatar = node("span", provider.initials, "initials");
  avatar.setAttribute("aria-hidden", "true");
  const heading = node("div", "");
  heading.append(node("h3", provider.name), node("p", provider.specialty));
  top.append(avatar, heading);
  const details = node("dl", "");
  details.append(...detailRows(provider));
  const button = node("button", "View profile", "profile-button");
  button.type = "button";
  button.setAttribute("aria-label", `View profile: ${provider.name}`);
  button.addEventListener("click", () => showProfile(provider, button));
  card.append(top, details, node("p", availability(provider), "status"), button);
  return card;
}

function normalize(value) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("en").trim();
}

function render() {
  const params = new URLSearchParams();
  for (const [key, value] of new FormData(filters)) {
    if (value.trim()) params.set(key, value.trim());
  }
  const terms = normalize(params.get("q") || "").split(/\s+/).filter(Boolean);
  const matched = providers.filter(provider => {
    const searchable = normalize([provider.name, provider.specialty, provider.location, ...provider.languages].join(" "));
    return terms.every(term => searchable.includes(term))
      && (!params.has("specialty") || params.get("specialty") === provider.specialty)
      && (!params.has("location") || params.get("location") === provider.location)
      && (!params.has("language") || provider.languages.includes(params.get("language")))
      && (!params.has("accepting") || provider.accepting);
  });
  const status = `${matched.length} ${matched.length === 1 ? "result" : "results"}`;
  if (summary.textContent !== status) summary.textContent = status;
  if (matched.length) {
    results.replaceChildren(...matched.map(createCard));
  } else {
    results.replaceChildren(node("p", "No providers match these filters. Change a filter or reset the search.", "empty"));
  }
  if (window.location.protocol !== "file:") {
    const url = new URL(window.location.href);
    url.search = params.toString();
    if (url.href !== window.location.href) window.history.replaceState(null, "", url);
  }
}

filters.addEventListener("input", render);
filters.addEventListener("submit", event => event.preventDefault());
filters.addEventListener("reset", () => window.requestAnimationFrame(render));
document.querySelector("#close-profile").addEventListener("click", () => profile.close());
profile.addEventListener("close", () => profileTrigger?.focus());
render();
