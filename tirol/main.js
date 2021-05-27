/* global L */
// Bike Trail Tirol Beispiel

// Kartenhintergründe der basemap.at definieren
let baselayers = {
    standard: L.tileLayer.provider("BasemapAT.basemap"),
    grau: L.tileLayer.provider("BasemapAT.grau"),
    terrain: L.tileLayer.provider("BasemapAT.terrain"),
    surface: L.tileLayer.provider("BasemapAT.surface"),
    highdpi: L.tileLayer.provider("BasemapAT.highdpi"),
    ortho_overlay: L.layerGroup([
        L.tileLayer.provider("BasemapAT.orthofoto"),
        L.tileLayer.provider("BasemapAT.overlay")
    ]),
};

// Overlays für die Themen zum Ein- und Ausschalten definieren
let overlays = {
    tracks: L.featureGroup(),
    wikipedia: L.featureGroup()
};

// Karte initialisieren und auf Innsbrucks Wikipedia Koordinate blicken
let map = L.map("map", {
    center: [47.267222, 11.392778],
    zoom: 9,
    layers: [
        baselayers.grau
    ]
})
// Kartenhintergründe und Overlays zur Layer-Control hinzufügen
let layerControl = L.control.layers({
    "basemap.at Standard": baselayers.standard,
    "basemap.at grau": baselayers.grau,
    "basemap.at Relief": baselayers.terrain,
    "basemap.at Oberfläche": baselayers.surface,
    "basemap.at hochauflösend": baselayers.highdpi,
    "basemap.at Orthofoto beschriftet": baselayers.ortho_overlay
}, {
    "GPX-Tracks": overlays.tracks,
    "Wikipedia-Artikel": overlays.wikipedia
}).addTo(map);

// Overlay mit GPX-Track anzeigen
overlays.tracks.addTo(map);
overlays.wikipedia.addTo(map);

// Elevation control initialisieren
const elevationControl = L.control.elevation({
    elevationDiv: "#profile",
    followMarker: false,
    theme: 'gold-theme',
}).addTo(map);

// Wikipedia Artikel Zeichnen
let articleDrawn = {};
const drawWikipedia = (bounds) => {
    // console.log(bounds);
    let url = `https://secure.geonames.org/wikipediaBoundingBoxJSON?north=${bounds.getNorth()}&south=${bounds.getSouth()}&east=${bounds.getEast()}&west=${bounds.getWest()}&username=lucakorosec&lang=de&maxRows=30`;
    // console.log(url);

    //icons aus icons ordner definieren
    let icons = {
        adm1st: "wikipedia_administration.png",
        adm2nd: "wikipedia_administration.png",
        adm3rd: "wikipedia_administration.png",
        airport: "wikipedia_helicopter.png",
        city: "wikipedia_smallcity.png",
        glacier: "wikipedia_glacier-2.png",
        landmark: "wikipedia_landmark.png",
        railwaystation: "wikipedia_train.png",
        river: "wikipedia_river-2.png",
        mountain: "wikipedia_mountains.png",
        waterbody: "wikipedia_lake.png",
        default: "wikipedia_information.png",
    };

    // URL bei geonames.org aufrufen und JSO-Daten abholen
    fetch(url).then(
        response => response.json()
    ).then(jsonData => {
        // console.log(jsonData);

        // Artikel Marker erzeugen
        for (let article of jsonData.geonames) {
            //habe ich den artikel schon gezeochnet oder nicht ?
            if (articleDrawn[article.wikipediaUrl]) {
                // Ja, nicht noch einmal zeichnen
                // console.log("schon gesehen", article.wikipediaUrl);
                continue;
            } else {
                articleDrawn[article.wikipediaUrl] = true;
            }

            //welches icon soll verwendet werden?
            if (icons[article.feature]) {
                //ein bekanntes
            } else {
                // unser generisches Info.icon
                article.feature = "default";
            }

            let mrk = L.marker([article.lat, article.lng],{
                //icon einbauen
                icon: L.icon({
                    iconUrl: `icons/${icons[article.feature]}`,
                    iconSize: [32, 37],
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37],
                })
            });
            mrk.addTo(overlays.wikipedia);

            //optionales Bild definieren
            let img = "";
            if (article.thumbnailImg) {
                img = `<img src="${article.thumbnailImg}"
                alt="thumbnail">`;
            }

            //Popup erzeugen mit jeweiligen Link der Geonam Wikipedia Artikel
            mrk.bindPopup(`
            <small>${article.feature}</small>
            <h3>${article.title} (${article.elevation}m)</h3>
            ${img}
            <p>${article.summary}</p>
            <a target="Wikipedia" href="https://${article.wikipediaUrl}">gesamter Wikipedia Artikel</a>
            `)
        }
    });
};

let activeElevationTrack;

// Funktion zum Zeichnen eines Tracks inkl. Hoehenprofil
const drawTrack = (nr) => {
    // console.log('Track: ', nr);
    // clear elevation data:
    elevationControl.clear();
    // clear GPX plugin layers
    overlays.tracks.clearLayers();
    // bugfix for leaflet-elevation plugin not cleaning up
    if (activeElevationTrack) {
        activeElevationTrack.removeFrom(map);
    }
    // for new browsers:
    // activeElevationTrack?.removeFrom(map);
    let gpxTrack = new L.GPX(`tracks/${nr}.gpx`, {
        async: true,
        marker_options: {
            startIconUrl: `icons/number_${nr}.png`,
            endIconUrl: 'icons/finish.png',
            shadowUrl: null,
        },
        polyline_options: {
            color: 'black',
            dashArray: [2, 5],
        },
    }).addTo(overlays.tracks);
    // Eventhandler wenn alle Daten des GPX plugin geladen sind
    gpxTrack.on("loaded", () => {
        // console.log('loaded gpx');
        map.fitBounds(gpxTrack.getBounds());
        // console.log('Track name: ', gpxTrack.get_distance());
        gpxTrack.bindPopup(`
        <h3>${gpxTrack.get_name()}</h3>
        <ul>
            <li>Streckenlänge: ${gpxTrack.get_distance()} m</li>
            <li>tiefster Punkt: ${gpxTrack.get_elevation_min()} m</li>
            <li>höchster Punkt: ${gpxTrack.get_elevation_max()} m</li>
            <li>Höhenmeter bergauf: ${gpxTrack.get_elevation_gain()} m</li>
            <li>Höhenmeter bergab: ${gpxTrack.get_elevation_loss()} m</li>
        </ul>
        `);

    });
    elevationControl.load(`tracks/${nr}.gpx`);
    elevationControl.on('eledata_loaded', (evt) => {
        activeElevationTrack = evt.layer;
    });

};

const selectedTrack = 6;
drawTrack(selectedTrack);

const updateTexts = (nr) => {
    console.log(nr);
    for (let etappe of BIKETIROL) {
        //console.log(etappe);
        // ist es die aktuelle etappe ?`
        if (etappe.nr == nr) {
            //console.log("unsere Etappe", etappe)
            for (let key in etappe) {
                console.log("key: ", key, "value: ", etappe[key]);
                // gibt es ein element im html mit der ID von "key"
                if (document.querySelector(`#text-${key}`)) {
                    //console.log("juhuu", key, etappe[key]);
                    document.querySelector(`#text-${key}`).innerHTML = etappe[key];
                }
            }
        }
    }
}

// console.log('biketirol json: ', BIKETIROL);
let pulldown = document.querySelector("#pulldown");

// Schleife zum Aufbau des Dropdown Menu
let selected = '';
for (let track of BIKETIROL) {
    if (selectedTrack == track.nr) {
        selected = 'selected';
    } else {
        selected = '';
    }
    pulldown.innerHTML += `<option ${selected} value="${track.nr}">${track.nr}: ${track.etappe}</option>`;
}
// metadaten der etappe updaten
updateTexts(pulldown.value);

// Eventhandler fuer Aenderung des Dropdown
pulldown.onchange = () => {
    // console.log('changed!!!!!', pulldown.value);
    drawTrack(pulldown.value);

    // metadaten der etappe updaten
updateTexts(pulldown.value);
};

map.on("zoomend moveend", () => {
    // Wikipedia Artikel zeichnen
    drawWikipedia(map.getBounds());
});
