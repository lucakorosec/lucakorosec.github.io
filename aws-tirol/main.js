
let basemapGray = L.tileLayer.provider('BasemapAT.grau'); //provider ist ein dingi das mir die karten reinladet

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

let layerControl = L.control.layers({ //dropdownmenu mit karten aus und einschalten
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


let awsURL = 'https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson'; //haben die url mit den daten zu den wetterstationen in variabel awsURL gesopeichert



let awsLayer = L.featureGroup(); //erstelle layergruppe awslayers um die stationen alle darinzuspeichern um alle gemeinsam ansprechen zu können
layerControl.addOverlay(awsLayer, "Wetterstationen Tirol"); // extra auswahlpunkt im dropdown mit wetterstationen Tirol
//awsLayer.addTo(map); //standard einstellung dass die stationen angezeigt werden und im dropdown auschaltbar sind

let snowLayer = L.featureGroup();
layerControl.addOverlay(snowLayer, "Schneehöhen");
//snowLayer.addTo(map);

let windLayer = L.featureGroup();
layerControl.addOverlay(windLayer, "Windgeschwindigkeit");
// windLayer.addTo(map);

let luftLayer = L.featureGroup();
layerControl.addOverlay(luftLayer, "Lufttemperatur");
luftLayer.addTo(map);



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
            let marker  = L.marker([
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
                <li>Windrichtung: ${station.properties.WR ||'?'}</li>
                <li>Windgeschwindigkeit: ${station.properties.WG ||'?'} km/h</li>
                <li>Schneehöhe: ${station.properties.HS ||'?'} cm</li>
            </ul>
            <a target="blank" href="https://wiski.tirol.gv.at/lawine/grafiken/1100/standard/tag/${station.properties.plot}.png">Grafik</a>
            `); //name hinzufügen bei den markern
                //extra infos als liste zu den popups hinzugefügt
                // link zur grafik die hinterlegt sind zur jeweiligen station




            marker.addTo(awsLayer); //marker werden in den layergruppe aws layer denn wir in Zeile 38 erstellt haben gespeichert
            if (station.properties.HS) {
                let highlightClass = '';
                if (station.properties.HS > 100) {
                    highlightClass = 'snow-100';
                }
                if (station.properties.HS > 200) {
                    highlightClass = 'snow-200';
                }
                let snowIcon = L.divIcon ({
                    html: `<div class="snow-lable ${highlightClass}">${station.properties.HS}</div>`
                })
                let snowMarker = L.marker ([
                    station.geometry.coordinates[1],
                    station.geometry.coordinates[0]
                ], {
                    icon: snowIcon
                });
                snowMarker.addTo(snowLayer);
            }





            marker.addTo(awsLayer);
            if (station.properties.WG) {
                let windhighlightClass = '';
                if (station.properties.WG > 10) {
                    windhighlightClass = 'wind-10';
                }
                if (station.properties.WG > 20) {
                    windhighlightClass = 'wind-20';
                }
                let windIcon = L.divIcon ({ //damit kann wert in marker schreiben der angezeigt wird im popup
                    html: `<div class="wind-lable ${windhighlightClass}">${station.properties.WG}</div>`
                })
                let windMarker = L.marker ([
                    station.geometry.coordinates[1],
                    station.geometry.coordinates[0]
                ], {
                    icon: windIcon
                });
                windMarker.addTo(windLayer);
            }




            marker.addTo(awsLayer);
            if (station.properties.LT) {
                let lufthighlightClass = '';
                if (station.properties.LT < 0){
                    lufthighlightClass = 'luft-neg';
                }
                if (station.properties.LT === 0){
                    lufthighlightClass = 'luft-0';
                }
                if (station.properties.LT > 0) {
                    lufthighlightClass = 'luft-pos';
                }
                let luftIcon = L.divIcon ({
                    html: `<div class="luft-lable ${lufthighlightClass}">${station.properties.LT}</div>`
                })
                let luftMarker = L.marker ([
                    station.geometry.coordinates[1],
                    station.geometry.coordinates[0]
                ], {
                    icon: luftIcon
                });
                luftMarker.addTo(luftLayer);
            }


        }
        // set map view to all stations
        map.fitBounds(awsLayer.getBounds());       
});



// statt dem if === 0 kann man eigentlich auch eine if <= 0 machen denk ih, hab aber eine eigene klasse erstellt, da ja die 0 auch nicht negativ ist
// ich beautify diese js datei ungern, da die kommentare sonst teilweise quer durcheinandergeschoben werden :D
// liebe grüße lucakorosec