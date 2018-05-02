
// function to validate the user
function validate()
{
    if(   document.getElementById("username").value == "nicdrone"
        && document.getElementById("password").value == "nicdrone" )
    {
        alert( "validation succeeded" );
        location.href="status.html";
    }
    else
    {
        alert( "validation failed" );
        location.href="/";
    }
}