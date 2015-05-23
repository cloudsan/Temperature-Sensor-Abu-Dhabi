var user_item = null;
var map;
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

function getAll() {
      $('#lognav li').attr("class","");
$('#allLi').attr("class","active");
    getNodeData(serverurl + 'allnodes');
}

function getFavorite() {
    // console.log(user_item);
    $('#lognav li').attr("class","");
$('#favLi').attr("class","active");
    var token = "Token " + user_item.token;

    getNodeData(serverurl + 'account/nodes/', token);
}

$(document).ready(function($) {



    openFB.init({
        appId: '1007553055921839'
    });
    checkLogin();
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
    map = new google.maps.Map(document.getElementById('map-canvas'), myOptions);


    map.setOptions({
        //styles: stylesArray
    });

    var image = {
        url: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=25|FF0000|000000',
        // This marker is 20 pixels wide by 32 pixels tall.
        size: new google.maps.Size(20, 32),
    };

    getAll();




});

function getNodeData(url, token) {


var data = getJsonAllnodes();

            $("#left").html('');
            if (data)
                $.each(data, function(index, val) {
                    console.log(val);
                    val.dt = toTimeZone(val.dt);
                    console.log(val);
                    appendList(val);
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(val['lat'], val['lng']),
                        map: map,
                        optimized: false,

                        icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + Math.round(val['t1']) + '|FF0000|000000'
                    });
                    google.maps.event.addListener(marker, 'click', function() {
                        map.setCenter(marker.getPosition());
                        window.open('node_detail.html?id=' + val['node'], 'detail')
                    });
                });
}

function appendList(data) {

    $("#hiddenTemplate").tmpl(data)
        .appendTo("#left");
    // var k = $('#hiddenTemplate').tmpl( data ).appendTo( "#left" );
    // console.log($(k).find('#h2_nodeID').html());
    // $('#left').append(k);
}

function getJsonAllnodes()
{
    var result=[{"t1":34.7,"t2":0.0,"h1":39.9,"h2":0.0,"lng":54.589148,"lat":24.425429,"dt":"2015-05-19T10:54:00Z","node":1,"node_name":"Masdar Villa","node_desc":"The one we put in villa"},{"t1":25.1,"t2":0.0,"h1":49.1,"h2":0.0,"lng":54.595509,"lat":24.424711,"dt":"2015-05-18T21:41:00Z","node":2,"node_name":"Test2","node_desc":"Test node 2"},{"t1":19.1,"t2":0.0,"h1":47.9,"h2":0.0,"lng":54.595595,"lat":24.424713,"dt":"2015-04-28T17:23:00Z","node":33,"node_name":"Test33","node_desc":"Test for 33"},{"t1":19.7,"t2":0.0,"h1":45.5,"h2":0.0,"lng":54.595604,"lat":24.424705,"dt":"2015-04-28T14:37:00Z","node":99,"node_name":"Test 99","node_desc":"99 Test"}];
    return result;
}
