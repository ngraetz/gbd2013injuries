var units = "YLDs";

var margin = {top: 200, right: 350, bottom: 10, left: 350},
    width = 1500 - margin.left - margin.right,
    height = 2200 - margin.top - margin.bottom;

var formatNumber = d3.format(",.0f"),    // zero decimal places
    format = function(d) { return formatNumber(d) + " " + units; },
    color = d3.scale.category20();

// append the svg canvas to the page
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(60)
    .nodePadding(0)
    .size([width, height]);

var path = sankey.link();

// Draw axis labels
drawAxisLabels = function() {
	// title
	title = d3.select('svg').append('text').text('Injury YLDs').attr("x", (width+margin.left+margin.right)/2).attr("y", margin.top/2).attr("font-size", 75).attr("text-anchor", "middle")
	
	ecodetitle = d3.select('svg').append('text').text('E-Codes').attr("x", margin.left).attr("y", margin.top-40).attr("text-anchor", "start").attr("font-size", 40)
	ecodetitle = d3.select('svg').append('text').text('(The "event" resulting in injury)').attr("x", margin.left).attr("y", margin.top-15).attr("text-anchor", "start").attr("font-size", 15)
	
	ncodetitle = d3.select('svg').append('text').text('N-Codes').attr("x", width + margin.left).attr("y", margin.top-40).attr("text-anchor", "end").attr("font-size", 40)
	ncode_explanation = d3.select('svg').append('text').text('(The "nature" of the injury)').attr("x", width + margin.left).attr("y", margin.top-15).attr("text-anchor", "end").attr("font-size", 15)
}

drawAxisLabels()

// ***********************************************************************
// DEFINE ALL FUNCTIONS BELOW
// ***********************************************************************

 // FUNCTION TO HIGHLIGHT ALL LINKS CONNECTED TO A NODE
   function highlight_link(id,opacity){
      d3.select("#link-"+id).style("stroke-opacity", opacity);
  }
  
  function highlight_node_links(node,i){

    var remainingNodes=[],
        nextNodes=[];

    var stroke_opacity = 0.03;
    if( d3.select(this).attr("data-clicked") == "1" ){
      d3.select(this).attr("data-clicked","0");
      stroke_opacity = 0.03;
    }else{
      d3.select(this).attr("data-clicked","1");
      stroke_opacity = 0.5;
    }
	console.log("test", i, node)
    var traverse = [{
                      linkType : "sourceLinks",
                      nodeType : "target"
                    },{
                      linkType : "targetLinks",
                      nodeType : "source"
                    }];

    traverse.forEach(function(step){
      node[step.linkType].forEach(function(link) {
        remainingNodes.push(link[step.nodeType]);
        highlight_link(link.id, stroke_opacity);
      });

      while (remainingNodes.length) {
        nextNodes = [];
        remainingNodes.forEach(function(node) {
          node[step.linkType].forEach(function(link) {
            nextNodes.push(link[step.nodeType]);
            highlight_link(link.id, stroke_opacity);
          });
        });
        remainingNodes = nextNodes;
      }
    });
  }
  /*
  function dragmove(d) {
    d3.select(this).attr("transform", 
        "translate(" + d.x + "," + (
                d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
            ) + ")");
    sankey.relayout();
    link.attr("d", path);
  }
  */
 var linkFunc = function(link) {
	link
	  .attr("class", function(d) { return "link group"+d.color_class; })
	  .attr("id", function(d,i){
        d.id = i;
        return "link-"+i;
		})
	  .attr("d", path)
	  .attr("title", function(d) { return d.source.name + " ? " + d.target.name + "<br/>" + format(d.value) + "<br/>" + d.pkg_pct + "% of package<br/>" + d.c_pct + "% of cause"; })
	  .style("stroke-width", function(d) { return Math.max(1, d.dy); })
	  .sort(function(a, b) { return b.dy - a.dy; });
}

var nodeRectFunc = function(node) {
	/*
	node
	  .attr("height", function(d) { return d.dy; })
	  .attr("width", sankey.nodeWidth())
	  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
	  .attr("class", function(d) { return "node group"+d.color_class; })
	  .attr("id", function(d) {return d.id})
	 */
	node.attr("class", "node")
    .attr("transform", function(d) { 
		  return "translate(" + d.x + "," + d.y + ")"; })
		/*  
     .call(d3.behavior.drag()
		.origin(function(d) { return d; })
		.on("dragstart", function() { 
		  this.parentNode.appendChild(this); })
		.on("drag", dragmove))
		*/	
	.on("click", highlight_node_links)	
    .attr("height", function(d) { return d.dy; })
    .attr("width", sankey.nodeWidth())
    .style("fill", function(d) { 
		  return d.color = color(d.name.replace(/ .*/, "")); })
    .style("stroke", function(d) { 
		  return d3.rgb(d.color).darker(2); })
    .append("title")
    .text(function(d) { 
		  return d.name + "\n" + format(d.value); }) 
		  
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


// load the data (using the timelyportfolio csv method)
draw = function(url) {
d3.csv(url, function(error, data) {

  //set up graph in same style as original example but empty
  graph = {"nodes" : [], "links" : []};

    data.forEach(function (d) {
      graph.nodes.push({ "name": d.source });
      graph.nodes.push({ "name": d.target });
      graph.links.push({ "source": d.source,
                         "target": d.target,
                         "value": +d.value });
     });

     // return only the distinct / unique nodes
     graph.nodes = d3.keys(d3.nest()
       .key(function (d) { return d.name; })
       .map(graph.nodes));

     // loop through each link replacing the text with its index from node
     graph.links.forEach(function (d, i) {
       graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
       graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
     });

     //now loop through each nodes to make nodes an array of objects
     // rather than an array of strings
     graph.nodes.forEach(function (d, i) {
       graph.nodes[i] = { "name": d };
     });

  sankey
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(32);

// add in the links
  var link = svg.append("g").selectAll(".link")
      .data(graph.links)
	  
	link.enter().append("path").call(linkFunc)
	
	link.exit().remove(); 
		
	svg.append("g").selectAll(".link").transition().duration(500).call(linkFunc);  
	  
// add the link titles
  link.append("title")
        .text(function(d) {
    		return d.source.name + " : " + 
                d.target.name + "\n" + format(d.value); });

// add in the nodes
  var nodeRects = svg.append("g").selectAll(".node")
      .data(graph.nodes)
	  
	nodeRects.enter().append("rect").call(nodeRectFunc) 
		
	nodeRects.exit().remove();  	
		
	svg.append("g").selectAll(".node").transition().duration(500).call(nodeRectFunc);	  
		  
// add in the title for the nodes
  nodeRects.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x > width / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");


// Build node titles
		var nodeTitle = svg.append("g").selectAll("text")
		  .data(graph.nodes, function(d) {return d.id})			
		
		nodeTitle.enter().append("text").call(nodeTextFunc);
		
		nodeTitle.exit().remove();
		
		svg.append("g").selectAll("text").transition().duration(500).call(nodeTextFunc);



	
});
};