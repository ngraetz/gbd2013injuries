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
    .nodeWidth(60)
    .nodePadding(0)
    .size([width, height]);

// Initialize path for sankey
var path = sankey.link();

/*
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
*/

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
  
// My functions (refer to Daniel's above to troubleshoot)
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

draw = function(url) {
d3.json(url, function(error, rdp) {

    var nodeMap = {};
    rdp.nodes.forEach(function(x) { nodeMap[x.name] = x; });
    rdp.links = rdp.links.map(function(x) {
      return {
        source: nodeMap[x.source],
        target: nodeMap[x.target],
        value: x.value
      };
    });
		// Link sankey object with data
		sankey
		  .nodes(rdp.nodes)
		  .links(rdp.links)
		  .layout(32);
/*		
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
		*/
		
// add in the links
  var link = svg.append("g").selectAll(".link")
      .data(rdp.links)
	  
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
      .data(rdp.nodes)
	  
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
		  .data(rdp.nodes, function(d) {return d.id})			
		
		nodeTitle.enter().append("text").call(nodeTextFunc);
		
		nodeTitle.exit().remove();
		
		svg.append("g").selectAll("text").transition().duration(500).call(nodeTextFunc);
		
	});
};

// Create axis titles
d3.select("svg").append("text")
  .text("E-Codes")
  .attr("x", function(d) { return margin.left + (sankey.nodeWidth()/2)})
  .attr("y", function(d) { return margin.top / 2; })
  .attr("text-anchor", "middle")
  .style("font-size", "24px" )
  
d3.select("svg").append("text")
  .text("N-Codes")
  .attr("x", function(d) { return width + margin.left - (sankey.nodeWidth()/2); })
  .attr("y", function(d) { return margin.top / 2; })
  .attr("text-anchor", "middle")
  .style("font-size", "24px" )