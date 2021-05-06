// OGD-Wien Beispiel

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
    //minimapTest: L.tileLayer.provider("Esri.WorldImagery",{minZoom: 0, maxZoom: 13}) // minimap v1
};


// Overlays für die Themen zum Ein- und Ausschalten definieren
let overlays = {
    busLines: L.featureGroup(),
    busStops: L.markerClusterGroup(), // wird jetzt als leaflet marker cluster angezeigt
    pedAreas: L.featureGroup(),
    Attractions: L.featureGroup()
};

// Karte initialisieren und auf Wiens Wikipedia Koordinate blicken
let map = L.map("map", {
    fullscreenControl: true, //leaflet fullscreen
    center: [48.208333, 16.373056],
    zoom: 13,
    layers: [
        baselayers.grau
    ]
});

// Kartenhintergründe und Overlays zur Layer-Control hinzufügen
let layerControl = L.control.layers({
    "basemap.at Standard": baselayers.standard,
    "basemap.at grau": baselayers.grau,
    "basemap.at Relief": baselayers.terrain,
    "basemap.at Oberfläche": baselayers.surface,
    "basemap.at hochauflösend": baselayers.highdpi,
    "basemap.at Orthofoto beschriftet": baselayers.ortho_overlay
}, {
    "Liniennetz Vienna Sightseeing": overlays.busLines,
    "Haltestellen Vienna Sightseeing": overlays.busStops,
    "Fußgängerzonen": overlays.pedAreas,
    "Sehenswürdigkeiten": overlays.Attractions
}).addTo(map);

// alle Overlays nach dem Laden anzeigen
overlays.busLines.addTo(map);
overlays.busStops.addTo(map);
overlays.pedAreas.addTo(map);
overlays.Attractions.addTo(map);


let drawBusStop = (geojsonData) => {
    L.geoJson(geojsonData, {
        onEachFeature: (feature, layer) => { //popup für jedes feature (in den data daten)
            layer.bindPopup(`<strong>${feature.properties.LINE_NAME}</strong>
            <hr>
            Station: ${feature.properties.STAT_NAME}`)
        },
        pointToLayer: (geoJsonPoint, latlng) => { //icon selber definieren
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'icons/busstop.png',
                    iconSeize: [25, 25]
                })
            })
        },
        attribution: '<a href="https://data.wien.gv.at"> Stadt Wien</a> , <a href="https://mapicons.mapsmarker.com"> Maps Icon Collection</a>'
    }).addTo(overlays.busStops);
}

let drawBusLine = (geojsonData) => {
    console.log('Buslines: ', geojsonData);
    L.geoJson(geojsonData, {
        style: (feature) => { //objekte (linien) in ihrem stil beeinflussen
            let col = COLORS.buslines[feature.properties.LINE_NAME] //das macht die kommenden zeilen alle überflüssig
            //            if (feature.properties.LINE_NAME == 'Blue Line') {
            //                col = COLORS.buslines["Blue Line"];
            //            }
            //            if (feature.properties.LINE_NAME == 'Yellow Line') {
            //                col = COLORS.buslines["Yellow Line"];
            //            }
            //            if (feature.properties.LINE_NAME == 'Green Line') {
            //                col = COLORS.buslines["Green Line"];
            //            }
            return {
                color: col
            }
        },
        onEachFeature: (feature, layer) => { //popup für jedes feature (in den data daten)
            layer.bindPopup(`<strong>${feature.properties.LINE_NAME}</strong>
            <hr>
            von ${feature.properties.FROM_NAME}<br>
            nach ${feature.properties.TO_NAME}`)
        },
        attribution: '<a href="https://data.wien.gv.at"> Stadt Wien</a>'
    }).addTo(overlays.busLines);
}

let drawPedestrianAreas = (geojsonData) => {
    console.log('Zone: ', geojsonData);
    L.geoJson(geojsonData, {
        style: (feature) => {
            return {
                stroke: true,
                color: "silver",
                fillColor: "yellow",
                fillOpacity: 0.3
            }
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>Fußgängerzone ${feature.properties.ADRESSE}</strong>
            <hr>
            ${feature.properties.ZEITRAUM} <br>
            ${feature.properties.AUSN_TEXT}
            `);
        }
    }).addTo(overlays.pedAreas);
}


let drawAttractions = (geojsonData) => {
    L.geoJson(geojsonData, {
        onEachFeature: (feature, layer) => { //popup für jedes feature (in den data daten)
            layer.bindPopup(`<strong>${feature.properties.NAME}</strong>
            <hr>
            Adresse: ${feature.properties.ADRESSE}<br>
            Website: <a href="${feature.properties.WEITERE_INF}"> klick here </a>`)
        },
        pointToLayer: (geoJsonPoint, latlng) => { //icon selber definieren
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'icons/sehenswuerdigogd.png',
                    iconSeize: [25, 25]
                })
            })
        },
        attribution: '<a href="https://data.wien.gv.at"> Stadt Wien</a>'
    }).addTo(overlays.Attractions);
}


for (let config of OGDWIEN) {
    // console.log("Config: ", config.data);
    fetch(config.data)
        .then(response => response.json())
        .then(geojsonData => {
            // console.log("Data: ", geojsonData);
            if (config.title == "Haltestellen Vienna Sightseeing") {
                drawBusStop(geojsonData);
            } else if (config.title == "Liniennetz Vienna Sightseeing") {
                drawBusLine(geojsonData);
            } else if (config.title === "Fußgängerzonen") {
                drawPedestrianAreas(geojsonData);
            } else if (config.title === "Sehenswürdigkeiten") {
                drawAttractions(geojsonData);
            }
        })
}


// Leaflet hash
L.hash(map);

// minimap v1
//var miniMap = new L.Control.MiniMap(baselayers.minimapTest).addTo(map);

//minimap v2
//var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
//var osmAttrib='Map data &copy; OpenStreetMap contributors';
//var osm2 = new L.TileLayer(osmUrl, {minZoom: 0, maxZoom: 13, attribution: osmAttrib, position: 'bottomleft});
//var miniMap = new L.Control.MiniMap(osm2).addTo(map);

//minimap v3
var miniMap = new L.Control.MiniMap(
    L.tileLayer.provider("BasemapAT.basemap"), {
        toggleDisplay: true,
        position: 'bottomleft'
    }
).addTo(map);