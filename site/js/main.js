const HOST_ADDRESS = "http://localhost:1234";

var map;
var aircraftLayerGroup;
var xmlHttp;

let cache = []

$(document).ready(() => {
    // Create new interactive map focusing on Tyrol
    map = L.map('map').setView([47.2692, 11.4041], 8);
    aircraftLayerGroup = L.layerGroup().addTo(map);

    // Tile buttons at bottom right corner of the map
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '<a id="resetOrientation" href="#">Reset</a> | Showing flights from <span id="minDateTile" style="font-weight: bold;"></span> to <span id="maxDateTile" style="font-weight: bold; padding-right: 10px;"></span>',
    }).addTo(map);
    $('#resetOrientation').click(() => {
        // Resets map position
        map.setView([47.2692, 11.4041], 8);
    });

    $('#minDate').change(() => { 
        updateDates()
        renderCoverageArea()
    });
    $('#maxDate').change(() => { 
        updateDates()
        renderCoverageArea()
    });
    map.on('moveend', () => drawCoverageArea(cache))

    // Initial load
    updateDates();

    // Exports the current state of the map as PNG.
    $('exportAsPNG').click(() => {
        
    })
});

/**
 * Run when the dates in the date input forms update.
 */
updateDates = () => {
    var minDate = new Date($('#minDate').val());
    var maxDate = new Date($('#maxDate').val());
    
    if (((minDate instanceof Date && !isNaN(minDate)) && maxDate instanceof Date && !isNaN(maxDate)) && ($('#minDate').val() < $('#maxDate'))) {
        $('#minDateTile').text([minDate.getDate(), minDate.getMonth() + 1, minDate.getFullYear()].join('/'));
        $('#maxDateTile').text([maxDate.getDate(), maxDate.getMonth() + 1, maxDate.getFullYear()].join('/'));
        renderCoverageArea();
    } else {
        $('#minDate').val('2018-11-14');
        $('#maxDate').val('2018-12-14');
        alert('Please enter a valid time period!');
    }
}

/**
 * Calculates vertex points of a convex hull and
 * draws a respective polygon onto the map.
 * @param {FloatArray} points A set of Lat- and Lon-coordinates
 */
drawCoverageArea = (points) => {
    let boundaries = grahamScan(points)
    L.polygon(boundaries).addTo(aircraftLayerGroup)
}

/**
 * Renders the coverage area.
 */
function renderCoverageArea() {
    // Clear vector layers
    aircraftLayerGroup.clearLayers();

    const minDate = $('#minDate')[0].value;
    const maxDate = $('#maxDate')[0].value;
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
                cache.push([response[i].lat, response[i].lat])
            }
            drawCoverageArea(points)
            console.log(response);
        }
    };
    xmlHttp.onerror = () => {
        alert(`Error: Cannot connect to server!`);
    };
    xmlHttp.open('GET', `${HOST_ADDRESS}/data/{"lat1": ${bound1.lat}, "lon1": ${bound1.lng}, "lat2": ${bound2.lat}, "lon2": ${bound2.lng}}/${minDate}/${maxDate}`);
    xmlHttp.send();
}

function formatTimestamp(unixTimestamp) {
    let date = new Date(unixTimestamp * 1000); // convert to milliseconds
    let hours = date.getHours();
    let minutes = '0' + date.getMinutes();
    let seconds = '0' + date.getSeconds();
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
}

