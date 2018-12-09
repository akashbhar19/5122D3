var currentKey = 'CMPD_Divison';

var width = 900,
	height = 600;

//SVG element using width and height
var svg = d3.select('#map')
	.append('svg')
	.attr('width', width)
	.attr('height', height);

var projection = d3.geo.mercator()
	.scale(40000)
	.center([-80.8040009, 35.26374625])
	.translate([width/2, height/2]);

var path = d3.geo.path()
	.projection(projection);

d3.json('data/traffic_data_CMPD.geojson', function(error, features) {
	svg.append('g')
		.attr('class', 'features')
		.selectAll('path')
		.data(features.features)
		.enter()
		.append('path')
		.attr('d', path);
});