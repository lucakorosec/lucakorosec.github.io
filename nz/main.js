
console.log(L);

const map = L.map("map", {
    center: [-43.4668631325, 170.188249247],
    zoom: 13,
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{z}.png")
    ]
});

let mrk = L.marker([-43.4668631325, 170.188249247]).addTo(map);

console.log(document.querySelector("#map")); /* raute map sucht mir das element mit der ID = Map)*/
