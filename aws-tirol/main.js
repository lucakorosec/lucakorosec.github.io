
let map = L.map ("map", {
    center: [47, 11],
    zoom: 9,
    layer: [
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    ]
})