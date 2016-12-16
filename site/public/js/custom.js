var currentSelect = 'povertyPct';

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
        fillColor: getColor(feature.properties[currentSelect] || 0),
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
        color: '#fff',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

var geojson, map, info;

function resetHighlight(e) {
	geojson.resetStyle(e.target);
	info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
	layer.bindPopup(feature.properties.value)
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

var getNeighborhoodInfoElement = (props) => {
	var header = '<h4>Neighborhood Stats</h4>';
	return props ?
		props.pop ?
		`${header} 												\
		<b>${props.Name}</b>									\
		</br />													\
		<p>Families in Poverty: ${props.povertyPct}%</p>			\
        <p>Unemployment: ${props.unemploymentPct}%</p>				\
        <p>Violent Crimes / 1000 People: ${props.vCrime1000}</p> \
        <p>Shootings: ${props.shootings}</p>					\
		`
		: `${header} 											\
		  <b>${props.Name}</b>`									
		: 'Hover over a neighborhood';
};


 /*
 * scatter plot
 */

 var scatterDomain = 'povertyPct',
 	scatterRange = 'violentCrimesPerThousandPpl',
 	cLabel = 'Neighborhood',
 	scatterDiv = '#scatter-canvas1';

 var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

 var xValue = ((d) => d[scatterDomain]),
 	xScale = d3.scale.linear().range([0, width]),
 	xMap = ((d) => xScale(xValue(d))),
 	xAxis = d3.svg.axis().scale(xScale).orient("bottom");


 var yValue = ((d) => d[scatterRange]),
 	yScale = d3.scale.linear().range([height, 0]),
 	yMap = ((d) => yScale(yValue(d))),
 	yAxis = d3.svg.axis().scale(yScale).orient("left");

 var cValue = ((d) => d[scatterDomain]),
 	color = d3.scale.linear().range(['#f99f3e', '#db510d']).domain([0,10]);

 var scatterSVG = d3.select(scatterDiv).append("svg")
 		.attr("width", width + margin.left + margin.right)
 		.attr("height", height + margin.top + margin.bottom)
 		.append("g")
 		.attr("transform", `translate(${margin.left}, ${margin.right})`);

 var tooltip = d3.select(scatterDiv).append("div")
 	.attr("class", "tooltip")
 	.style("opacity", 1);

 var formattedValues = (d) => {
 	return `(${xValue(d)}, ${yValue(d)})`;
 };

 /*
  * bar chart
  */

  var barDomain = 'Neighborhood',
  	barRange = 'shootings';

  var barSVG = d3.select("#bar-canvas1").append("svg")
  	.attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 120)
  	.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  var barX = d3.scale.ordinal().rangeRoundBands([0, width], 0.5),
  	barY = d3.scale.linear().range([height, 0]);

  var barXAxis = d3.svg.axis()
  	.scale(barX)
  	.orient("bottom")
  	.ticks(0); // what are the available formats?

  var barYAxis = d3.svg.axis()
  	.scale(barY)
  	.orient("left")
  	.ticks(12);






 d3.csv('/csv/averages_2015.csv', (er, data) => {
	
	data.forEach((d) => {
		d[scatterDomain] = +d[scatterDomain];
		d[scatterRange] = +d[scatterRange];

		d[barDomain] = d[barDomain];
		d[barRange] = +d[barRange];
	});

	data = data.filter((d) => d['Neighborhood'] !== 'West End');
	
	// prevent overlap with axis
	xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
	yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

	scatterSVG.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${height})`)
	.call(xAxis)
	.append("text")
	.attr("class", "label")
	.attr("x", width)
	.attr("y", -6)
	.style("text-anchor", "end")
	.text("Pct Families in Poverty"); // abstract

	  scatterSVG.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Violent Crime Per Capita");

      scatterSVG.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 6)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", (d) => color(cValue(d)))
      .on("mouseover", (d) => {
      	tooltip.transition()
      		.duration(200)
      		.style("opacity", .9);
      	tooltip.html(`${d[cLabel]}<br/>${formattedValues(d)}`)
      		.style("left", (d3.event.pageX + 5) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", (d) => {
      	tooltip.transition()
      		.duration(500)
      		.style("opacity", 0);
      });

      data = data.filter((d) => d[barRange] > 0);
      // bar chart
      barX.domain(data.map((d) => d[barDomain]));
      barY.domain([0, d3.max(data, (d) => d[barRange])]);

      barSVG.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${height})`)
      .call(barXAxis)
    	.selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.5em")
      .attr("transform", "rotate(-55)");

      barSVG.append("g")
      .attr("class", "y axis")
      .call(barYAxis)
    	.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Shootings in 2015");

      barSVG.selectAll("bar")
      	.data(data)
      	.enter().append("rect")
      	.attr("class", "bar")
      	.attr("x", (d) => barX(d[barDomain]))
      	.attr("width", barX.rangeBand())
      	.attr("y", (d) => barY(d[barRange]))
      	.attr("height", (d, i) => height - barY(d[barRange]));

});

// calendar charts

d3.csv('/csv/neighborhood_crime_cmp.csv', (er, data) => {

	var dataSets = {
		'Brighton': [],
		'Fenway': [],
		'Roxbury': []
	};


	data.forEach((d) => {
		var n = dataSets[d['Neighborhood']];
		var obj = {};
		var _date = d['date_str'];
		
		var month = (_date.substring(0,2))-1;
		var day = +_date.substring(3,5);
		var year = 2015;

		obj['date'] = new Date(year, month, day);
		obj['count'] = d['violent'];
		console.log(obj['count']);
		n.push(obj);
	});

	console.log(dataSets['Brighton']);

	var chart1 = calendarHeatmap()
	              .data(dataSets['Brighton'])
	              .selector('#cal2')
	              // .colorRange(['#D8E6E7', '#218380'])
	              .tooltipEnabled(true)
	              .legendEnabled(false)
	              .onClick(function (d) {
	                console.log('onClick callback. Data:', d);
	              });
	chart1();  // render the chart

	var chart2 = calendarHeatmap()
	              .data(dataSets['Fenway'])
	              .selector('#cal1')
	              .tooltipEnabled(true)
	              // .legendEnabled(false)
	              .onClick(function (d) {
	                console.log('onClick callback. Data:', d);
	              });
	chart2();  // render the chart

	var chart3 = calendarHeatmap()
	              .data(dataSets['Roxbury'])
	              .selector('#cal3')
	              .tooltipEnabled(true)
	              .legendEnabled(false)
	              .onClick(function (d) {
	                console.log('onClick callback. Data:', d);
	              });
	chart3();  // render the chart






});


	/**/
var jsonData;

 var initGeojson = (current) => {
 	geojson = L.choropleth(jsonData, {
			valueProperty:current,
			scale: ['white', 'red'],
			steps: 10,
			mode: 'q',
			style: {
				color: '#fff',
				weight: 2,
				fillOpacity: 0.8
			},
			// style: style,
			onEachFeature: onEachFeature
		}).addTo(map);
 };

 var selectMap = {
 	'Unemployment (%)': 'unemploymentPct',
 	'Families in Poverty (%)': 'povertyPct',
 	'Violent Crimes Per Thousand People': 'vCrime1000',
 	'Shootings': 'shootings'
 };

 var setCholorpleth = (val) => {
 	console.log(`change val = ${val}`);
 	map.removeLayer(geojson);
 	initGeojson(selectMap[val]);
 };

$(document).ready(() => {

	$.getJSON('/neighborhoods.json', (data) => {

		jsonData = data;

		map = L.map('leaflet-map', {
			scrollWheelZoom: false,
			zoomControl: false,
			maxZoom: 18,
		}).setView([42.317, -70.87], 11.5); //11.5

		map.doubleClickZoom.disable();
		
		L.tileLayer('https://api.mapbox.com/styles/v1/syps/ciwf776k3003t2plk320qq8if/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic3lwcyIsImEiOiJjaXdmNzIxeW8wODJ5Mm9vYnR4czY3bzYxIn0.UaUvDxbvMdYqrSuuTBjJ4g', {
			id: 'mapbox.light',
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
		}).addTo(map);

		initGeojson(currentSelect);


		info = L.control();

		info.onAdd = function (map) {
		    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		    this.update();
		    return this._div;
		};

		// method that we will use to update the control based on feature properties passed
		info.update = function(props) {
		    this._div.innerHTML = getNeighborhoodInfoElement(props);
		};

		info.addTo(map);

	}).error((e) => console.log(e));


	$("#choropleth-select").change(function() {
		setCholorpleth($(this).val());
	});

});


