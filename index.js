var currentKey = 'CMPD_Divison';

var width = 900,
	height = 600;

//SVG element using width and height
var svg = d3.select('#map')
	.append('svg')
	.attr('width', width)
	.attr('height', height);

var projection = d3.geo.mercator()
	.scale(1);

var path = d3.geo.path()
	.projection(projection);

var dataById, countData = new Array();

var quantize = d3.scale.quantize()
    .domain([0, 100])
    .range(d3.range(9).map(function(i) { return 'q' + i + '-9'; }));

d3.json('data/traffic_data_CMPD.geojson', function(error, features) {
	var scaleCenter = calculateScaleCenter(features);

	projection.scale(scaleCenter.scale)
		.center(scaleCenter.center)
		.translate([width/2, height/2]);

	d3.csv('data/traffic_data_CMPD.csv', function(data) {
		dataById = d3.nest()
	  .key(function(d) { return d.CMPD_Division; }).entries(data);
	  console.log(dataById);
	  dataById.forEach(element => {
		  countData.push([element.key, element.values.length]);
	  });
	  console.log(countData);
	});
	
	console.log(countData);

	svg.append('g')
		.attr('class', 'features')
		.selectAll('path')
		.data(features.features)
		.enter()
		.append('path')
		.attr('class', function(d){
			console.log(d.properties.dname);
			//return quantize(dataById[d.properties.dname]);
		})
		.attr('d', path);
});

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