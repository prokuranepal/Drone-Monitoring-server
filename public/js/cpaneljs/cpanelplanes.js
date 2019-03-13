function getUrlDashboard() {
    window.location.href = window.location.origin +"/cpanel";
}

function getUrlUsers() {
    window.location.href = window.location.origin +"/cpanel/users";
}

function getUrlPlanes() {
    window.location.href = window.location.origin +"/cpanel/planes";
}

function getUrlLogout() {
    window.location.href = window.location.origin +"/logout";
}

function addPlane() {
    planeName = document.getElementById('planeName').value;
    planeLocation = document.getElementById('planeLocation').value;
    if (planeName === ''){
        alert("Plane Name must be filled out");
        return false;
    }
    if (planeLocation === ''){
        alert("Plane Location must be filled out");
        return false;
    }
    const data = {
        planeName : planeName,
        planeLocation: planeLocation
    }
    $.post(window.location.href+"/update",data, function(data,status) {
        document.getElementById('success').innerText = status;
    });
}