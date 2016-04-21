!(function (d3) {

$("bcontent").empty();


  var width = 750;
  var height = 580;
  d3.json("USAMap.json",function(error,result)
  {
      data = result.features;    
      render(data);
  });
  function render(data)
  {
    var colorScale = d3.scale.category10();
    var svg = d3.select("body")
             .append("svg")
             .attr("height",750)
             .attr("width",750);
    var map = svg.append("g");
    var mapProjection = d3.geo.albers()
                        .scale( 1050 )
                        .rotate( [105.00,0] )
                        .center( [8.00, 40.0] )
                        .translate( [width/2,height/2] );
    var geoPath = d3.geo.path()
                    .projection(mapProjection);
    map.selectAll("path")
       .data(data)
       .enter()
       .append("path")
       .attr("fill",function(d)
       {
          return colorScale(d.properties.GEO_ID);
       })
       .attr("stroke", "#fff")
       .on("mouseenter",function(d,i){
            //highLight(d.name);
            d3.select("#toolTip").style({
              visibility:"visible",
              top: d3.event.clientY+"px",
              left:d3.event.clientX+"px",
              opacity:1
            })
            .text(d.properties.NAME)
          })
       .on("mouseleave",function(d,i){
            //unHighLight();
            //d3.select(this).style({stroke:undefined});
            d3.select("#toolTip").style({
              visibility: "hidden",
              opacity: undefined
            });
        }) 
       .attr("d",geoPath);

  }
})(d3);
