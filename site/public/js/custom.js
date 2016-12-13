// var x = d3.scaleTime()
//     .domain([
//       new Date(Date.parse('2014-01-01')),
//       new Date(Date.parse('2014-04-01'))
//     ])
//     .range([0, 300]);

// var xAxis = d3.axisBottom(x).ticks(4);

// var svg = d3.select('.container')
// 	.append('svg')
// 	.attr('width', 300)
// 	.attr('height', 150);

// // svg.append('g')
// // 	.attr('class', 'x axis')
// // 	.call(xAxis);


// var sales = [
//   { product: 'Hoodie',  count: 7 },
//   { product: 'Jacket',  count: 6 },
//   { product: 'Snuggie', count: 9 },
// ];

// var rects = svg.selectAll('rect')
// 	.data(sales);

// console.log("rects.size() ---> " + rects.size());

// var newRects = rects.enter();

// console.log('typeof(newRects)  ---> ' + typeof(newRects));

// // scales are functions that map from data space to screen space
// var maxCount = d3.max(sales, (d,i) => d.count);
// var x = d3.scaleLinear()
// 	.range([0,300])
// 	.domain([0, maxCount]);

// var y = d3.scaleBand()
// 	.rangeRound([0,75])
// 	.domain(sales.map((d,i)=>d.product));

// newRects.append('rect')
// 	.attr('x', x(0))
// 	.attr('y', (d,i)=>y(d.product))
// 	.attr('height', y.bandwidth)
// 	.attr('width', (d,i)=>x(d.count));

// console.log('y bandwidth ==> ' + y.bandwidth);

function getColor(d) {
    return d > 1000 ? '#800026' :
           d > 500  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.density),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

var geojson, map;

function resetHighlight(e) {
	geojson.resetStyle(e.target);
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
	});

	var center = layer.getBounds().getCenter();
    var label = L.marker(center, {
      icon: L.divIcon({
        iconSize: null,
        className: 'label',
        html: '<div>' + feature.properties.Name + '</div>'
      })
    }).addTo(map);
}


/*
 * bubble chart
 */

 // it'd be nice to have a toggle menu here where
 // I can change what column to use from csv
 // and there would be transition when I change it

 // x-axis = 
 // y-axis = 

 var diameter = 500,
 	 color    = d3.scale.category20b(); 

 var bubble = d3.layout.pack()
 		.sort(null)
 		.size([diameter, diameter])
 		.padding(1.5);

 var svg = d3.select("#chart-canvas")
 	.append("svg")
 	.attr("width", diameter)
 	.attr("height", diameter)
 	.attr("class", "bubble");

 var column = "povertyPct";

 d3.csv('/csv/averages_2015.csv', (data) => {
	
	data = data.map((d) => {
		d.value = d[column];
		return d;
	});

	var nodes = bubble
		.nodes({children:data})
		.filter((d) => !d.children);

	var bubbles = svg.append("g")
		.attr("transform", "translate(0,0)")
		.selectAll(".bubble")
		.data(nodes)
		.enter();

	bubbles.append("circle")
		.attr("r", (d) => d.r)
		.attr("cx", (d) => d.x)
		.attr("cy", (d) => d.y)
		.style("fill", (d) => color(d.value));

	bubbles.append("text")
		.attr("x", (d) => d.x)
		.attr("y", (d) => d.y + 5)
		.attr("text-anchor", "middle")
		.text((d) => d["Neighborhood"])
		.style({
			"fill":"white",
			"font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
			"font-size": "12px"
		});
});



	/**/

$(document).ready(() => {

	$.getJSON('/neighborhoods.json', (data) => {

		map = L.map('leaflet-map', {
			scrollWheelZoom: false,
			zoomControl: false,
			maxZoom: 18,
		}).setView([42.317, -71.09], 11.5);
		
		L.tileLayer('https://api.mapbox.com/styles/v1/syps/ciwf776k3003t2plk320qq8if/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic3lwcyIsImEiOiJjaXdmNzIxeW8wODJ5Mm9vYnR4czY3bzYxIn0.UaUvDxbvMdYqrSuuTBjJ4g', {
			id: 'mapbox.light',
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
		}).addTo(map);

		geojson = L.geoJson(data, {
			style: style,
			onEachFeature: onEachFeature
		}).addTo(map);

	});

	

});


