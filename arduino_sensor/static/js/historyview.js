function setd3(){
                       // Set the dimensions of the canvas / graph
                    var margin = {
                            top: 30,
                            right: 80,
                            bottom: 30,
                            left: 50
                        },
                        width = 600 - margin.left - margin.right,
                        height = 270 - margin.top - margin.bottom;

                    // Parse the date / time
                    var parseDate = d3.time.format("%Y/%m/%d").parse;

                    // Set the ranges
                    var x = d3.time.scale().range([0, width]);
                    var y = d3.scale.linear().range([height, 0]);
                    var y2 = d3.scale.linear().range([height, 0]);
                    // Define the axes
                    var xAxis = d3.svg.axis().scale(x)
                        .orient("bottom").ticks(5).tickFormat(d3.time.format("%m/%d"));

                    var yAxis = d3.svg.axis().scale(y)
                        .orient("left").ticks(5);

                    // Define the line
                    var templine = d3.svg.line()
                        .x(function(d) {
                            return x(d.date);
                        })
                        .y(function(d) {
                            return y(d.temp);
                        });

                    var humiline = d3.svg.line()
                        .x(function(d) {
                            return x(d.date);
                        })
                        .y(function(d) {
                            return y2(d.humidity);
                        });


                    // Adds the svg canvas
                    var svg = d3.select("#svg-container")
                        .append("svg")
                        .attr('id','svg-chart')
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .attr("viewBox","0 0 "+(width + margin.left + margin.right)+" "+(height + margin.top + margin.bottom))
                        .append("g")
                        .attr("transform",
                            "translate(" + margin.left + "," + margin.top + ")");
                    var chart = $("#svg-chart"),
                        aspect = chart.width() / chart.height(),
                        container = chart.parent();
                    $(window).on("resize", function() {
                        var targetWidth = container.width();
                        chart.attr("width", targetWidth);
                        chart.attr("height", Math.round(targetWidth / aspect));
                    }).trigger("resize");
                    // Get the data
                    d3.json("/static/data.json", function(error, data) {
                        if (error)
                            return console.error(error);

                        data.result.forEach(function(d) {

                            d.date = parseDate(d.datetime);

                        });

                        // Scale the range of the data
                        x.domain(d3.extent(data.result, function(d) {
                            return d.date;
                        }));
                        y.domain([0, d3.max(data.result, function(d) {
                            return d.temp;
                        })]);
                        y2.domain([0, d3.max(data.result, function(d) {
                            return d.humidity;
                        })]);
                        svg.append("path")
                            .attr("class", "line data1")
                            .attr("d", templine(data.result));
                        svg.append("path")
                            .attr("class", "line data2")
                            .attr("d", humiline(data.result));


                        // Add the X Axis
                        svg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + height + ")")
                            .call(xAxis);

                        // Add the Y Axis
                        svg.append("g")
                            .attr("class", "y axis axisLeft")
                            .call(yAxis);
                        var yAxisRight = d3.svg.axis().scale(y2).ticks(6).orient("right");
                        // Add the y-axis to the right
                        svg.append("svg:g")
                            .attr("class", "y axis axisRight")
                            .attr("transform", "translate(" + (width + 15) + ",0)")
                            .call(yAxisRight);

                        svg.append("text")
                            .attr("transform", "rotate(-90)")
                            .attr("y", 0 - margin.left)
                            .attr("x", 0 - (height / 2))
                            .attr("dy", "1em")
                            .style("text-anchor", "middle")
                            .text("tempareture");
                    });
                    svg.append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 0 - margin.left)
                        .attr("x", (height / 2))
                        .attr("dy", "1em")
                        .style("text-anchor", "middle")
                        .text("Value");
}

$(document).ready(function($) {
    setd3();
    var myOptions = {
        zoom: 13,
        center: new google.maps.LatLng(24.4281988, 54.6231222),
        streetViewControl: false,
        scaleControl: true,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT,
            style: google.maps.ZoomControlStyle.LARGE
        },
        draggableCursor: 'crosshair'
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'), myOptions);
    stylesArray = [{
        "elementType": "labels.text",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "landscape.natural",
        "elementType": "geometry.fill",
        "stylers": [{
            "color": "#f5f5f2"
        }, {
            "visibility": "on"
        }]
    }, {
        "featureType": "administrative",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "transit",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "poi.attraction",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "landscape.man_made",
        "elementType": "geometry.fill",
        "stylers": [{
            "color": "#ffffff"
        }, {
            "visibility": "on"
        }]
    }, {
        "featureType": "poi.business",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "poi.medical",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "poi.place_of_worship",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "poi.school",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "poi.sports_complex",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [{
            "color": "#ffffff"
        }, {
            "visibility": "simplified"
        }]
    }, {
        "featureType": "road.arterial",
        "stylers": [{
            "visibility": "simplified"
        }, {
            "color": "#ffffff"
        }]
    }, {
        "featureType": "road.highway",
        "elementType": "labels.icon",
        "stylers": [{
            "color": "#ffffff"
        }, {
            "visibility": "off"
        }]
    }, {
        "featureType": "road.highway",
        "elementType": "labels.icon",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "road.arterial",
        "stylers": [{
            "color": "#ffffff"
        }]
    }, {
        "featureType": "road.local",
        "stylers": [{
            "color": "#ffffff"
        }]
    }, {
        "featureType": "poi.park",
        "elementType": "labels.icon",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "poi",
        "elementType": "labels.icon",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "water",
        "stylers": [{
            "color": "#71c8d4"
        }]
    }, {
        "featureType": "landscape",
        "stylers": [{
            "color": "#e5e8e7"
        }]
    }, {
        "featureType": "poi.park",
        "stylers": [{
            "color": "#8ba129"
        }]
    }, {
        "featureType": "road",
        "stylers": [{
            "color": "#ffffff"
        }]
    }, {
        "featureType": "poi.sports_complex",
        "elementType": "geometry",
        "stylers": [{
            "color": "#c7c7c7"
        }, {
            "visibility": "off"
        }]
    }, {
        "featureType": "water",
        "stylers": [{
            "color": "#a0d3d3"
        }]
    }, {
        "featureType": "poi.park",
        "stylers": [{
            "color": "#91b65d"
        }]
    }, {
        "featureType": "poi.park",
        "stylers": [{
            "gamma": 1.51
        }]
    }, {
        "featureType": "road.local",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [{
            "visibility": "on"
        }]
    }, {
        "featureType": "poi.government",
        "elementType": "geometry",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "landscape",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "road",
        "elementType": "labels",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [{
            "visibility": "simplified"
        }]
    }, {
        "featureType": "road.local",
        "stylers": [{
            "visibility": "simplified"
        }]
    }, {
        "featureType": "road"
    }, {
        "featureType": "road"
    }, {}, {
        "featureType": "road.highway"
    }]

    map.setOptions({
        styles: stylesArray
    });

    var image = {
        url: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=25|FF0000|000000',
        // This marker is 20 pixels wide by 32 pixels tall.
        size: new google.maps.Size(20, 32),
    };
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(24.4211988, 54.6231222),
        map: map,
        icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=25|FF0000|000000'
    });

    var marker2 = new google.maps.Marker({
        position: new google.maps.LatLng(24.4282388, 54.6231222),
        map: map,
        icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=25|FF0000|000000'
    });
    var marker3 = new google.maps.Marker({
        position: new google.maps.LatLng(24.4218688, 54.5721222),
        map: map,
        icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=25|FF0000|000000'
    });
    var marker4 = new google.maps.Marker({
        position: new google.maps.LatLng(24.4231928, 54.6291222),
        map: map,
        icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=22|EE1100|000000'
    });
    var marker5 = new google.maps.Marker({
        position: new google.maps.LatLng(24.4131938, 54.6231222),
        map: map,
        icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=21|00AA00|000000'
    });
    google.maps.event.addListener(marker, 'click', function() {
        map.setCenter(marker.getPosition());
        window.open('/demo/historical/1', 'detail')
    });

});
