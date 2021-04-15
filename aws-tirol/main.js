
let basemapGray = L.tileLayer.provider('BasemapAT.grau');

let map = L.map ("map", {
    center: [47, 11],
    zoom: 9,
    layers: [
       // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
        basemapGray
    ]
});


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

// mit let die varibael benannt in awsurl, mit fetch soll er die daten aus datagvat laden, mit then soll er eine "response" < so nennen wir es, sagen dass es geladen ist
fetch(awsURL)
    .then(response => response.json())
    .then(json => {
        console.log('Daten konvertiert: ', json);
        for (station of json.features) {
            console.log('Station: ', station);
            let marker  = L.marker(
                [station.geometry.coordinates[1],
                station.geometry.coordinates[0]]
                );
            marker.addTo(map);
        }
});