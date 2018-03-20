var socket = io();

// to check connection status with the server
socket.on('connect', function () {
    console.log('connected successfully with the server');
});

socket.on('copter-data', function (data) {

    console.log(JSON.stringify(data,undefined,2));
    var template = jQuery('#params-data').html();

    var html = Mustache.render(template, {
        params: JSON.stringify(data,undefined,2)
    });

    jQuery('#datas').append(html);

    console.log(data.message);
});

// to check disconnect status
socket.on('disconnect', function () {
    console.log('disconneted from the server');
});


