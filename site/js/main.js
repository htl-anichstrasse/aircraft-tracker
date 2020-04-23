const HOST_ADDRESS = "http://localhost:1234";

var map;
var aircraftLayerGroup;
var xmlHttp;

$(document).ready(() => {
    // Create new interactive map focusing on Tyrol
    map = L.map('map').setView([47.2692, 11.4041], 8);
    aircraftLayerGroup = L.layerGroup().addTo(map);

    // Tile buttons at bottom right corner of the map
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '<a id="resetOrientation" href="#">Reset</a> | Showing flights from <span id="dateTile" style="font-weight: bold; padding-right: 10px;"></span>',
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
    if (date instanceof Date && !isNaN(date)) {
        $('#dateTile').text([date.getDate(), date.getMonth() + 1, date.getFullYear()].join('/'));
        updateMapElements();
    } else {
        $('#datePicker').val('2019-01-14');
        alert('Please enter a valid date!');
    }
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
        let points = []
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(xmlHttp.responseText);
            for (let i = 0; i < response.length; i++) {
                points.push([response[i].lat, response[i].lon])
            }
            let boundaries = grahamScan(points)
            var polygon = L.polygon(boundaries).addTo(aircraftLayerGroup)
            console.log(response);
        }
    };
    xmlHttp.onerror = function () {
        alert(`Error: Cannot connect to server!`);
    };
    xmlHttp.open('GET', `${HOST_ADDRESS}/data/{"lat1": ${bound1.lat}, "lon1": ${bound1.lng}, "lat2": ${bound2.lat}, "lon2": ${bound2.lng}}/${date}`);
    xmlHttp.send();
}

function formatTimestamp(unixTimestamp) {
    let date = new Date(unixTimestamp * 1000); // convert to milliseconds
    let hours = date.getHours();
    let minutes = '0' + date.getMinutes();
    let seconds = '0' + date.getSeconds();
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
}