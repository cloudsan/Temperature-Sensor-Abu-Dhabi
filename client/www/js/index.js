   $(document).ready(function($) {
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


        map.setOptions({
            //styles: stylesArray
        });

        var image = {
            url: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=25|FF0000|000000',
            // This marker is 20 pixels wide by 32 pixels tall.
            size: new google.maps.Size(20, 32),
        };
        $.ajax({
                url: 'http://ec2-54-148-238-83.us-west-2.compute.amazonaws.com/api/getJsonTest',
                // url: 'http://127.0.0.1:8000/getJsonTest',
                type: 'Get',
                dataType: 'json',
                // data: {param1: 'value1'},
            })
            .done(function(data) {
                console.log(data);
                $.each(data['list'], function(index, val) {
                     appendList(val);
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(val['lat'], val['lng']),
                        map: map,
                            optimized: false,

                        icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld='+Math.round(val['t1'])+'|FF0000|000000'
                    });
                    google.maps.event.addListener(marker, 'click', function() {
                        map.setCenter(marker.getPosition());
                        window.open('node_detail.html?id='+val['id'], 'detail')
                    });
                });

            })
            .fail(function() {
                console.log("error");
            })
            .always(function() {
                console.log("complete");
            });





    });

function appendList(data){

$( "#hiddenTemplate" ).tmpl( data )
.appendTo( "#left" );
   // var k = $('#hiddenTemplate').tmpl( data ).appendTo( "#left" );
   // console.log($(k).find('#h2_nodeID').html());
   // $('#left').append(k);
}
