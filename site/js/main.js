const HOST_ADDRESS = 'http://localhost:1234';

var map;
var aircraftLayerGroup;
var xmlHttp;

const MIN_DATE = '2017-12-30';
const MAX_DATE = '2019-01-14';

// Local cache for re-rendering the coverage area.
let cache = [];

$(document).ready(() => {
    // Create new interactive map focusing on Tyrol
    map = L.map('map').setView([47.2692, 11.4041], 8);
    aircraftLayerGroup = L.layerGroup().addTo(map);
    L.simpleMapScreenshoter().addTo(map);

    // Tile buttons at bottom right corner of the map
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '<a id="resetOrientation" href="#">Reset</a> | Showing flights from <span id="minDateTile" style="font-weight: bold;"></span> to <span id="maxDateTile" style="font-weight: bold; padding-right: 10px;"></span>',
    }).addTo(map);
    $('#resetOrientation').click(() => {
        // Resets map position
        map.setView([47.2692, 11.4041], 8);
    });

    // Creates a ranged slider for better input of date period.
    noUiSlider.create($('#dualSlider')[0], {
        start: [new Date('2018-4-25').getTime() / 1000, new Date('2018-9-20').getTime() / 1000],
        connect: true,
        step: 86400,
        orientation: 'horizontal',
        tooltips: [true, true],
        animate: true,
        range: {
            'min': new Date('2017-12-30').getTime() / 1000,
            'max': new Date('2019-01-14').getTime() / 1000,
        },
        format: {
            to: (value) => {
                return formatDate(new Date(value * 1000))
            },
            from: (value) => {
                return value
            }
        }
    })

    // Inital render upon loading the site.
    renderCoverageArea()

    // Adds an event listener to the slider which
    $('#dualSlider')[0].noUiSlider.on('change', (value, handle) => {
        renderCoverageArea()
        let data = $('#dualSlider')[0].noUiSlider.get()
        $('#minDateTile').text(data[0])
        $('#maxDateTile').text(data[1])
    })      

    // Re-renders the coverage area from the local point cache.
    map.on('moveend', () => drawCoverageArea(cache));

    // Initial load
    $('.mode-toggle').toggle();
    $('#overDate').val('2018-11-20');
});

formatDate = (dateToFormat) => {
    let date = new Date(dateToFormat);
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');
};

/**
 * Calculates vertex points of a convex hull and
 * draws a respective polygon onto the map.
 * @param {FloatArray} points A set of Lat- and Lon-coordinates
 */
drawCoverageArea = (points) => {
    let boundaries = grahamScan(points);
    L.polygon(boundaries).addTo(aircraftLayerGroup);
};

/**
 * Renders the coverage area by requesting the respecting
 * from the database and determining the hull vertex.
 */
function renderCoverageArea() {
    const minDate = $('#dualSlider')[0].noUiSlider.get()[0];
    const maxDate = $('#dualSlider')[0].noUiSlider.get()[1];
    const bound1 = map.getBounds().getNorthWest();
    const bound2 = map.getBounds().getSouthEast();
    console.log('Moved to: ' + bound1 + ' and ' + bound2);
    if (xmlHttp) {
        xmlHttp.abort(); // abort last request
    }
    xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        let points = [];
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(xmlHttp.responseText);
            for (let i = 0; i < response.length; i++) {
                points.push([response[i].lat, response[i].lon]);
                cache.push([response[i].lat, response[i].lat]);
            }
            // Clear vector layers
            aircraftLayerGroup.clearLayers();
            drawCoverageArea(points);
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
