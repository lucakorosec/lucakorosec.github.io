
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
    center: [stop.lat, stop.lng],
    zoom: 13,
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
});


console.log(ROUTE); /*testen ob er die variablen in der route.js alle erkennt*/
for (let entry of ROUTE) {
    console.log(entry); /*schleife dass er alle einträge in der route.js durchlaufen und anschrieben soll*/

        
        let mrk = L.marker([entry.lat, entry.lng]).addTo(map);
        mrk.bindPopup(`
         <h4>${entry.nr}: ${entry.name}</h4>
        <p><i class="fas fa-external-link-alt mr-3"></i><a href="${entry.wikipedia}"> Read about stop in Wikipedia</a></p>
        `).openPopup(); /* marker und marker immer anzeigen*/

}

let mrk = L.marker([stop.lat, stop.lng]).addTo(map);
mrk.bindPopup(`
    <h4>${stop.nr}: ${stop.name}</h4>
        <p><i class="fas fa-external-link-alt mr-3"></i><a href="${stop.wikipedia}"> Read about stop in Wikipedia</a></p>
`).openPopup(); /* marker und marker immer anzeigen*/

//console.log(document.querySelector("#map")); /* raute map sucht mir das element mit der ID = Map)*/
