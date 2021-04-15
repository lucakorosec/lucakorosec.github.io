
let basemapGray = L.tileLayer.provider('BasemapAT.grau');

let map = L.map ("map", {
    center: [47, 11],
    zoom: 9,
    layers: [
       // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
        basemapGray
    ]
});

// baselayer von der provider seite auf unsere seite reinladen https://cdnjs.com/libraries/leaflet-providers
//L greift auf leaflet zu, control den script zu controls in der L bibliothek und layers sag i selber
let layerControl = L.control.layers({
    "BasemapAT.grau": basemapGray,
    "BasemapAT.orthofoto": L.tileLayer.provider('BasemapAT.orthofoto'),
    "BasemapAT.terrain": L.tileLayer.provider('BasemapAT.terrain'),
    "BasemapAT.surface": L.tileLayer.provider('BasemapAT.surface'),
    //"BasemapAT.overlay": L.tileLayer.provider('BasemapAT.overlay'),
    "BasemapAT.basemap": L.tileLayer.provider('BasemapAT.basemap'),
    //das erste rote ist was dann auf der seite im drop down steht
    //layer kombinieren
    "BasemapAT.overlay+ortho": L.layerGroup([
        L.tileLayer.provider('BasemapAT.orthofoto'),
        L.tileLayer.provider('BasemapAT.overlay')
    ])
}).addTo(map); //zur karte hinzufügen. muss bei L passieren am ende von der schleife


let awsURL = 'https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson';

// mit let die varibael benannt in awsurl, mit fetch soll er die daten aus datagvat laden, mit then soll er eine "response" < so nennen wir es, sagen dass es geladen und eine json ist
//und mit console.log in der f12 console soll stehen wenn die daten als json erkannt und geladen worden sind in zeile 1 schreiben
//for jede station in der json datenbank (sind darin als feature bezeichnet) soll er in der f12 console station schreiben
// und mit let marker einen marker in der karte darstellen mit den coord aus der json datenbank die wir ja station genannt haben, daher station.geometry (geometry steht wieder in der json datenbank) und dann 0 für long und 1 lat

fetch(awsURL) //daten herunterladen von der datagvat bib
    .then(response => response.json()) //konvertieren in json (fehleranfällig daher nächste then clause)
    .then(json => { //weiterarbeiten mit json
        console.log('Daten konvertiert: ', json);
        for (station of json.features) {
            console.log('Station: ', station);
            let marker  = L.marker(
                [station.geometry.coordinates[1],
                station.geometry.coordinates[0]
            ]);
            marker.bindPopup(`<h3>${station.properties.name}</h3>`); //name hinzufügen bei den markern
            marker.addTo(map);
        }
});