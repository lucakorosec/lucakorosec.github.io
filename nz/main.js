
console.log(L);

const map = L.map("map", {
    center: [-43.5, 170.22],
    zoom: 13,
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{z}.png")
    ]
});

console.log(document.querySelector("#map")); /* raute map sucht mir das element mit der ID = Map)*/
