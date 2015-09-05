// --------------------------------------------
// Query string
// --------------------------------------------

var QUERYSTRING	= new Array();

//var lArr = location.search.substr(1).replace(/\%26/g,"&").split("&");
var lArr = location.search.substr(1).split("&");

for (var lIdx=0; lIdx<lArr.length; lIdx++)
{
	var lArrValue = lArr[lIdx].split("=");
	QUERYSTRING[lArrValue[0]] = lArrValue[1]; 
}
// --------------------------------------------
// String trim
// --------------------------------------------
// Removes leading whitespaces
function LTrim( value ) {
	
	var re = /\s*((\S+\s*)*)/;
	return value.replace(re, "$1");
	
}

// Removes ending whitespaces
function RTrim( value ) {
	
	var re = /((\s*\S+)*)\s*/;
	return value.replace(re, "$1");
	
}

// Removes leading and ending whitespaces
function trim( value ) {
	
	return LTrim(RTrim(value));
	
}

function getGeoLocation(iFnCallBack)
{
    var location = null;
    if(navigator.geolocation) 
    {
        navigator.geolocation.getCurrentPosition(function(position) {
            location = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
            if (typeof(iFnCallBack)=='function')
            {
                iFnCallBack(location);
            }
        });
    } 
    else if (google.gears) 
    {
        var geo = google.gears.factory.create('beta.geolocation');
        geo.getCurrentPosition(function(position) {
            location = new google.maps.LatLng(position.latitude,position.longitude);
            if (typeof(iFnCallBack)=='function')
            {
                iFnCallBack(location);
            }
        });
    } 
    else 
    {
        location = new google.maps.LatLng(54.889444,24.026756);
        if (typeof(iFnCallBack)=='function')
        {
            iFnCallBack(location);
        }
    }
    
}
function getColor(lIdx)
{
	var lColorIdx = lIdx%arrColors.length;
    return arrColors[lColorIdx];
}

 function getNiceTime(iNmTime)
{
    var sec = iNmTime;
	
    var hours =  parseInt(sec/3600);
    sec -= hours*3600;
    var mins =  parseInt(sec/60);
    sec -= parseInt(mins*60);
    var lStrReturn = addZeros(hours)+":"+addZeros(mins)+":"+addZeros(parseInt(sec));
    return lStrReturn;
}
function addZeros(iStr)
{
    if(iStr<=9&&iStr>-1)
    {
        return "0"+ iStr;
    }
    return iStr;
}
 function getObjectType()
    {
        if (QUERYSTRING['event'])
        {
            return 'event';
        }
        else if (QUERYSTRING['race'])
        {
            return 'race';
        }
		else if (QUERYSTRING['track'])
        {
            return 'track';
        }
        else
        {
            return 'track';
        }
    }