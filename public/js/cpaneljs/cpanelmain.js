function updateUser (userId) {
    const data = {
        full_name : document.getElementById('fullname'+userId).innerText,
        username : document.getElementById('username'+userId).innerText,
        email : document.getElementById('email'+userId).innerText,
        is_valid : document.getElementById('valid'+userId).value,
        is_admin : document.getElementById('admin'+userId).value,
    }
    $.post(window.location.href+"/update",data, function(data,status) {
        console.log(status);
        document.getElementById('success'+userId).innerText = status;
    });
}

function getUrlPlanes() {
    window.location.href = window.location.origin +"/cpanel/planes";
}

function getUrlUsers() {
    window.location.href = window.location.origin +"/cpanel/users";
}

function getUrlDashboard() {
    window.location.href = window.location.origin +"/cpanel";
}

function getUrlLogout() {
    window.location.href = window.location.origin +"/logout";
}