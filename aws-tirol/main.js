
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
    "BasemapAT.orthofoto": L.tileLayer.provider('BasemapAT.orthofoto')
}).addTo(map); //zur karte hinzufügen. muss bei L passieren