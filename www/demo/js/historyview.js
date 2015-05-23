var Lat, Lng, currentTemp;
var user_item;
var favid = 0;
// var serverurl = 'http://ec2-50-16-55-61.compute-1.amazonaws.com/api/'
var serverurl = 'http://cloudsan.com:8000/'
function checkLogin() {
    // window.localStorage.removeItem("loginPromise");
    var loginPromise = window.localStorage.getItem("loginPromise");
    if (loginPromise != null) {
        var user = JSON.parse(loginPromise);
        user_item = user;
        $('#userlogin').hide();
        $('#userinfo').show();
        $('#userinfo').html('<a href="#">Hi, ' + user.name + '</a>')
        $('#userlogout').show();
        $('#lognav').show();
    } else {
        $('#userlogin').show();
        $('#userinfo').hide();
        $('#userlogout').hide();
        $('#lognav').hide();
    }


}

function logout() {
    window.localStorage.removeItem("loginPromise");
    window.location.reload();
}

function login() {
    openFB.login(
        function(response) {
            if (response.status === 'connected') {
                // alert('Facebook login succeeded, got access token: ' + response.authResponse.token);
                var token = "Bearer " + response.authResponse.token;
                // console.log(token);
                var loginPromise = $.ajax({
                    method: 'POST',
                    url: serverurl + 'api-token/login/facebook/',
                    headers: {
                        'Authorization': token
                    },
                    success: function(data) {
                        // console.log(loginPromise);
                        window.localStorage.setItem("loginPromise", JSON.stringify(data));
                        window.location.reload();
                    }
                });


            } else {
                alert('Facebook login failed: ' + response.error);
            }
        }, {
            scope: 'email,publish_actions'
        });
}
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function setd3() {
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
    var parseDate = d3.time.format("%Y/%m/%d %H:%M").parse;

    // Set the ranges
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);
    var y2 = d3.scale.linear().range([height, 0]);
    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(3).tickFormat(d3.time.format("%m/%d %H:%M"));

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(5);

    // Define the line
    var templine = d3.svg.line()
        .x(function(d) {
            return x(d.date);
        })
        .y(function(d) {
            return y(d.t1);
        });

    var humiline = d3.svg.line()
        .x(function(d) {
            return x(d.date);
        })
        .y(function(d) {
            return y2(d.h1);
        });
    // var zeroline = d3.svg.line()
    //     .x(function(d) {
    //         return 0;
    //     })
    //     .y(function(d) {
    //         return 0;
    //     });

    // Adds the svg canvas
    var svg = d3.select("#svg-container")
        .append("svg")
        .attr('id', 'svg-chart')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
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
    var node_id = getParameterByName('id');
    $.blockUI({
        css: {
            border: 'none',
            padding: '15px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .5,
            color: '#fff'
        }
    });
    var token = null;
    if (user_item != null) {
        token = 'Token ' + user_item.token;
    }
    var data= getJsonData();
        $.unblockUI();

        data.forEach(function(d) {

            d.date = parseDate(toTimeZone(d.dt));
        });
        // console.log(data.list[data.list.length-1])
        var newestData = data[data.length - 1]
        $('#label_updatedTime').html(toTimeZone(newestData.dt));
        $('#label_updatedTemp').html(newestData.t1 + '℃');
        $('#label_updatedHumi').html(newestData.h1 + '%')
        var title = newestData.node_name;
        $('#titleh1').html(title);


        Lat = newestData.lat
        Lng = newestData.lng
        currentTemp = newestData.t1


        // console.log(data.list)
        // Scale the range of the data
        x.domain(d3.extent(data, function(d) {
            return d.date;
        }));
        y.domain([d3.min(data, function(d) {
            return d.t1;
        }) - 2, d3.max(data, function(d) {
            return d.t1;
        }) + 2]);
        y2.domain([d3.min(data, function(d) {
            return d.h1;
        }) - 2, d3.max(data, function(d) {
            return d.h1;
        }) + 2]);
        svg.append("path")
            .attr("class", "line data1")
            .attr("d", templine(data));

        svg.append("path")
            .attr("class", "line data2")
            .attr("d", humiline(data));


        // Add the X Axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)

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

        setMap();
    // });
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("tempareture");
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left + width)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("humidity");
    // console.log(Lat)
}

function setMap() {
    var myOptions = {
        zoom: 13,
        center: new google.maps.LatLng(Lat, Lng),
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

    // var image = {
    //     url: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=25|FF0000|000000',
    //     // This marker is 20 pixels wide by 32 pixels tall.
    //     size: new google.maps.Size(20, 32),
    // };


    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(Lat, Lng),
        map: map,
        icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + Math.round(currentTemp) + '|FF0000|000000'
    });
}

$(document).ready(function($) {

    checkLogin();

    setd3();

});


function getJsonData()
{
    return [{"t1":0.0,"t2":0.0,"h1":0.0,"h2":0.0,"lng":54.62038,"lat":24.423804,"dt":"2015-05-18T19:07:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":0.0,"t2":0.0,"h1":0.0,"h2":0.0,"lng":54.62038,"lat":24.423804,"dt":"2015-05-18T19:14:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":24.6,"t2":0.0,"h1":45.0,"h2":0.0,"lng":54.595509,"lat":24.424711,"dt":"2015-05-18T21:07:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":24.8,"t2":0.0,"h1":46.2,"h2":0.0,"lng":54.595509,"lat":24.424711,"dt":"2015-05-18T21:14:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":0.0,"t2":0.0,"h1":0.0,"h2":0.0,"lng":54.595509,"lat":24.424711,"dt":"2015-05-18T21:37:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":26.5,"t2":0.0,"h1":44.8,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-18T21:56:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":26.5,"t2":0.0,"h1":47.4,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-18T22:13:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":26.4,"t2":0.0,"h1":49.1,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-18T22:29:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":26.2,"t2":0.0,"h1":48.2,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-18T22:46:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":26.1,"t2":0.0,"h1":49.6,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-18T23:02:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":26.0,"t2":0.0,"h1":50.1,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-18T23:19:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":25.9,"t2":0.0,"h1":50.5,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-18T23:35:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":25.8,"t2":0.0,"h1":51.3,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-18T23:52:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":25.7,"t2":0.0,"h1":52.8,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T00:09:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":25.4,"t2":0.0,"h1":53.2,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T00:42:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":25.4,"t2":0.0,"h1":53.5,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T00:58:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":25.3,"t2":0.0,"h1":53.2,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T01:15:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":25.3,"t2":0.0,"h1":53.6,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T01:31:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":25.1,"t2":0.0,"h1":52.4,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T01:48:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":25.2,"t2":0.0,"h1":51.3,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T02:04:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":25.5,"t2":0.0,"h1":50.5,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T02:21:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":25.7,"t2":0.0,"h1":49.6,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T02:37:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":26.1,"t2":0.0,"h1":49.0,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T02:38:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":29.1,"t2":0.0,"h1":44.5,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T03:11:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":31.5,"t2":0.0,"h1":39.1,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T03:27:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":36.9,"t2":0.0,"h1":32.9,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T03:44:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":36.0,"t2":0.0,"h1":34.6,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T04:17:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":41.6,"t2":0.0,"h1":30.4,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T04:33:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":49.8,"t2":0.0,"h1":23.9,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T05:06:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":50.7,"t2":0.0,"h1":24.3,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T05:23:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":51.6,"t2":0.0,"h1":24.0,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T05:39:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":53.1,"t2":0.0,"h1":23.1,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T05:56:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":50.9,"t2":0.0,"h1":23.8,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T06:13:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":42.7,"t2":0.0,"h1":30.7,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T06:29:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":39.9,"t2":0.0,"h1":34.1,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T06:46:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":39.1,"t2":0.0,"h1":31.2,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T07:02:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":37.6,"t2":0.0,"h1":32.3,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T07:19:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":37.2,"t2":0.0,"h1":32.6,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T07:35:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":36.8,"t2":0.0,"h1":32.7,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T07:52:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":36.4,"t2":0.0,"h1":32.0,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T08:08:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":36.1,"t2":0.0,"h1":33.7,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T08:25:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":35.7,"t2":0.0,"h1":33.0,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T08:41:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":35.4,"t2":0.0,"h1":33.4,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T08:58:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":35.5,"t2":0.0,"h1":33.8,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T09:15:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":35.3,"t2":0.0,"h1":35.4,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T09:31:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":35.3,"t2":0.0,"h1":36.0,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T09:48:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":35.1,"t2":0.0,"h1":37.0,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T10:04:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":35.1,"t2":0.0,"h1":38.7,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T10:21:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":34.9,"t2":0.0,"h1":38.7,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T10:37:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":34.7,"t2":0.0,"h1":39.9,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T10:54:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"}];
}
