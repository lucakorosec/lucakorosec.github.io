//https://leafletjs.com/reference-1.7.1.html#tilelayer
let basemapGray = L.tileLayer.provider('BasemapAT.grau'); //provider ist ein dingi das mir die karten reinladet

//https://leafletjs.com/reference-1.7.1.html#map-l-map
let map = L.map("map", {
    center: [47, 11],
    zoom: 9,
    fullscreenControl: true, //leaflet fullscreen
    layers: [
        // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
        basemapGray
    ]
});

// baselayer von der provider seite auf unsere seite reinladen https://cdnjs.com/libraries/leaflet-providers
//L greift auf leaflet zu, control den script zu controls in der L bibliothek und layers sag i selber


let overlays = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
    snowheight: L.featureGroup(),
    windspeed: L.featureGroup(),
    winddirection: L.featureGroup(),
    humidity: L.featureGroup(),
};


//https://leafletjs.com/reference-1.7.1.html#control-layers-l-control-layers
let layerControl = L.control.layers({ //dropdownmenu mit karten aus und einschalten
    "BasemapAT.grau": basemapGray, //basemap objekt
    "BasemapAT.orthofoto": L.tileLayer.provider('BasemapAT.orthofoto'),
    "BasemapAT.terrain": L.tileLayer.provider('BasemapAT.terrain'),
    "BasemapAT.surface": L.tileLayer.provider('BasemapAT.surface'), //"BasemapAT.overlay": L.tileLayer.provider('BasemapAT.overlay'),
    "BasemapAT.basemap": L.tileLayer.provider('BasemapAT.basemap'),
    //das erste rote ist was dann auf der seite im drop down steht
    //layer kombinieren
    //https://leafletjs.com/reference-1.7.1.html#layergroup-l-layergroup
    "BasemapAT.overlay+ortho": L.layerGroup([
        L.tileLayer.provider('BasemapAT.orthofoto'),
        L.tileLayer.provider('BasemapAT.overlay')
    ])
}, { //overlays objekt
    "Wetterstationen Tirol": overlays.stations,
    "Temperatur (°C)": overlays.temperature,
    "Luftfeuchtigkeit (%)": overlays.humidity,
    "Schneehöhe (cm)": overlays.snowheight,
    "Windgeschwindigkeit (km/h)": overlays.windspeed,
    "Windrichtung": overlays.winddirection
}, {
    collapsed: false //overlay control ist immer ausgeklappt
}).addTo(map); //zur karte hinzufügen. muss bei L passieren am ende von der schleife
overlays.temperature.addTo(map);

//massstab hinzugefügt
L.control.scale({
    maxWidth: 200,
    imperial: false,
    position: 'bottomleft'
}).addTo(map);

// Rainviewer einfügen
L.control.rainviewer({
    position: 'topleft',
    nextButtonText: '>',
    playStopButtonText: 'Start/Stop',
    prevButtonText: '<',
    positionSliderLabelText: "Uhrzeit:",
    opacitySliderLabelText: "Deckkraft:",
    animationInterval: 500,
    opacity: 0.8
}).addTo(map);

let getColor = (value, colorRamp) => {
    console.log("wert: ", value, "Palette: ", colorRamp);
    for (let rule of colorRamp) {
        if (value >= rule.min && value < rule.max) {
            return rule.col;
        }
    }
    return "black";
};

let newLabel = (coords, options) => { //FUNKTION DIE ALLES MACHT WAS WIR WOLLEN bei den 3 if abfragen
    let color = getColor(options.value, options.colors);
    //console.log("Wert", options.value, "bekommt Farbe", color);
    let lable = L.divIcon({ // habe ein label (selber so genannt) definiert und gesagt dass es ein divIcon ist und 1. value zugewiesen und icon
        html: `<div style="background-color:${color}">${options.value}</div>`,
        className: "text-label"
    })
    let marker = L.marker([coords[1], coords[0]], {
        icon: lable,
        title: `${options.station} (${coords[2]}m)`
    });
    return marker;
};

// Windrichtungen von Graden in den dazugehörigen Himmelsrichtung umwandeln/zuweisen
let getDirection = (direction, richtung) => {
    console.log("Wert: ", direction);
    for (let rule of richtung) {
        if ((direction >= rule.min) && (direction < rule.max)) {
            return rule.dir
        }
    }
};

// Windrichtung als (Kompass) Text im Lable hinzufügen
let newDirection = (coords, options) => {
    let direction = getDirection(options.value, options.directions);
    let label = L.divIcon({
        html: `<div>${direction}</div>`,
        className: "text-label",
    })
    let marker = L.marker([coords[1], coords[0]], {
        icon: label,
        title: `${options.station} (${coords[2]} m)`
    });
    return marker;
};

let awsURL = 'https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson'; //haben die url mit den daten zu den wetterstationen in variabel awsURL gesopeichert

//https://leafletjs.com/reference-1.7.1.html#featuregroup-l-featuregroup
//let awsLayer = L.featureGroup(); //erstelle layergruppe awslayers um die stationen alle darinzuspeichern um alle gemeinsam ansprechen zu können
//layerControl.addOverlay(awsLayer, "Wetterstationen Tirol"); // extra auswahlpunkt im dropdown mit wetterstationen Tirol
//awsLayer.addTo(map); //standard einstellung dass die stationen angezeigt werden und im dropdown auschaltbar sind

//let snowLayer = L.featureGroup();
//layerControl.addOverlay(snowLayer, "Schneehöhen");
//snowLayer.addTo(map);

//let windLayer = L.featureGroup();
//layerControl.addOverlay(windLayer, "Windgeschwindigkeit");
//windLayer.addTo(map);

//let luftLayer = L.featureGroup();
//layerControl.addOverlay(luftLayer, "Lufttemperatur");
//luftLayer.addTo(map);



// mit let die varibael benannt in awsurl, mit fetch soll er die daten aus datagvat laden, mit then soll er eine "response" < so nennen wir es, sagen dass es geladen und eine json ist
//und mit console.log in der f12 console soll stehen wenn die daten als json erkannt und geladen worden sind in zeile 1 schreiben
//for jede station in der json datenbank (sind darin als feature bezeichnet) soll er in der f12 console station schreiben
// und mit let marker einen marker in der karte darstellen mit den coord aus der json datenbank die wir ja station genannt haben, daher station.geometry (geometry steht wieder in der json datenbank) und dann 0 für long und 1 lat

fetch(awsURL) //daten herunterladen von der datagvat bib
    .then(response => response.json()) //konvertieren in json (fehleranfällig daher nächste then clause)
    .then(json => { //weiterarbeiten mit json
        console.log('Daten konvertiert: ', json);
        for (station of json.features) {
            //console.log('Station: ', station);
            //https://leafletjs.com/reference-1.7.1.html#marker-l-marker
            let marker = L.marker([
                station.geometry.coordinates[1],
                station.geometry.coordinates[0]
            ]);

            let formattedDate = new Date(station.properties.date); //neues datumsobjekt erstellen, in Zeile 58 wird darauf zurückgegriffen, de als ländereinstellung 

            marker.bindPopup(`
            <h3>${station.properties.name}</h3>
            <ul>
                <li>Datum: ${formattedDate.toLocaleString("de")}</li>
                <li>Seehöhe: ${station.geometry.coordinates[2] ||'?'} m.ü.A.</li>
                <li>Temperatur: ${station.properties.LT ||'?'} °C</li>
                <li>Luftfeuchtigkeit: ${station.properties.RH ||'?'} %</li>
                <li>Schneehöhe: ${station.properties.HS ||'?'} cm</li>
                <li>Windgeschwindigkeit: ${station.properties.WG ||'?'} km/h</li>
                <li>Windrichtung: ${station.properties.WR ||'?'} °</li>
            </ul>
            <a target="blank" href="https://wiski.tirol.gv.at/lawine/grafiken/1100/standard/tag/${station.properties.plot}.png">Grafik</a>
            `); //name hinzufügen bei den markern
            //extra infos als liste zu den popups hinzugefügt
            // link zur grafik die hinterlegt sind zur jeweiligen station


            marker.addTo(overlays.stations); //marker werden in den layergruppe aws layer denn wir in Zeile 38 erstellt haben gespeichert
            if (typeof station.properties.HS == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.HS.toFixed(0),
                    colors: COLORS.snowheight,
                    station: station.properties.name
                });
                marker.addTo(overlays.snowheight);
            }

            if (typeof station.properties.WG == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.WG.toFixed(0),
                    colors: COLORS.windspeed,
                    station: station.properties.name
                });
                marker.addTo(overlays.windspeed);
            }

            if (typeof station.properties.LT == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.LT.toFixed(1), //wenn nummer und das ist es bei uns, kann man den wert runden auf xy nachkommerstellen
                    colors: COLORS.temperature,
                    station: station.properties.name
                });
                marker.addTo(overlays.temperature);
            }

            if (typeof station.properties.RH == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.RH.toFixed(1), //wenn nummer und das ist es bei uns, kann man den wert runden auf xy nachkommerstellen
                    colors: COLORS.humidity,
                    station: station.properties.name
                });
                marker.addTo(overlays.humidity);
            }

            if (typeof station.properties.WR == "number") {
                let marker = newDirection(station.geometry.coordinates, {
                    value: station.properties.WR,
                    directions: DIRECTIONS,
                    station: station.properties.name,
                });
                marker.addTo(overlays.winddirection);
            }
        }
        // set map view to all stations
        map.fitBounds(overlays.stations.getBounds());
    });


    // Leaflet minimap 
var miniMap = new L.Control.MiniMap(L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'), {
    toggleDisplay: true,
    minimized: false,
}).addTo(map);
