var user_item = null;
var map;
var serverurl = 'http://ec2-50-16-55-61.compute-1.amazonaws.com/'
// var serverurl = 'http://cloudsan.com:8000/'

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
            scope: 'email,publish_stream'
        });
}

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

    $.ajax({
            // url: 'http://ec2-50-16-55-61.compute-1.amazonaws.com/api/getJsonTest',
            headers: {
                'Authorization': token
            },
            url: url,
            type: 'Get',
            dataType: 'json',
            // data: {param1: 'value1'},
        })
        .done(function(data) {
            // console.log(data);
            $.unblockUI();
            $("#left").html('')
            if (data)
                $.each(data, function(index, val) {
                    appendList(val);
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(val['lat'], val['lng']),
                        map: map,
                        optimized: false,

                        icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + Math.round(val['t1']) + '|FF0000|000000'
                    });
                    google.maps.event.addListener(marker, 'click', function() {
                        map.setCenter(marker.getPosition());
                        window.open('node_detail.html?id=' + val['node_id'], 'detail')
                    });
                });

        })
        .fail(function() {
            console.log("error");
        })
        .always(function() {
            console.log("complete");
        });
}

function appendList(data) {

    $("#hiddenTemplate").tmpl(data)
        .appendTo("#left");
    // var k = $('#hiddenTemplate').tmpl( data ).appendTo( "#left" );
    // console.log($(k).find('#h2_nodeID').html());
    // $('#left').append(k);
}
