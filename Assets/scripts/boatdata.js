// globals

var eventid:int = 0;
var race_id:int = 0;
var userid:int = 0;
var latitude:double = 0;
var longitude:double = 0;
var utftime:double = 0;
var track_data = null;


private var data = new Array ();
private var datalimit:int = 200;
private var loadingdata:int = 0;
private var dataisempty:int = 0;
private var initialized:int = 0;

var boatIndex:int = -1;
var boatName = "";
var boatLength:float = 4.7;
var boatDirection:float = 0;
var boatSpeed:float = 0;
var boatHeel:float = 0;
var boatSheet:float = 0;
var boatSheetSide:int = 1; // 1 right, -1 left
var boatSpinaker:int = 0;
var boatBeating:int = 0;
var boatVmg:float = 0;

var overlaped:int = 0;

var positionX:float = 0;
var positionY:float = 0;
var positionR:float = 0;

var routeA:float = 0;
var routeB:float = 0;
var routeC:float = 0;

var routeLength:float = 0;
var routePointX:float = 0;
var routePointY:float = 0;

var wind = null;
var windindex = 0;

var twindBoatDirection:float = 0; 
var twindSpeed:float = 0;
var twindDirection:float = 0; 

var awindSpeed:float = 0;
var awindDirection:float = 0;

// route

var route = new Array ();
var routeInfo = new Array (); // timetable
var routeIndex:int = -1;
var routeCompletedDistance:float = 0;
var routeCompletedTotalDistance:float = 0;
var routeFirstlineDistance:float = 0;

var markDirection:float = 0;
var markDirectionGlobal:float = 0;

// animation script

var testanimationscript = null;


function InitRoute(routedata)
{
	for (var idx = 0; idx < routedata.length; idx++) 
	{
		route.push(routedata[idx]);
	}
}

function InitWind(winddata)
{
	if (winddata.length>0)
	{
		wind = winddata;
	}
}


function GetRouteVector(index):Vector2
{
	//var controller:GameObject = GameObject.Find("controller");
 	//var controllerscript:startup = controller.GetComponent(startup);
 	//var marks = controllerscript.eventdata["marks"];
 	
 	var routedataitem = route[index];
 	//if (routedataitem["type"]=="mark")
	if (routedataitem["type"]=="left" || routedataitem["type"]=="right")
	{
		if (routedataitem["type"]=="left")
		{
			return GetMarkVector(parseInt(routedataitem["left_id"]));
			
		}
		if (routedataitem["type"]=="right")
		{
			return GetMarkVector(parseInt(routedataitem["right_id"]));
			
		}
	}
	else
	{
		var left = GetMarkVector(parseInt(routedataitem["right_id"])); 
		var right = GetMarkVector(parseInt(routedataitem["left_id"]));
		//outedataitem["right_id"]
		
		return Vector2((left.x + right.x)/2,(left.y + right.y)/2);
	}
}


function GetMarkVector(iMarkIndex):Vector2
{
	var controller:GameObject = GameObject.Find("controller");
 	var controllerscript:startup = controller.GetComponent(startup);
 	
	var markdata = controllerscript.marker["marks"][iMarkIndex];
	var index:int = controllerscript.mark_indexes[iMarkIndex];
	
	if ((index>-1)&&(index<track_data.length))
	{
		//Debug.Log ("==zzz=="+iMarkIndex+": "+index);
		return Vector2(track_data[index]["x"],track_data[index]["y"]);
	}
	else
	{
		return Vector2(markdata["x"],markdata["y"]);
	}	
}


function GetRouteItem(iItemIndex)
{
	var v1 = GetRouteVector(iItemIndex);
    var v2 = v1;
 	
 	if (iItemIndex+1 < route.length) 
 	{	
 		v2 = GetRouteVector(iItemIndex+1);
 	}
	var item = new Hashtable();
	
	item["v1"] = v1;
	item["v2"] = v2;
	
	// discance between points
	var difx:float = v2.x - v1.x;
	var dify:float = v2.y - v1.y;
	
	item["distance"] = Mathf.Sqrt(difx*difx + dify*dify);
	
	return item;
}

function LoadRouteInfo(time,index)
{
 	//System.GC.Collect();
	Debug.Log ("LoadRouteInfo "+time+" user "+boatName);
	
	
	var dbtime:int = utftime + time;
	
	var controller:GameObject = GameObject.Find("controller");
 	var controllerscript:startup = controller.GetComponent(startup);
	
	var request : WWW = new WWW(startup.serviceUrl+"geteventinfo_EDIT.php?id="+eventid+"&raceid="+race_id+"&user="+userid+"&latitude="+latitude+"&longitude="+longitude+"&time="+dbtime+"&index="+index+"&boat="+WWW.EscapeURL(boatName));
	
	Debug.Log (boatName+"1--->"+startup.serviceUrl+"geteventinfo_EDIT.php?id="+eventid+"&raceid="+race_id+"&user="+userid+"&latitude="+latitude+"&longitude="+longitude+"&time="+dbtime+"&index="+index+"&boat="+WWW.EscapeURL(boatName));
	
	yield request;
	
	Debug.Log (boatName+"1<---"+request.text);
	
	if (request.text!="")
	{
		var request_data = eval(request.text);
		
		for (var idx = 0; idx < request_data.length; idx++) 
		{
			request_data[idx]["t"] = parseFloat(request_data[idx]["t"]) + time;
			routeInfo.Push(request_data[idx]);
		}
	}
	request = null;
}



	
function LoadData(time)
{
 	System.GC.Collect();
	if (dataisempty==1) return;
	if (loadingdata==1) return;
	
	loadingdata = 1;
	
	var dbtime:int = utftime + time;
	
	var controller:GameObject = GameObject.Find("controller");
 	var controllerscript:startup = controller.GetComponent(startup);
	
	var request : WWW = new WWW(startup.serviceUrl+"getdata3d.php?id="+eventid+"&user="+userid+"&latitude="+latitude+"&longitude="+longitude+"&time="+dbtime+"&limit="+datalimit+"&boat="+WWW.EscapeURL(boatName));

	//Debug.Log (boatName+"2--->"+startup.serviceUrl+"getdata3d.php?id="+eventid+"&user="+userid+"&latitude="+latitude+"&longitude="+longitude+"&time="+dbtime+"&limit="+datalimit+"&boat="+WWW.EscapeURL(boatName));
	
	yield request;
	
	//Debug.Log (boatName+"2<---"+request.text);
	var request_data2 = null;
	request_data2 = request.text;
	request_data2 = eval ('(' +request.text+ ')');
	track_data = request_data2["data"];
	//track_data = request_data2["data"];
	
	for (var idx = 0; idx < track_data.length; idx++) 
	{
		track_data[idx]["t"] = parseFloat(track_data[idx]["t"])+time;
		data.Push(track_data[idx]);
	}
	
	if (startup.isinstantedge == true)
	{
		//LoadRouteInfo(time,routeIndex+1);
	}
	
	if (startup.isinstant==true)
	{
		if (parseFloat(request_data2["timestamp"]<20))
		{
			startup.isinstantedge = true;
		}
	}
	else
	{
		if (track_data.length == 0) 
		{
			dataisempty=1;
		}
	}
	
	
	loadingdata = 0;
	
	if ((initialized == 0)&&(data.Count>0))
	{
		initialized = 1;
		RecalculatePosition(data[0]["t"]);
	}
	request = null;
}


function CleanData()
{
	data = new Array ();
	initialized = 0;
	
	boatDirection = 0;
	boatSpeed = 0;
	boatHeel = 0;
	boatSheet = 0;
	boatSheetSide = 1; 
	boatSpinaker = 0;
	boatBeating = 0;
	
	routeA = 0;
	routeB = 0;
	routeC = 0;
	
	routePointX = 0;
	routePointY = 0;
	
	wind = null;
	windindex = 0;
	
	twindBoatDirection = 0; 
	twindSpeed = 0;
	twindDirection = 0; 
	
	awindSpeed = 0;
	awindDirection = 0;
	
	route = new Array ();
	routeInfo = new Array (); 
	routeIndex = -1;
	routeCompletedDistance = 0;
	routeCompletedTotalDistance = 0;
	routeFirstlineDistance = 0;
	
	overlaped = 0;
}

function GetDataStartTime()
{
	if (data.Count>0)
	{
		return parseFloat(data[0]["t"]);
	}
	else
	{
		return 0;
	}
}

function RecalculatePosition(CurrentTime)
{
	//Debug.Log ("starting "+CurrentTime+" "+data.Count);
	var controller:GameObject = GameObject.Find("controller");
 	var controllerscript:startup = controller.GetComponent(startup);
 				
	if (data.Count > 1)
	{	
		var point = data[0];
		var next = data[1];
		
		var x:float = point["x"];
		var y:float = point["y"];
		var d:float = point["d"];
		//Debug.Log ("coords "+x+" x "+y);
		var td:float = parseFloat(next["t"])-parseFloat(point["t"]);
		
		// position
		if (td > 0)
		{
			//difference
			var xd:float = parseFloat(next["x"])-parseFloat(point["x"]);
			var yd:float = parseFloat(next["y"])-parseFloat(point["y"]);
			var dd:float = parseFloat(next["d"])-parseFloat(point["d"]);
			
			// shift
			if (dd<0) dd = 360 + dd;
			if (dd>180) dd = dd - 360;
			
			var xs:float = xd/td;
			var ys:float = yd/td;
			var ds:float = dd/td;
			
			var ti:float = CurrentTime-parseFloat(point["t"]);
			
			var xi:float = xs * ti;
			var yi:float = ys * ti;
			var di:float = ds * ti;
			
			x = x + xi;
			y = y + yi;
			d = d + di;
		}
		
		if (CurrentTime>parseFloat(next["t"]))
		{
			data.RemoveAt(0);
		}
		
		positionX = x;
		positionY = y;
		positionR = d;
		
		// route
		if ((routeIndex>=0)&&(routeIndex+1<route.length))
		{
			//var routeItem = route[routeIndex]; // change to dunamic
			
			var routeItem = GetRouteItem(routeIndex);
			
			var x1:float = routeItem["v1"].x;
			var y1:float = routeItem["v1"].y;
			var x2:float = routeItem["v2"].x;
			var y2:float = routeItem["v2"].y;
			var dist = routeItem["distance"];
			
			//routeLength = Mathf.Sqrt(Mathf.Pow(x2-x1, 2)+Mathf.Pow(y2-y1, 2));
			
			if (dist > 0)
			{
				routeB = Mathf.Abs(((y1-y2)*x+(x2-x1)*y+(x1*y2-x2*y1)) / dist); // boat to routeline
				routeC = Mathf.Abs(Mathf.Sqrt(Mathf.Pow(x2-x, 2) + Mathf.Pow(y2-y, 2))); // boat to mark
				routeA = Mathf.Sqrt(Mathf.Pow(routeC, 2)-Mathf.Pow(routeB, 2)); // routeline point to mark
				
				var completed = (routeA-boatLength/2)/dist;
				
				routePointX = x2 - (x2-x1)*completed;
				routePointY = y2 - (y2-y1)*completed;
			}
			// VMG
			if (data.Count > 3)
			{	
				var point_vmg = data[3];
				
				var vmg_x1 = parseFloat(point["x"]);
				var vmg_y1 = parseFloat(point["y"]);
				var vmg_x2 = parseFloat(point_vmg["x"]);
				var vmg_y2 = parseFloat(point_vmg["y"]);
				
				var vmg_d1 = Mathf.Abs(Mathf.Sqrt(Mathf.Pow(vmg_x1-x2, 2) + Mathf.Pow(vmg_y1-y2, 2)));
				var vmg_d2 = Mathf.Abs(Mathf.Sqrt(Mathf.Pow(vmg_x2-x2, 2) + Mathf.Pow(vmg_y2-y2, 2)));
				var vmg_dd = vmg_d1 - vmg_d2;
				
				var vmg_d = Mathf.Abs(Mathf.Sqrt(Mathf.Pow(vmg_x1-vmg_x2, 2) + Mathf.Pow(vmg_y1-vmg_y2, 2)));
				
				if (vmg_d > 0) boatVmg = boatSpeed * (vmg_dd/vmg_d);
				else boatVmg = 0;
				
			}
			
			// markdirection
			markDirection = Mathf.Atan2(x2-x, y2-y)*Mathf.Rad2Deg - positionR;
			
			// completed distance
			routeCompletedDistance = routeItem["distance"] - routeA;
						
			// distance to first line
			if(controllerscript.firstboatindex>-1)
			{
				var firstboat:GameObject = controllerscript.boats[controllerscript.firstboatindex];
				var firstboatdatascript:boatdata = firstboat.GetComponent(boatdata);
				
				routeFirstlineDistance = (firstboatdatascript.routeCompletedTotalDistance+firstboatdatascript.routeCompletedDistance) - (routeCompletedTotalDistance+routeCompletedDistance); 
			}
			else
			{
				routeFirstlineDistance = 0;
			}
		
			
		}
		// switch to next route
		if (routeIndex+1 < routeInfo.length)
		{
			//Debug.Log(boatName+" ["+routeIndex+"] "+routeInfo[routeIndex+1]["t"]+"<"+CurrentTime);
			if (routeInfo[routeIndex+1]["t"]<=CurrentTime)
			{
				if (routeIndex >=0)
				{
					var routeItemCompleted = GetRouteItem(routeIndex);
					routeCompletedTotalDistance += routeItemCompleted["distance"];
				}
				else
				{
					routeCompletedTotalDistance = 0;
				}
				
				routeCompletedDistance = 0;
				routeIndex = routeIndex + 1;
				
				controllerscript.RegisterResult(boatIndex,routeIndex,routeInfo[routeIndex]["t"]);
			}
		}
		
 		boatDirection = positionR;//parseFloat(point["d"]);
		boatSpeed = parseFloat(point["s"]);
		
		// calculate wind
		if (wind != null)
		{
			
			if (windindex+1<wind.length)
			{
				var windtime = parseInt(wind[windindex+1]["time"]);
				if (CurrentTime > windtime) windindex = windindex + 1;
			}
			
			twindDirection = parseFloat(wind[windindex]["direction"]);
			twindSpeed = parseFloat(wind[windindex]["speed"]);	
			
			twindBoatDirection = twindDirection-boatDirection;
			if (twindBoatDirection<0) twindBoatDirection = 360 + twindBoatDirection;
			if (twindBoatDirection>180) twindBoatDirection = twindBoatDirection - 360;
		
			var wa:float = twindSpeed * Mathf.Cos((90-Mathf.Abs(twindBoatDirection))*Mathf.Deg2Rad);
			var wb:float = twindSpeed * Mathf.Sin((90-Mathf.Abs(twindBoatDirection))*Mathf.Deg2Rad);
			var wbb:float = wb + boatSpeed;
			
			awindSpeed = Mathf.Sqrt(( wa * wa ) + ( wbb * wbb )) ;
			awindDirection = 90-Mathf.Atan ( wbb / wa )*Mathf.Rad2Deg;
			if (twindBoatDirection<0) awindDirection=0-awindDirection;
			
			// sheet
			if (twindBoatDirection > 0)
			{
				if (twindBoatDirection < 5) 
				{
					boatSheet = 15*boatSheetSide;
					//boatSheetSide = 1;
					boatSpinaker=0;
					boatBeating = 1;
				}
				else if (twindBoatDirection < 90) 
				{
					boatSheet = 15;
					boatSheetSide = 1;
					boatSpinaker=0;
					boatBeating = 1;
				}
				else if (twindBoatDirection < 160)
				{
					boatSheet = awindDirection/2;
					boatSheetSide = 1;
					boatSpinaker = 0;
					boatBeating = 0;
				} 
				else 
				{
					boatSheet = 90*boatSheetSide;
					//boatSheetSide = -1;
					boatSpinaker = 1;
					boatBeating = 0;
				}
			}
			else 
			{
				var minustwindBoatDirection = 0 - twindBoatDirection;
				if (minustwindBoatDirection < 5)
				{
					boatSheet = 15*boatSheetSide;
					//boatSheetSide = -1;
					boatSpinaker = 0;
					boatBeating = 1;
				}
				else if (minustwindBoatDirection < 90)
				{
					boatSheet = -15;
					boatSheetSide = -1;
					boatSpinaker = 0;
					boatBeating = 1;
				}
				else if (minustwindBoatDirection < 160)
				{
					boatSheet = awindDirection/2;
					boatSheetSide = -1;
					boatSpinaker = 0;
					boatBeating = 0;
				}
				else 
				{
					boatSheet = 90*boatSheetSide;
					//boatSheetSide = -1;
					boatSpinaker = 1;
					boatBeating = 0;
				}
			}
			if (boatSpeed==0)
			{
				boatSheet = awindDirection;
				boatSpinaker = 0;
				boatBeating = 0;
				boatSheet = 90*boatSheetSide;
				//if (boatSheet > 90) boatSheet = 90;
				//if (boatSheet < -90) boatSheet = -90;
				//Debug.Log (boatSheet);
			}
			
			// heel
			boatHeel = 0;
			if (boatSpeed > 0)
			{
				if (boatSpinaker==0)
				{
					boatHeel = 12*boatSheetSide;
				}
			}
		}
	}
	
	// overlap
	overlaped = 0;
 	for (var boat in controllerscript.boats)
	{
		var boatdatascript:boatdata = boat.GetComponent(boatdata);
		if (boatdatascript.boatIndex!=boatIndex)
		{
			var bdiffx:float = boatdatascript.positionX-positionX;
			var bdiffy:float = boatdatascript.positionY-positionY;
			
			var distance = Mathf.Abs(Mathf.Sqrt(Mathf.Pow(bdiffx, 2) + Mathf.Pow(bdiffy, 2)));
			if (distance < boatdatascript.boatLength*4)
			{
				var directiondifference = boatdatascript.positionR-positionR;
				if (directiondifference<0) directiondifference = 360 + directiondifference;
				if (directiondifference>180) directiondifference = directiondifference - 360;
				
				if ((directiondifference>-90)&(directiondifference<90))
				{
					var otherboatdirection = Mathf.Atan2(bdiffx, bdiffy)*Mathf.Rad2Deg - positionR;
					if (otherboatdirection<0) otherboatdirection = 360 + otherboatdirection;
					if (otherboatdirection>180) otherboatdirection = otherboatdirection - 360;
					
					if ((otherboatdirection>90)||(otherboatdirection<-90)) overlaped = 1;
				}
			}
		}	
	}
	
	// add coordinates
	if (data.Count > 1)
	{
		if (data.Count < 10)
		{
			LoadData(parseInt(data[data.Count-1]["t"]));
		}
	}
	else
	{
		LoadData(parseInt(CurrentTime));
	}
	
	// todo proper naming
	
 	if (testanimationscript!=null)
 	{
 		testanimationscript.ForceUpdate();
 	}
	
}