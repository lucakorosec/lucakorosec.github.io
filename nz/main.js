console.log(L);

let stop = {
    nr: 15,
    name: "Franz-Josef-Gletscher",
    lat: -43.4668631325,
    lng: 170.188249247,
    user: "lucakorosec",
    wikipedia: "https://de.wikipedia.org/wiki/Franz-Josef-Gletscher"
};
//console.log(stop);
//console.log(stop.name);
//console.log(stop.lat);

const map = L.map("map", {
    // center: [stop.lat, stop.lng],
    // zoom: 13,
    fullscreenControl: true, //leaflet fullscreen
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
});

let nav = document.querySelector("#navigation");


ROUTE.sort((stop1, stop2) => {
    /* sortieren nach nummer im dropdown */
    return stop1.nr > stop2.nr
});

console.log(ROUTE); /*testen ob er die variablen in der route.js alle erkennt*/

for (let entry of ROUTE) {
    console.log(entry); /*schleife dass er alle einträge in der route.js durchlaufen und anschrieben soll*/

    nav.innerHTML += `
        <option value="${entry.user}">Stop ${entry.nr}: ${entry.name}</option>
    `;

    let mrk = L.marker([entry.lat, entry.lng]).addTo(map); /* marker für alle anderen stops erstellen*/
    mrk.bindPopup(`
         <h4>${entry.nr}: ${entry.name}</h4>
        <p><i class="fas fa-external-link-alt mr-3"></i><a href="${entry.wikipedia}"> Read about stop in Wikipedia</a></p>
        `); /* die entry einträge sind alles links zum route.js file..das man oben entry gennant hat  */

    if (entry.nr == 15) {
        /* wenn die nr 15 im route.js gefunden wird dann zeigt er diese im zentrum an und zeigt das popup an */
        map.setView([entry.lat, entry.lng], 13);
        mrk.openPopup(); /* marker und marker immer anzeigen*/
    }
}

let mrk = L.marker([stop.lat, stop.lng]).addTo(map);
mrk.bindPopup(`
    <h4>${stop.nr}: ${stop.name}</h4>
        <p><i class="fas fa-external-link-alt mr-3"></i><a href="${stop.wikipedia}"> Read about stop in Wikipedia</a></p>
`).openPopup(); /* marker und marker immer anzeigen*/

nav.options.selectedIndex = 15 - 1; /* wählt im dropdown den eigenen stop aus bzw den geöffneten */
nav.onchange = (evt) => {
    let selected = evt.target.selectedIndex;
    let options = evt.target.options;
    let username = options[selected].value;
    let link = `https://${username}.github.io/nz/index.html`;
    console.log(username, link);

    window.location.href = link; /* er geht auf das ausgewählte dropdown dingi und öffnet den vorab gespeicherten githgub link */
};

//<option value="lucakorosec">Franz-Josef-Gletscher</option>

//console.log(document.querySelector("#map")); /* raute map sucht mir das element mit der ID = Map)*/


// Leaflet minimap 
var miniMap = new L.Control.MiniMap(L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"), {
    toggleDisplay: true,
    minimized: false,
    minZoom: 0,
    maxZoom: 13,
    position: 'bottomleft'
}).addTo(map);
