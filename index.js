function draw(geo_data) {
	"use strict";
	var width = 750,
		height = 600,
		scale = 6500,
		translateX = -240,
		translateY = 7260;
  
	var projection = d3.geo.mercator()
		.scale(scale)
		.translate( [translateX, translateY]);
  
	var path = d3.geo.path().projection(projection);
  
	var svg = d3.select("#chart")
		.append("svg")
		  .attr("width", width)
		  .attr("height", height)
		  .attr("class", "map");
  
	var map = svg.selectAll("path")
		.data(geo_data.features)
		.enter()
		.append("path")
		  .attr("d", path)
		  .style("fill", "lightBlue")
		  .style("stroke", "black")
		  .style("stroke-width", 0.5);
  };