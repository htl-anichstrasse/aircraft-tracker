/**
 * Creates a new interactive world map.
 */
var map = L.map('map').setView([47.2692, 11.4041], 8);

/**
 * Creates tiles at the bottom right of the map.
 * These offer a reset button and display the selected date.
 */
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '<a id="resetOrientation" href="#">Reset</a> | Showing flights from <span id="dateTile"></span>',
}).addTo(map);

/**
 * Changes the tiles' text to the currently selected date.
 */
$('#datePicker').change(() => {
    var date = new Date($('#datePicker').val());
    $('#dateTile').text([date.getDate(), date.getMonth() + 1, date.getFullYear()].join('/'))
})

/**
 * Resets the orientation of the map to it's original position 
 * upon clicking the 'Reset' anchor in the tile section.
 */
$('#resetOrientation').click(() => {
    map.panTo([47.2692, 11.4041])
})

var xmlHttp;

map.on("moveend", () => {
    const date = document.getElementById('day').value;
    const bound1 = map.getBounds().getNorthWest();
    const bound2 = map.getBounds().getSouthEast();
    console.log("Moved to: " + bound1 + " and " + bound2);
    if (xmlHttp) {
        xmlHttp.abort(); // abort last request
    }
    xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(xmlHttp.responseText);
            for (let i = 0; i < response.length; i++) {
                // TODO: Fix this
                // L.circle(response[i].lat, response[i].lon, {radius: 50}).addTo(map);
            }
            console.log(response);
        }
    };
    xmlHttp.open('GET', `http://localhost:1234/data/{"lat1": ${bound1.lat}, "lon1": ${bound1.lng}, "lat2": ${bound2.lat}, "lon2": ${bound2.lng}}/${date}`);
    xmlHttp.send();
});