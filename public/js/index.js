/*function validations(){
    let xhttp = new XMLHttpRequest();
    let location1 = document.getElementById("location").value;
    xhttp.onreadystatechange=function() {
        if (this.readyState==4 && this.status == 200){
            window.localStorage.setItem('x-auth', xhttp.getResponseHeader('x-auth'));
            $.ajaxSetup({
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Content-type","application/json");
                    xhr.setRequestHeader('x-auth', xhttp.getResponseHeader('x-auth'));
                }
            });
            $.ajax({ url: '/default' })
            window.onload('/default');
        }
    };
    xhttp.open("POST","/",false);
    xhttp.setRequestHeader("Content-type","application/json");
    xhttp.send(JSON.stringify({
        "username":document.getElementById("username").value,
        "password":document.getElementById("password").value,
        "location":document.getElementById("location").value
    }));

}*/
/*
$(document).ready(function () {
    $("button").click(function () {
        $.post('/',{
            username:document.getElementById("username").value,
            password:document.getElementById("password").value,
            location:document.getElementById("location").value
        },function (data,status) {
            console.log("Data: " + data + "Status: " + status);
        });
        // $.ajaxSetup({
        //    headers: { 'x-auth': xhttp.getResponseHeader('x-auth')}
        //});
    });
});
*/
