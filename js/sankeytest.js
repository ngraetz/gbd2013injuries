var svgWIDTH = 1500;
var svgHEIGHT = 800;

var margin = {top: 50, right: 350, bottom: 6, left: 350},
    width = svgWIDTH - margin.left - margin.right,
    height = svgHEIGHT - margin.top - margin.bottom;

var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " deaths"; },
    color = d3.scale.category20();

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Build g element for links between nodes
var linkG = svg.append("g");

// Build g element for nodes
var nodeGRects = svg.append("g");
var nodeGTitle = svg.append("g");

// Initialize sankey
var sankey = d3.sankey()
	.nodeWidth(25)
	.nodePadding(10)
	.size([width, height]);

// Initialize path for sankey
var path = sankey.link();

// Define funcitons
var linkFunc = function(link) {
	link
	  .attr("class", function(d) { return "link group"+d.color_class; })
	  .attr("d", path)
	  .attr("title", function(d) { return d.source.name + " ? " + d.target.name + "<br/>" + format(d.value) + "<br/>" + d.pkg_pct + "% of package<br/>" + d.c_pct + "% of cause"; })
	  .style("stroke-width", function(d) { return Math.max(1, d.dy); })
	  .sort(function(a, b) { return b.dy - a.dy; });
}

var nodeRectFunc = function(node) {
	node
	  .attr("height", function(d) { return d.dy; })
	  .attr("width", sankey.nodeWidth())
	  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
	  .attr("class", function(d) { return "node group"+d.color_class; })
	  .attr("id", function(d) {return d.id})
};

var nodeTextFunc = function(node) {
	node
	  .attr("x", function(d) { return d.x + -6; })
	  .attr("y", function(d) { return d.y + (d.dy / 2); })
	  .attr("dy", ".35em")
	  .attr("text-anchor", "end")
	  .attr("transform", null)
	  .text(function(d) { return d.name; })
	.filter(function(d) { return d.x > width / 2; })
	  .attr("x", function(d) {return 6 + sankey.nodeWidth() + d.x})
	  .attr("text-anchor", "start");
};

draw = function(url) {
	d3.json(url, function(error, rdp) {	
	
		// Link sankey object with data
		sankey
		  .nodes(rdp.nodes)
		  .links(rdp.links)
		  .layout(32);
		
		// Build links between nodes (on linkG element)
		var link = linkG.selectAll(".link")
		  .data(rdp.links, function(d) {return d.id})  
		
		link.enter().append("path").call(linkFunc)  
		
		link.exit().remove();
		
		linkG.selectAll(".link").transition().duration(500).call(linkFunc);
		
		// $('.link').poshytip({
			// className: 'tip-twitter',
			// followCursor: true,
			// slide: false
		// });

		// Build node bars
		var nodeRects = nodeGRects.selectAll(".node")
		  .data(rdp.nodes, function(d) {return d.id})
		  
		nodeRects.enter().append("rect").call(nodeRectFunc)
		
		nodeRects.exit().remove();
		
		nodeGRects.selectAll(".node").transition().duration(500).call(nodeRectFunc);

		// Build node titles
		var nodeTitle = nodeGTitle.selectAll("text")
		  .data(rdp.nodes, function(d) {return d.id})
		
		nodeTitle.enter().append("text").call(nodeTextFunc);

		nodeTitle.exit().remove();	
		
		nodeGTitle.selectAll("text").transition().duration(500).call(nodeTextFunc);
	});
};

// Create axis titles
d3.select("svg").append("text")
  .text("Garbage")
  .attr("x", function(d) { return margin.left + (sankey.nodeWidth()/2)})
  .attr("y", function(d) { return margin.top / 2; })
  .attr("text-anchor", "middle")
  .style("font-size", "24px" )
  
d3.select("svg").append("text")
  .text("Targets")
  .attr("x", function(d) { return width + margin.left - (sankey.nodeWidth()/2); })
  .attr("y", function(d) { return margin.top / 2; })
  .attr("text-anchor", "middle")
  .style("font-size", "24px" )