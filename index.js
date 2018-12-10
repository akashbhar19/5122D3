var currentKey = 'count';

var width = 900,
	height = 600;

//SVG element using width and height
var svg = d3.select('#map')
	.append('svg')
	.attr('width', width)
	.attr('height', height);

var projection = d3.geo.mercator()
	.scale(1);

var zoom = d3.behavior.zoom()
	.scaleExtent([1, 10])
	.on('zoom', doZoom);
svg.call(zoom);

var path = d3.geo.path()
	.projection(projection);

var tooltip = d3.select("#map")
	.append("div")
	.attr("class", "tooltip hidden");


var dataById, countData = new Array(), tempArr = new Array(), results = new Array(), resultsCount = new Array();

var nameCounter = 0, lowest = Number.POSITIVE_INFINITY, highest = Number.NEGATIVE_INFINITY;

var quantize = d3.scale.quantize()
	.range(d3.range(12).map(function (i) { return 'q' + i + '-12'; }));

var mapFeatures = svg.append('g')
	.attr('class', 'features YlGnBu');

d3.json('data/traffic_data_CMPD.geojson', function (error, features) {
	var scaleCenter = calculateScaleCenter(features);

	projection.scale(scaleCenter.scale)
		.center(scaleCenter.center)
		.translate([width / 2, height / 2]);

	d3.csv('data/traffic_data_CMPD.csv', function (data) {
		dataById = d3.nest()
			.key(function (d) { return d.CMPD_Division; }).entries(data);
		//console.log(dataById);
		dataById.forEach(element => {
			element.values.forEach(obj => {
				tempArr.push(obj.Result_of_Stop);
			});
			for (i = 0; i < tempArr.length; i++) {
				if (results.includes(tempArr[i])) {
					resultsCount[results.indexOf(tempArr[i])]++;
				}
				else {
					results.push(tempArr[i]);
					resultsCount.push(1);
				}
			}
			tempArr = new Array();
			for (i = 0; i < results.length; i++) {
				tempArr.push({ result: results[i], count: resultsCount[i] });
			}
			countData.push({ id: element.key, count: element.values.length, results: tempArr });
			tempArr = new Array();
			results = new Array();
			resultsCount = new Array();
		});

		for (i = 0; i < countData.length; i++) {
			for (j = 0; j < countData[i].results.length; j++) {
				var temp = countData[i].results[j].count;
				if (temp < lowest) {
					lowest = temp;
				}
				if (temp > highest) {
					highest = temp;
				}
			}
		}

		quantize.domain([
			lowest, highest
		]);

		mapFeatures
			.selectAll('path')
			.data(features.features)
			.enter()
			.append('path')
			.attr('class', function (d) {
				//console.log(d.properties.dname, nameCounter);
				for (i = 0; i < countData.length; i++) {
					if (countData[i].id == getIdOfFeature(d)) {
						console.log(countData[i].results[1].count);
						return quantize(getValueOfData(countData[i]));
					}
				}
			})
			.attr('d', path)
			.on('mousemove', showTooltip)
			.on('mouseout', hideTooltip);;
	});
});

function getValueOfData(d) {
	return +d[currentKey];
}

function calculateScaleCenter(features) {
	// Get the bounding box of the paths (in pixels!) and calculate a
	// scale factor based on the size of the bounding box and the map
	// size.
	var bbox_path = path.bounds(features),
		scale = 0.95 / Math.max(
			(bbox_path[1][0] - bbox_path[0][0]) / width,
			(bbox_path[1][1] - bbox_path[0][1]) / height
		);

	// Get the bounding box of the features (in map units!) and use it
	// to calculate the center of the features.
	var bbox_feature = d3.geo.bounds(features),
		center = [
			(bbox_feature[1][0] + bbox_feature[0][0]) / 2,
			(bbox_feature[1][1] + bbox_feature[0][1]) / 2];

	return {
		'scale': scale,
		'center': center
	};
}

function doZoom() {
	mapFeatures.attr("transform",
		"translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")")
		// Keep the stroke width proportional. The initial stroke width
		// (0.5) must match the one set in the CSS.
		.style("stroke-width", 0.5 / d3.event.scale + "px");
}

function getIdOfFeature(f) {
	return f.properties.dname;
}

function showTooltip(f) {
	// Get the ID of the feature.
	var id = getIdOfFeature(f);
	var d = dataById[id];
	var mouse = d3.mouse(d3.select('#map').node()).map(
		function (d) { return parseInt(d); }
	);
	
	var left = Math.min(width - 4 * id.length, mouse[0] + 5);
	
	var top = mouse[1] + 25;
	console.log(id);
	// Use the ID to get the data entry.
	// Show the tooltip (unhide it) and set the name of the data entry.
	tooltip.classed('hidden', false)
    .attr("style", "left:" + left + "px; top:" + top + "px")
    .html(id);
}

function hideTooltip() {
	tooltip.classed('hidden', true);
  }