var map;
var aircraftLayerGroup;
var xmlHttp;

$(document).ready(() => {
    // Create new interactive map focusing on Tyrol
    map = L.map('map').setView([47.2692, 11.4041], 8);
    aircraftLayerGroup = L.layerGroup().addTo(map);
    // L.circle([47.2692, 11.4041], { radius: 5000 }).addTo(map); // Test

    // Tile buttons at bottom right corner of the map
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '<a id="resetOrientation" href="#">Reset</a> | Showing flights from <span id="dateTile"></span>',
    }).addTo(map);
    $('#resetOrientation').click(() => {
        // Resets map position
        map.setView([47.2692, 11.4041], 8);
    });

    map.on("moveend", () => updateMapElements());
    $('#datePicker').change(() => updateDate());

    // Initial load
    updateDate();
});

/**
 * Run when the date in the date picker updates
 */
function updateDate() {
    var date = new Date($('#datePicker').val());
    $('#dateTile').text([date.getDate(), date.getMonth() + 1, date.getFullYear()].join('/'));
    updateMapElements();
}

/**
 * Updates visible elements on the map (i. e. aircraft)
 */
function updateMapElements() {
    // Clear vector layers
    aircraftLayerGroup.clearLayers();

    const date = $('#datePicker')[0].value;
    const bound1 = map.getBounds().getNorthWest();
    const bound2 = map.getBounds().getSouthEast();
    console.log("Moved to: " + bound1 + " and " + bound2);
    if (xmlHttp) {
        xmlHttp.abort(); // abort last request
    }
    xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(xmlHttp.responseText);
            for (let i = 0; i < response.length; i++) {
                // TODO: Fix this
                L.circle([response[i].lat, response[i].lon], {radius: 50}).addTo(aircraftLayerGroup);
            }
            console.log(response);
        }
    };
    xmlHttp.open('GET', `http://localhost:1234/data/{"lat1": ${bound1.lat}, "lon1": ${bound1.lng}, "lat2": ${bound2.lat}, "lon2": ${bound2.lng}}/${date}`);
    xmlHttp.send();
}
