!(function (d3) {

    $("acontent").empty();


    var chartWidth = 800;
    var chartHeight = 600;
    var chartMargin = {top: 20, left: 30, right: 20, bottom:20}
    var chartInnerHeight = chartHeight - chartMargin.top - chartMargin.bottom;
    var chartInnerWidth = chartWidth - chartMargin.left - chartMargin.right;



//var socket = io.connect('http://172.16.31.116:8080');
//socket.on("categories", function(categories) {  
//            console.log("categories name", categories);
            //console.log("categories data", categories);
//});


    function load_data(){

        var data = [3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 3, 6, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 9];

        return data;
    }

    function load_data2(){

        var data = [1, 3, 8, 9, 2, 9,3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 3, 6, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 3, 6, 2, 7, 5, 2];

        return data;
    }

    function load_data3(){

        var data = [[3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 3, 6, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 3,   6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 9],[1, 3, 8, 9, 2, 9,3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 3, 6, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 3, 6, 2, 7, 5, 2], [20, 10, 30, 80, 90, 20, 50, 30, 80, 90, 20, 50, 90, 30, 60, 30, 60, 20, 70, 50, 20, 10, 30, 80, 90, 20, 50, 90, 20, 70, 50, 20, 10, 30, 80, 90, 20, 50, 90, 30  ,   60, 20, 70, 50, 20, 10, 30, 80, 90, 20, 90]];

        return data;
    }

    //alert(".path" + (1+2));

    function draw_line(id, data1, nlines,  width, height, interpolation, animate, updateDelay, transitionDelay){


        //svg.select("jam").remove();

        var k = 0;
        var max_data = 0;
        var tmp = 0;
        for (k = 0; k < nlines; k++){
            tmp = Math.max(...data1[k]);
            if (tmp > max_data)
                max_data = tmp;
            //alert("max " + max_data);
        }
        //alert("max " + max_data);

        // create an SVG element inside the #graph div that fills 100% of the div
        //var graph = d3.select(id).append("svg:svg").attr("width", "100%").attr("height", "100%");
        //var graph1 = d3.select(id).attr("width",chartWidth + "px").attr("height", chartHeight + "px").append("svg:svg").attr("width", "100%").attr("height", "100%");
        //var graph1 = d3.select(id).append("svg:svg").attr("class", "jam").attr("width", "100%").attr("height", "100%").style("fill", "black").style("background-color", "grey");
        var graph1 = d3.select(id).append("svg:svg").attr("class", "jam").attr("width", "800px").attr("height", "600px").style("fill", "black").style("background-color", "grey");
        


        var graph = graph1.append("g")
                            .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");


        var xAxisGroup = graph1.append("g")
                            .attr("transform", "translate(" + chartMargin.left + "," + (chartInnerHeight + chartMargin.top) + ")");
        var yAxisGroup = graph1.append("g")
                            .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");
            



        // X scale will fit values from 0-10 within pixels 0-100
        var x = d3.scale.linear().domain([0, 48]).range([-5, width]); // starting point is -5 so the first value doesn't show and slides off the edge as part of the transition
        // Y scale will fit values from 0-10 within pixels 0-100
        //var y = d3.scale.linear().domain([0,max_data]).range([0, height]);
        var y = d3.scale.linear().domain([0,max_data]).range([chartInnerHeight, 0]);
   

            var xAxis = d3.svg.axis()
                            .scale(x)
                            .tickSize(-1)
                            .orient("bottom") 
            var yAxis = d3.svg.axis()
                            .scale(y)
                            .tickSize(-1)
                            .orient("left") 
            xAxisGroup.call(xAxis);
            yAxisGroup.call(yAxis);





        // create a line object that represents the SVN line we're creating
        var line = d3.svg.line()
            // assign the X function to plot our line as we wish
            .x(function(d,i) { 
                // verbose logging to show what's actually being done
                //console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
                // return the X coordinate where we want to plot this datapoint
                return x(i); 
            })
            .y(function(d) { 
                // verbose logging to show what's actually being done
                //console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
                // return the Y coordinate where we want to plot this datapoint
                return y(d); 
            })
            .interpolate(interpolation)



            // display the line by appending an svg:path element with the data line we created above
            var i = 0;
            for (i = 0; i < nlines ; i++){
                //alert("path" + (i+1));
                graph.append("svg:path").attr("class", "path" + (i+1)).attr("d", line(data1[i]));
            }
            //graph.append("svg:path").attr("class", "path2").attr("d", line(data2));
            // or it can be done like this
            //graph.selectAll("path").data([data]).enter().append("svg:path").attr("d", line);

            function redrawWithAnimation() {
                // update with animation
                var j = 0;
                for (j = 0; j < nlines ; j++){
                    graph.selectAll(".path" + (j+1))
                        .data([data1[j]]) // set the new data
                        .attr("transform", "translate(" + x(1) + ")") // set the transform to the right by x(1) pixels (6 for the scale we've set) to hide the new value
                        .attr("d", line) // apply the new data values ... but the new value is hidden at this point off the right of the canvas
                        .transition() // start a transition to bring the new value into view
                        .ease("linear")
                        .duration(transitionDelay) // for this demo we want a continual slide so set this to the same as the setInterval amount below
                        .attr("transform", "translate(" + x(0) + ")"); // animate a slide to the left back to x(0) pixels to reveal the new value
                }
            }
            
            function redrawWithoutAnimation() {
                // static update without animation
                var j = 0;
                for (j = 0; j < nlines ; j++)
                    graph.selectAll(".path" + (j+1))
                        .data([data1[j]]) // set the new data
                        .attr("d", line); // apply the new data values
            }
            
            setInterval(function() {
                var j = 0;
                for (j = 0; j < nlines ; j++){
                    var v = data1[j].shift(); // remove the first element of the array
                    data1[j].push(v); // add a new element to the array (we're just taking the number we just shifted off the front and appending to the end)
                }
               if(animate) {
                   redrawWithAnimation();
               } else {
                   redrawWithoutAnimation();
               }
            }, updateDelay);

    }

    //var socket = io.connect('http://localhost:8080');
    var socket = io.connect('https://twitterabusevis.herokuapp.com');
        socket.on("categories", function(categories) {  
        console.log("categories name", categories);
        //console.log("categories data", categories);
    });
    
    $.ajax({ //get data both on UI redraw and on body load. 5 can be configured to send anything
      dataType: "json",
      //url: 'http://localhost:8080/api/live/interval='+5,
      url: 'https://twitterabusevis.herokuapp.com/api/live/interval='+5,
      data: 0
    });

    items3 = load_data3();

    draw_line("acontent", items3, 3, chartInnerWidth, chartInnerHeight, "basis", false, 1000, 1000);
    //draw_line("#a_tab", items3, 3, chartInnerWidth, chartInnerHeight, "basis", false, 1000, 1000);
    //draw_line("#graph1", items3, 3, chartInnerWidth, chartInnerHeight, "basis", false, 1000, 1000);
    //draw_line("#graph1", load_data(),load_data2(), chartInnerWidth, chartInnerHeight, "basis", false, 1000, 1000);
    //draw_line("#svg1", load_data(), chartInnerWidth, chartInnerHeight, "basis", false, 1000, 1000);

})(d3);
