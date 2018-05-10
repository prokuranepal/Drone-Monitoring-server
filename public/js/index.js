
// function to validate the user
function validate()
{
    if(   document.getElementById("username").value == "nicdrone"
        && document.getElementById("password").value == "nicdrone" )
    {
        location.href="status.html";
    }
    else
    {
        alert( "validation failed" );
        location.href="/";
    }
}