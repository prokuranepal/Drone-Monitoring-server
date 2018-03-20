var socket = io();





// to check connection status with the server
socket.on('connect', function () {

    var params = jQuery.deparam(window.location.search);

    var template = jQuery('#params-data').html();

    var html = Mustache.render(template, {
        params: params
    });
    jQuery('#datas').append(html);

    console.log('connected successfully with the server');
});

// to check disconnect status
socket.on('disconnect', function () {
    console.log('disconneted from the server');
});

