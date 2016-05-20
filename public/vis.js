
    $("acontent").empty();

    //var chartMargin = {top: 20, left: 30, right: 20, bottom:20};
    var chartMargin = {top: 10, left: 10, right: 10, bottom:10};

    // $.ajax({ //get data both on UI redraw and on body load. 5 can be configured to send anything
    //   dataType: "json",
    //   url: 'http://localhost:8080/api/live/interval='+5,
    //   //url: 'https://twitterabusevis.herokuapp.com/api/live/interval='+5,
    //   data: 0
    // });

    function load_data4(){

        //data = [[3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 3, 6, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 3,   6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 9],[1, 3, 8, 9, 2, 9,3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 3, 6, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 3, 6, 2, 7, 5, 2], [20, 10, 30, 80, 90, 20, 50, 30, 80, 90, 20, 50, 90, 30, 60, 30, 60, 20, 70, 50, 20, 10, 30, 80, 90, 20, 50, 90, 20, 70, 50, 20, 10, 30, 80, 90, 20, 50, 90, 30  ,   60, 20, 70, 50, 20, 10, 30, 80, 90, 20, 90]];
        //data = [[10],[10],[20],[50]];
        data = [[],[],[],[]];

        return data;
    }

    function load_data3(){

        //data = [[3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 3, 6, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 3,   6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 9],[1, 3, 8, 9, 2, 9,3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 3, 6, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 3, 6, 2, 7, 5, 2], [20, 10, 30, 80, 90, 20, 50, 30, 80, 90, 20, 50, 90, 30, 60, 30, 60, 20, 70, 50, 20, 10, 30, 80, 90, 20, 50, 90, 20, 70, 50, 20, 10, 30, 80, 90, 20, 50, 90, 30  ,   60, 20, 70, 50, 20, 10, 30, 80, 90, 20, 90]];
        data = [[10],[10],[90]];

        return data;
    }

    function draw_line(id, class_id, data1, generate, nlines,  chartWidth, chartHeight, chartMargin,  interpolation, animate, updateDelay, transitionDelay){
        var k = 0;
        var max_data = 0;
        var tmp = 0;
        var chartInnerHeight = chartHeight - chartMargin.top - chartMargin.bottom;
        var chartInnerWidth = chartWidth - chartMargin.left - chartMargin.right;

        if(nlines > 1){
            for (k = 0; k < nlines; k++){
                tmp = Math.max(...data1[k]);
                if (tmp > max_data)
                    max_data = tmp;
            }
            //alert("max " + max_data);
        }

        if (max_data == 0){
                max_data = 50;
        }

        // create an SVG element inside the #id div that fills 100% of the div
        var svg = d3.select(id).append("svg")
                        .attr("class", class_id)
                        .attr("width", chartWidth)
                        .attr("height", chartHeight);

        var graph = svg.append("g")
                            .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");

        var xAxisGroup = svg.append("g")
                            .attr("transform", "translate(" + chartMargin.left + "," + (chartInnerHeight + chartMargin.top) + ")");
        var yAxisGroup = svg.append("g")
                            .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");

        var x = d3.scale.linear()
                    .domain([0, 48])
                    .range([0, chartInnerWidth]); // starting point is -5 so the first value doesn't show and slides off the edge as part of the transition
        var y = d3.scale.linear()
                    .domain([0,max_data])
                    .range([chartInnerHeight, 0]);
   

        var xAxis = d3.svg.axis()
                        .scale(x)
                        .tickSize(-1)
                        .orient("bottom");
        var yAxis = d3.svg.axis()
                        .scale(y)
                        .tickSize(-1)
                        .orient("left");


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
            graph.append("svg:path").attr("class", "path" + (i+1)).attr("d", line(data1[i]));
        }


//alert(color.toString(d3.color("steelblue")));

// Our color bands
var color = d3.scale.ordinal()
    .range(["#4682B4", "#FF0000", "#008000", "#000000"]);
    //.range([d3.color("steelblue"), d3.color("red"), d3.color("grey")]);
    //.range(["#308fef", "#5fa9f3", "#1176db"]);

color.domain(["Sexual","General", "Women", "Racial"]);
var legend = svg.selectAll(".legend")
    .data(color.domain().slice().reverse())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) {
    return "translate(0," + i * 20 + ")";
});

legend.append("rect")
    .attr("x", chartInnerWidth - 18)
    .attr("width", 50)
    .attr("height", 10)
    .style("fill", color);

legend.append("text")
    .attr("x", chartInnerWidth - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function (d) {
    return d;
});





            
        var json_data;

        function redrawWithAnimation() {
            // update with animation
            var j = 0;

            if(nlines > 1){
                for (k = 0; k < nlines; k++){
                    tmp = Math.max(...data1[k]);
                    if (tmp > max_data)
                        max_data = tmp;
                }
            }

            var y = d3.scale.linear().domain([0,max_data]).range([chartInnerHeight, 0]);
            var xAxis = d3.svg.axis()
                            .scale(x)
                            .tickSize(-1)
                            .orient("bottom"); 
            var yAxis = d3.svg.axis()
                            .scale(y)
                            .tickSize(-1)
                            .orient("left");
            xAxisGroup.call(xAxis);
            yAxisGroup.call(yAxis);



            for (j = 0; j < nlines ; j++){
                graph.selectAll(".path" + (j+1))
                    .data([data1[j]]) // set the new data
                    .attr("transform", "translate(" + x(1) + ")") // set the transform to the right by x(1) pixels (6 for the scale we've set) to hide the new value
                    .attr("d", line) // apply the new data values ... but the new value is hidden at this point off the right of the canvas
                    .transition() // start a transition to bring the new value into view
                    .ease("linear")
                    .duration(transitionDelay) // for this demo we want a continual slide so set this to the same as the setInterval amount below
                    .attr("transform", "translate(" + x(0) + ")"); // animate a slide to the left back to x(0) pixels to reveal the new value
                    //.attr("data-legend",function(d) { return "Hello"})
                    //.attr("data-legend",function(d) { return json_data['categories'][j]['name']})
            }
            //return max_data;
        }
        
        function redrawWithoutAnimation() {
            // static update without animation
            var j = 0;
            for (j = 0; j < nlines ; j++)
                graph.selectAll(".path" + (j+1))
                    .data([data1[j]]) // set the new data
                    .attr("d", line) // apply the new data values
                    .attr("data-legend",function(d) { return "Hello"})
            legend = d3.svg.append("g")
              .attr("class","legend")
              .attr("transform","translate(50,30)")
              .style("font-size","12px")
              .call(d3.legend)
        }
            
        setInterval(function() {

            /*
            socket.on("categories", function(categories) {  
                data22[0].push(getRandomArbitrary(0,5));
                data22[1].push(getRandomArbitrary(5,10));
                data22[2].push(getRandomArbitrary(10,15));
                data22[3].push(getRandomArbitrary(15,20));

            });
            */

            /*
            var j = 0;
            for (j = 0; j < nlines ; j++){
                var v;
                if(data1[j].length >= 51)
                    v = data1[j].shift(); // remove the first element of the array
                else
                    v = generate[j]();
                data1[j].push(v); // add a new element to the array (we're just taking the number we just shifted off the front and appending to the end)
            }

            */
            json_data = generate();
            //alert (data1[0].length);
            if(data1[0].length >= 51){
                data1[0].shift();
                data1[1].shift();
                data1[2].shift();
                data1[3].shift();
            }
            if (typeof json_data != 'undefined'){
                data1[0].push(parseInt(json_data['categories'][0]['val']));
                data1[1].push(parseInt(json_data['categories'][1]['val']));
                data1[2].push(parseInt(json_data['categories'][2]['val']));
                data1[3].push(parseInt(json_data['categories'][3]['val']));
            }
           //if(animate) {
               redrawWithAnimation();
           //} else {
           //    redrawWithoutAnimation();
           //}
        }, updateDelay);

    }

    items3 = load_data3();
    items4 = load_data4();
    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

/*
    var generator_fns = [
        function getRandomArbitrary1(min=1, max=10) {
            return Math.random() * (max - min) + min;
        },
        function getRandomArbitrary2(min=1, max=10) {
            return Math.random() * (max - min) + min;
        },
        function getRandomArbitrary3(min=10, max=100) {
            return Math.random() * (max - min) + min;
        }
    ];

*/

    //var height1 = parseInt((document.getElementById("a_tab").style.height).slice(0, -2));
    //var width1 = parseInt((document.getElementById("a_tab").style.width).slice(0, -2)) - 240;
    
    var height1 = $("#linechart1").height();
    var width1 = $("#linechart1").width();

    //alert ("Height" + (height1/4) + (width1/4))
    draw_line("acontent", "jam", items4, get_data , 4, width1, height1, chartMargin, "basis", true, 1000, 1000);
    //draw_line("acontent", "jam", items4, get_data , 4, ((3*width1)/4), ((3*height1)/8), chartMargin, "basis", true, 1000, 1000);
    //draw_line("acontent", "jam", items4, get_data , 4, (width1/2), (height1/4), chartMargin, "basis", false, 1000, 1000);
    //draw_line("acontent", "jam", items3, generator_fns , 3, (width1/2), (height1/4), chartMargin, "basis", false, 1000, 1000);
    //draw_line("acontent", "jam2", items3, generator_fns , 2, (width1/2), (height1/4), chartMargin, "basis", false, 1000, 1000);

