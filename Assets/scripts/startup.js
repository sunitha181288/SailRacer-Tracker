static var serviceUrl = "http://sailracer.net/service/";

private var eventdata = null;
private var boatloader = null;
private var trackdata = null;
private var coursedata = null;
private var marker = null; //NEW - for storing markdata
private var Loadboat = 0;

// Game Objects

var compassGrid : Texture2D;
var compassBoat : Texture2D;
var compassMark : Texture2D;
var compassLine : Texture2D;

var buttonFast : Texture2D;
var buttonSlow : Texture2D;
var buttonPlay : Texture2D;
var buttonPause : Texture2D;

var toggleback : Texture2D;
	

var templateMark : GameObject;
var templateGridLine : GameObject;
var templateRaceLine : GameObject;
// boat types 
var external_class = null;
var templateBoat_470 : GameObject;
var templateBoat_optimist : GameObject;
var templateBoat_other : GameObject;

var speedfactor:float = 2; 
var playtime:float = 0;
var eventtime:float = 0;
var scrollPosition : Vector2 = Vector2.zero;
private var velocity = Vector3.zero;

static var isinstant:boolean = false;
static var isinstantedge:boolean = false;

var raceindex = -1;
var racetimestart:int = 0;

private var grid_number:int = 20;
private var grid_horizontal = new Array ();
private var grid_vertical = new Array ();
private var mark_objects = new Array ();
var mark_indexes = new Array ();

var boats = new Array ();
var boatsEntry = new Hashtable();
var boatsorder = new Array ();  
private var previous_boatsorder = 0;
var cameraboatindex = 0;

// WIND
var windindex:int = 0;

private var toc = 0;

// FIRST BOAT

var firstboatindex:int = 0;
var firstboatsailed:float = 0;
var firstboatrouteindex:int = -1;
var firstboatroutetime:float = 0;

private var firstline : GameObject = null;
private var results = new Hashtable();
private var resultstime:float = 0;

private var onfleetmenu:int = 0;
private var onracemenu:int = 0;

var startFont: GUIStyle;

function Start () 
{
	
	Debug.Log("onstart");
	Time.timeScale = speedfactor;
	// initial grid
	for (var a = -grid_number; a <= grid_number; a++)  // every 50 meters
	{
    	var lineH = Instantiate(templateGridLine);
    	//GameObject.CreatePrimitive(PrimitiveType.Plane);
        
        lineH.name = "line-h";
        lineH.transform.position.x = 0;
        lineH.transform.position.y = -3;
        lineH.transform.position.z = a*25;
        lineH.transform.localScale.x = grid_number*5;
        lineH.transform.localScale.y = 1;
        lineH.transform.localScale.z = 0.05;
        
        grid_horizontal.push(lineH);
        
        var lineV = Instantiate(templateGridLine);
        
        lineV.name = "line-v";
        lineV.transform.position.x = a*25;
        lineV.transform.position.y = -3.1;
        lineV.transform.position.z = 0;
        lineV.transform.localScale.x = 0.05;
        lineV.transform.localScale.y = 1;
        lineV.transform.localScale.z = grid_number*5;
        
        grid_vertical.push(lineV);
    }
    
    LoadEvent(665);
    //Application.ExternalCall("UnityLoaded", "");
 	
}

function SetClass(iStrClass)
{
	external_class = iStrClass;
}

function RegisterResult(boatindex,routeindex,routetime)
{
	if (routeindex > firstboatrouteindex)
	{
		results = new Hashtable();
		firstboatrouteindex = routeindex;
		firstboatroutetime = routetime;
		
	}
	if (routeindex == firstboatrouteindex)
	{
		var timediff:int = routetime-firstboatroutetime;
		
		var info = new Hashtable();
		
		if (timediff > 0) info.Add("timediff", "+"+timediff.ToString());
		else info.Add("timediff", "0");
		
		info.Add("time", FormatTime(routetime-racetimestart));
		
		results.Add(boatindex, info);
		resultstime = routetime;
		
		// rsults sorting;
		var old_boatsorder = new Array(boatsorder);
		boatsorder = new Array();
		
		// copy begining from old
		for (var idx1 = 0; idx1 < results.Count-1; idx1++)
		{
			if (idx1<boats.Count)
			{
				boatsorder.Push(old_boatsorder.Shift());
			}
		}
		// add current
		boatsorder.Push(boatindex);
		// add the rest
		while (old_boatsorder.Count > 0)
		{
			var restindex = old_boatsorder.Shift();
			if (restindex!=boatindex)
			{
				boatsorder.Push(restindex);
			}
		}
	}
	
}

function LoadEvent(eventid)
{
	
	//Debug.Log ("--->"+serviceUrl+"getevent.php?id="+eventid);
	
	var request : WWW = new WWW(serviceUrl+"getevent.php?id="+eventid);
	
	yield request;
	
	//Debug.Log ("---<"+request.text);
	
	eventdata = request.text;
	eventdata = eval ('(' + request.text + ')');
	//for(var x in eventdata["users"])
	//Debug.Log ("---<"+x.Value["fleet_id"]+"---<"+x.Key);	
	//
	//Application.ExternalCall("alert", request.data);
	
	//eventtime = parseFloat(eventdata["end"])-parseFloat(eventdata["start"]);
	//eventtime = parseFloat(eventdata["tracks_end"])-parseFloat(eventdata["tracks_start"]);
	//OLD eventtime = parseFloat(eventdata["tracks_end"])-parseFloat(eventdata["start"]);
	
	eventtime = parseFloat(eventdata["end_time"])-parseFloat(eventdata["start_time"]);
	request = null;
	
}

function checkUserboat(boat, boatarray) {
    for(var x in boatarray) {
    			//Debug.Log ("---<"+x.name); 
        if (x.name === boat) {
            return true;
        }
    }

    return false;
}





//var ttt = 0;
function Update () 
{
	if (Time.frameCount % 30 == 0)
	{
	   System.GC.Collect();
	}
	if (eventdata==null)
	{
		//if ((Time.time > 5)&&(Time.time < 6)&&(ttt==0)) 
		//{
		//	ttt=1;
		//	LoadEvent("91");
		//}
		return;
	}
	
	if (toc==0)
	{
		Time.timeScale = 0;
		return;
	}
	
	redraw_grid();
	redraw_marks();
	
	playtime = playtime + Time.deltaTime;
	
	// load race
	if ((eventdata!=null)&&(typeof(eventdata["race"])))
	{
		if (raceindex+1<eventdata["race"].length)
		{
			if (playtime+60 > (parseFloat(eventdata["race"][raceindex+1]["start_time"])-parseFloat(eventdata["start_time"])))
			{
				LoadRace(raceindex+1);
			}
		}
	}
	
	// update boats
	for (var idx = 0; idx < boatsorder.Count; idx++)
	{
		var boat : GameObject = boats[boatsorder[idx]];
		var boatdatascript:boatdata = boat.GetComponent(boatdata); 
 		
 		boatdatascript.RecalculatePosition(playtime);
 			
 		var sailed:float = boatdatascript.routeCompletedDistance + boatdatascript.routeCompletedTotalDistance;
	 		
	 	if (sailed > firstboatsailed)
	 	{
	 		firstboatindex = idx;
	 		firstboatsailed = sailed;
	 	}
	} 
	
	if (firstboatindex > -1)
	{			
		if (firstline!=null)
		{
			var firstboat : GameObject = boats[boatsorder[firstboatindex]];
			var firstboatscript:boatdata = firstboat.GetComponent(boatdata); 
			
			var boatfront:GameObject = firstboat.transform.Find("container/front").gameObject;
			
			if ((firstboatscript.routeIndex >=0)&&(firstboatscript.routeIndex<firstboatscript.route.length))
			{
				var firstboatrouteitem = firstboatscript.GetRouteItem(firstboatscript.routeIndex);
				
				firstline.active = true;
				//firstline.transform.position.x = boatfront.transform.position.x;
				//firstline.transform.position.z = boatfront.transform.position.z;
				
				firstline.transform.position.x = firstboatscript.routePointX/2;
				firstline.transform.position.z = firstboatscript.routePointY/2;
				firstline.transform.localScale.z = firstboatscript.routeA/10;
			
				firstline.transform.eulerAngles.y = 180-getdirection_between_points(firstboatrouteitem["v1"].x,firstboatrouteitem["v1"].y,firstboatrouteitem["v2"].x,firstboatrouteitem["v2"].y);
			}
			else
			{
				firstline.active = false;
			}
		}
	}
	
	if (boats.Count>0)
 	{
	 	var navigator:GameObject = GameObject.Find("navigator");		
 	 	navigator.transform.position = Vector3.SmoothDamp(navigator.transform.position, boats[cameraboatindex].transform.position,velocity, 2.0f);
		//navigator.transform.position.z = Vector3.MoveTowards(navigator.transform.position.z, boats[cameraboatindex].transform.position.z, Time.deltaTime);
		
	}
	
	// wind update -- NUll value
	/*if (typeof(marker["wind"]))
	{
		if (windindex<marker["wind"].length)
		{
			var wind:GameObject = GameObject.Find("navigator/wind");
			if (wind) wind.transform.localRotation.eulerAngles.y = parseFloat(marker["wind"][windindex]["direction"]);
		}
		if (windindex+1<marker["wind"].length)
		{
			var windtime = parseInt(marker["wind"][windindex+1]["time"]);
			if (playtime > windtime) windindex = windindex + 1;
			//Debug.Log (windindex+" "+eventdata["wind"].length+" "+playtime+" "+windtime);
		}
	}*/
}

function LoadCourse(eventid, race_id)
{
	
	//Debug.Log ("--->"+serviceUrl+"event.php?mode=getRaceCourse&id="+eventid+"&race_id="+race_id);
	
	var request : WWW = new WWW(serviceUrl+"event.php?mode=getRaceCourse&id="+eventid+"&race_id="+race_id);
	
	yield request;
	
	//Debug.Log ("---<"+request.text);
	
	coursedata = request.text;
	coursedata = eval ('(' + request.text + ')');
	
	//Debug.Log ("--->"+serviceUrl+"getrace3d.php?id="+race_id);
	
	var request1 : WWW = new WWW(serviceUrl+"getrace3d.php?id="+race_id);	
	
	yield request1;
	
	
	//Debug.Log ("---<"+request1.text);
	marker = null;
	marker  = request1.text;
	marker = eval ('(' + request1.text + ')');
	var racestart = parseFloat(marker["start"])- parseFloat(eventdata["start_time"]);
	
	request = null;
	request1 = null;
	// boats

	
	for (var userdata in marker["users"])
		{
		
			//Debug.Log("boat: "+userdata["user_id"]);
			
			var userboat:GameObject;
			
			if (external_class!=null) eventdata["class"] = external_class;
			
			if (eventdata["class"]=="470") userboat = Instantiate(templateBoat_470);
			else if (eventdata["class"]=="optimist") userboat = Instantiate(templateBoat_optimist);
			else userboat = Instantiate(templateBoat_other);
			
			var userboatdata:boatdata = userboat.GetComponent(boatdata); 
			userboatdata.eventid = parseInt(eventid);
			userboatdata.race_id = parseInt(race_id);
			userboatdata.userid = parseInt(userdata["user_id"]);
			userboatdata.latitude = parseFloat(marker["center"]["latitude"]);
			userboatdata.longitude = parseFloat(marker["center"]["longitude"]);
			//userboatdata.utftime = 1311411600;
			userboatdata.utftime = parseFloat(eventdata["start_time"]);
			//parseFloat(eventdata["race"][0]["start_time"])- racetimestart;
			userboatdata.boatName = userdata["boatname"];
			userboatdata.boatIndex = boats.length;
			userboat.name = userdata["boatname"];
			//userboatdata.positionX = boats.length*20;
			//userboatdata.positionY = boats.length*20;
			//userboatdata.positionR = wind.transform.localRotation.eulerAngles.y;
			userboatdata.CleanData(); 
			userboatdata.InitRoute(coursedata["course"]);
			userboatdata.InitWind(marker["wind"]);
			//userboatdata.LoadRouteInfo(0,0);
			//userboatdata.LoadData(0);

			if(userboat.name in boatsEntry.Values == false)
			{
			boatsEntry.Add(boatsEntry.Count, userboat.name);
			boatsorder.push(boatsorder.length);
			boats.push(userboat);			 
			}
	
			if (userdata["instant"]!=null)
			{
				if (parseFloat(userdata["instant"])>0)
				{
					if ((parseFloat(eventdata["current_time"])-parseFloat(userdata["instant"]))<600)
					{
						isinstant = true;
						
					}
				}
			}

		}	
	firstboatindex = -1;
	firstboatsailed = 0;
	firstboatrouteindex = -1;
	firstboatroutetime = 0;
	
	results = new Hashtable();
	playtime = racestart-60;
	

	//course
	for (var idxr = 0; idxr < coursedata["course"].length; idxr++) 
	{
		var routedata = coursedata["course"][idxr];
		
		if (routedata["type"]=="start")
		{
			var sleft = marker["marks"][parseInt(routedata["right_id"])];
			var sright = marker["marks"][parseInt(routedata["left_id"])];
			make_line_between_marks(sleft,sright,"startline", 0, 5);
		}
		
		if (routedata["type"]=="finish")
		{
			var fleft = marker["marks"][parseInt(routedata["right_id"])];
			var fright = marker["marks"][parseInt(routedata["left_id"])];
			make_line_between_marks(fleft,fright,"finishline", 0, 5);
		}
	}	
	
	// marks
	for (var idxm = 0; idxm < marker["marks"].length; idxm++) 
	{
		var markdata = marker["marks"][idxm];
		
		var mark = Instantiate(templateMark);
        mark.transform.position.x = markdata["x"]/2;
        mark.transform.position.y = -2;
        mark.transform.position.z = markdata["y"]/2;
        
        mark_objects.push(mark);
        mark_indexes.push(-1);
	}
	
	//first line
	if (marker["marks"].length > 1)
	{
		firstline = make_line_between_marks(marker["marks"][0],marker["marks"][1],"firstline",0.4,1);
		firstline.active = false;
	}
	
	// wind
	var wind:GameObject = GameObject.Find("navigator/wind");
	if (windindex<marker["wind"].length)
	{
		wind.transform.localRotation.eulerAngles.y = parseFloat(marker["wind"][windindex]["direction"]);
		
		// and camera 
		var camera:GameObject = GameObject.Find("navigator/camera");
		var cameracontrolscript:cameracontrol = camera.GetComponent(cameracontrol);
		cameracontrolscript.RotateTo(wind.transform.localRotation.eulerAngles.y);
	}
	else
	{
		wind.active = false;
	}
	if (firstline!=null)
	{
		firstline.active = false;
	}
	//Debug.Log ("LoadRace "+race_id+" "+racestart);
	
	for (var idxmm = 0; idxmm < mark_indexes.Count; idxmm++)
	{
		mark_indexes[idxmm] = -1;
	}	
	
	
	for (var idx = 0; idx < boatsorder.Count; idx++)
	{
		var boat : GameObject = boats[boatsorder[idx]];
		var boatdatascript:boatdata = boat.GetComponent(boatdata); 
 		
 		//boatdatascript.eventid = parseInt(eventid);
		//boatdatascript.race_id = parseInt(race_id);
 		boatdatascript.CleanData(); 
 		boatdatascript.InitRoute(coursedata["course"]);
 		boatdatascript.InitWind(marker["wind"]);
 		//boatdatascript.LoadRouteInfo(racestart-60,0);
		boatdatascript.LoadData(racestart-60);

	}
	
	
	
}	 

function LoadRace(index) 
{
	raceindex = index;
	race_id = eventdata["race"][index]["id"];
	eventid = 	eventdata["id"];
	var starttime:int = parseFloat(eventdata["race"][index]["start_time"])- parseFloat(eventdata["start_time"]);
	// parseFloat(eventdata["start_time"]);
	racetimestart = starttime;
	windindex = 0;
	
	
	LoadCourse(eventid, race_id);

	
	
	
	
	/*for (var idx = 0; idx < boats.Count; idx++)
	{
		var boat : GameObject = boats[idx];
		var boatdatascript:boatdata = boat.GetComponent(boatdata); 
 		
 		//boatdatascript.eventid = parseInt(eventid);
		//boatdatascript.race_id = parseInt(race_id);
 		boatdatascript.CleanData(); 
 		boatdatascript.InitRoute(coursedata["course"]);
 		boatdatascript.InitWind(marker["wind"]);
 		boatdatascript.LoadRouteInfo(starttime-60,0);
		boatdatascript.LoadData(starttime-60);
	} */
	
}


function OnGUI() 
{
	
	if (eventdata==null)
	{
		GUI.Box( Rect(0,0, Screen.width,Screen.height),"");
		GUI.Box( Rect(0,0, Screen.width,Screen.height),"");
	
		GUI.Label( Rect(Screen.width/2-300,Screen.height/2-100,600,40), "Loading",startFont);
		
		return;
	}
	
	// update timer
	if ((isinstant==true)&&(isinstantedge==true))
	{
		speedfactor = 1;
		Time.timeScale = 1;
	}
	
	// player speed
	GUI.Box( Rect(195,Screen.height-50,Screen.width-390,45),"");
	GUI.HorizontalSlider (Rect (200, Screen.height-20, Screen.width-400, 10), playtime, 0.0, eventtime);
	
	// races
	if (eventdata["race"].length>0)
	{
		var racename="Race";
		if (raceindex >= 0) racename=eventdata["race"][raceindex]["course_name"];//NEW - course_name to fleet_name
		if (GUI.Button (Rect (200,Screen.height-45,110,20), racename)) 
		{
			if (eventdata["race"].length>0)
			{
				if (onracemenu==0) onracemenu = 1;
				else onracemenu = 0;
			}
		}
	}
	else
	{
		GUI.skin.label.alignment = TextAnchor.MiddleCenter;
		GUI.Label( Rect (200,Screen.height-45,110,20), "Playing");
		
	}
	if (onracemenu==1)
	{
		GUI.Box( Rect(195,Screen.height-52-eventdata["race"].length*20,120,eventdata["race"].length*20),"");
		for (var idxr = 0; idxr < eventdata["race"].length; idxr++) 
		{
			if (raceindex == idxr)
			{
				GUI.Toggle( Rect(200,Screen.height-52-20*(eventdata["race"].length-idxr),120,20), true, eventdata["race"][idxr]["course_name"]);
			}
			else
			{
				if (GUI.Toggle( Rect(200,Screen.height-52-20*(eventdata["race"].length-idxr),120,20), false, eventdata["race"][idxr]["course_name"]))
				{
					LoadRace(idxr);
					
					onracemenu = 0;
				}
			}
		}
	}
	// slower
	if (GUI.Button (Rect (322,Screen.height-45,30,20), buttonSlow)) 
	{
		if (speedfactor > 1) speedfactor = speedfactor / 2;
		Time.timeScale = speedfactor;
	}
	// play/pause
	if (Time.timeScale == 0)
	{
		if (GUI.Button (Rect (354,Screen.height-45,30,20), buttonPlay)) 
		{
			Time.timeScale = speedfactor;
		}
	}
	else
	{
		if (GUI.Button (Rect (354,Screen.height-45,30,20), buttonPause)) 
		{
			Time.timeScale = 0;
		}
	}  
	// faster
	if (GUI.Button (Rect (386,Screen.height-45,30,20), buttonFast)) 
	{
		if (speedfactor < 32) speedfactor = speedfactor * 2;
		Time.timeScale = speedfactor;
	}
	// time
	GUI.skin.label.alignment = TextAnchor.MiddleLeft;
	GUI.Label( Rect (420,Screen.height-45,80,20), FormatTime(Mathf.FloorToInt(playtime)), startFont);
	GUI.Label( Rect (500,Screen.height-45,40,20), speedfactor +"x", startFont);
	
	// start time
	if ((playtime > racetimestart-60)&&(playtime < racetimestart))
	{
		
		GUI.skin.label.alignment = TextAnchor.MiddleRight;
		GUI.skin.label.fontSize = 13;
		GUI.Label( Rect(Screen.width-305,Screen.height-45,100,20), FormatTime(racetimestart-playtime),startFont);
	}	
	
	
/*	// Fleet
	if (eventdata["race"].length>0)
	{
	scrollPosition = GUILayout.BeginScrollView (scrollPosition, GUILayout.Width(Screen.width*27/160));
	for (var idxbf = 0; idxbf < eventdata["race"].length; idxbf++) 
		{
			var fleet_group = new Array();
		var fleetname="Fleet";
		if (raceindex >= 0) fleetname=eventdata["race"][idxbf]["fleet_name"];
		//var fleetId = eventdata["race"][idxbf]["fleet_id"];
			
		if (GUILayout.Button (fleetname, GUILayout.ExpandHeight(true))) 
		//if (GUI.Button (Rect (100,25*(eventdata["race"].length-idxbf),120,20), fleetname))
		{
		if (raceindex == idxbf)
			{
		if (onfleetmenu==0) onfleetmenu = 1;
		else onfleetmenu = 0;

			}
			}
			if (onfleetmenu==1){
		var fleetId = eventdata["race"][idxbf]["fleet_id"];
		for(var x in eventdata["users"].Values)
				{
					if (x["fleet_id"] == fleetId)
					{
				for(var y in boatsEntry)
			{
			if (x["boatname"] == y.Value)
			{
			var id = y.Key ;
			
			var thisboat:GameObject = boats[boatsorder[id]];
			var thisboatdatascript:boatdata = thisboat.GetComponent(boatdata);
			 
			var toggleb = false;
			if (cameraboatindex == boatsorder[id]) toggleb = true;  
					//Debug.Log("----->"+boatsEntry.ContainsValue);
					//GUILayout.Box(x["boatname"]);
					//GUI.skin.label.alignment = TextAnchor.MiddleLeft;
				 GUILayout .BeginHorizontal ();	
			//GUI.color = Color.red; 
				GUI.skin.toggle.normal.textColor = Color.black;
					if(GUILayout.Toggle(toggleb, x["boatname"]))
					{cameraboatindex = boatsorder[id];}
					GUI.skin.label.alignment = TextAnchor.MiddleRight;
			GUI.skin.label.normal.textColor = Color.black;
			GUILayout.Label(thisboatdatascript.routeFirstlineDistance.ToString("f0")+"m");
			//Debug.Log("Results:"+results[boatsorder[id]]["timediff"]+"s");
			if (typeof(results[boatsorder[id]]))
			{
				GUILayout.Label(results[boatsorder[id]]["timediff"]+"s");
			}
			GUILayout .EndHorizontal ();
				}
				}	
				}	
					
	}
				}
				
		}GUILayout.EndScrollView ();
	}
	else
	{
		GUI.skin.label.alignment = TextAnchor.MiddleCenter;
		GUI.Label( Rect (100,Screen.height-45,110,20), "Playing");
		
	}

	//}
	

	
	//compass
	if (cameraboatindex < boatsorder.length)
	{
		var boat : GameObject = boats[cameraboatindex];
		var boatdatascript:boatdata = boat.GetComponent(boatdata); 
		
		
		
		Gadget(compassGrid,Screen.width-97.5,Screen.height-197.5,140,140,0-boat.transform.rotation.eulerAngles.y);
		
		Gadget(compassLine,Screen.width-97.5,Screen.height-197.5,140,140,86);
		Gadget(compassLine,Screen.width-97.5,Screen.height-197.5,140,140,86/2);
		Gadget(compassLine,Screen.width-97.5,Screen.height-197.5,140,140,-86);
		Gadget(compassLine,Screen.width-97.5,Screen.height-197.5,140,140,-86/2);
		
		Gadget(compassBoat,Screen.width-97.5,Screen.height-197.5,140,140,0);
		if (boatdatascript.routeIndex>=0)
		{
			Gadget(compassMark,Screen.width-97.5,Screen.height-197.5,170,170,boatdatascript.markDirection);
		}
		
		var speed:float = boatdatascript.boatSpeed * 1.9438612860586; 
		GUI.Box( Rect(Screen.width-190,Screen.height-100,185,20),"");
		GUI.skin.label.alignment = TextAnchor.MiddleLeft;
		GUI.Label( Rect(Screen.width-185,Screen.height-100,170,20),"Speed (kn)");
		GUI.skin.label.alignment = TextAnchor.MiddleRight;
		GUI.Label( Rect(Screen.width-185,Screen.height-100,170,20),speed.ToString("f1"));
	
		var vmg:float = boatdatascript.boatVmg * 1.9438612860586; 
		GUI.Box( Rect(Screen.width-190,Screen.height-75,185,20),"");
		GUI.skin.label.alignment = TextAnchor.MiddleLeft;
		GUI.Label( Rect(Screen.width-185,Screen.height-75,170,20),"VMG (kn)");
		GUI.skin.label.alignment = TextAnchor.MiddleRight;
		GUI.Label( Rect(Screen.width-185,Screen.height-75,170,20),vmg.ToString("f1"));
		
		var distanceToMark:float = boatdatascript.routeC;
		GUI.Box( Rect(Screen.width-190,Screen.height-50,185,20),"");
		GUI.skin.label.alignment = TextAnchor.MiddleLeft;
		if ((distanceToMark >0) && (distanceToMark < 500))
		{
			GUI.Label( Rect(Screen.width-185,Screen.height-50,170,20),"Mark (m)");
			GUI.skin.label.alignment = TextAnchor.MiddleRight;
			GUI.Label( Rect(Screen.width-185,Screen.height-50,170,20),distanceToMark.ToString("f0"));
		}
		else
		{
			distanceToMark = distanceToMark * 0.00053995680345572;
			GUI.Label( Rect(Screen.width-185,Screen.height-50,170,20),"Mark (NM)");
			GUI.skin.label.alignment = TextAnchor.MiddleRight;
			GUI.Label( Rect(Screen.width-185,Screen.height-50,170,20),distanceToMark.ToString("f2"));
		}
		
		GUI.Box( Rect(Screen.width-190,Screen.height-25,185,20),"");
		GUI.skin.label.alignment = TextAnchor.MiddleLeft;
		GUI.Label( Rect(Screen.width-185,Screen.height-25,170,20),"Heading");
		GUI.skin.label.alignment = TextAnchor.MiddleRight;
		GUI.Label( Rect(Screen.width-185,Screen.height-25,170,20),boatdatascript.boatDirection.ToString("f0"));
		
	
	} */
	
	// show intro on start
	if (toc==0)
	{
		GUI.Box( Rect(0,0, Screen.width,Screen.height),"");
		GUI.Box( Rect(0,0, Screen.width,Screen.height),"");
	
		
		GUI.Label( Rect(Screen.width/2-300,Screen.height/2-100,600,40), eventdata["name"],startFont);
		GUI.Label( Rect(Screen.width/2-300,Screen.height/2-60,600,40), eventdata["location"]+", "+eventdata["country"],startFont);
		
		// races//fleet 
	var raceGroup_index : int = -1;
	var fleet_counter = {};
	 var raceGroup : ArrayList = new ArrayList();
	for (var idxtr = 0; idxtr < eventdata["race"].length; idxtr++)
  	{
	   var fleet_id = eventdata["race"][idxtr]["fleet_id"];
	   var fleet_name = eventdata["race"][idxtr]["fleet_name"];
   	if (fleet_name=="") fleet_name = "Fleet "+fleet_id;
   	if(fleet_id in fleet_counter) 
   	{
    	fleet_counter[fleet_id] = fleet_counter[fleet_id] + 1;
   	} 
   	else
   	{
 		fleet_counter[fleet_id] = 1;
   	}
  
   raceGroup.Add(' Race ' + fleet_counter[fleet_id] + ' - ' + fleet_name);

   }
    
   GUILayout.BeginArea(new Rect(Screen.width/2-300, 320, 600, Screen.height));
   if(eventdata["race"].length > 4)
    {
   raceGroup_index = GUILayout.SelectionGrid( raceGroup_index, raceGroup.ToArray(String),2);}
   else raceGroup_index = GUILayout.SelectionGrid( raceGroup_index, raceGroup.ToArray(String),1);
    GUILayout.EndArea();
    if(raceGroup_index>-1)
   	//if (GUI.Button( Rect(Screen.width/2-100,Screen.height/2-20+50*selGridInt,200,40), selStrings[idxtr]))
	{
		//race_id = eventdata["race"][idxtr]["id"];
		//eventid = 	eventdata["id"];
		//LoadCourse(eventid, race_id);
		LoadRace(raceGroup_index);
		Time.timeScale = speedfactor;
		toc = 1;
	}
	
 
		if (eventdata["race"].length==0)
		{
			if (GUI.Button( Rect(Screen.width/2-100,Screen.height/2-20,200,40), "Start"))
			{
				var start_time = 0;
				
				for (var idxo = 0; idxo < boats.Count; idxo++) 
				{
					var boat_start_time = GetBoatDataStartTime(idxo);
					if (start_time==0)
					{
						start_time = boat_start_time;
					}
					else
					{
						if (boat_start_time < start_time)
						{
							start_time = boat_start_time;
						}
					}
				}
				playtime = start_time;
				Time.timeScale = speedfactor;
				toc = 1;
			}
		}
		
	
	}
	
} 

function GetBoatDataStartTime(boatindex)
{
	var boat : GameObject = boats[boatindex];
	var boatdatascript:boatdata = boat.GetComponent(boatdata); 
	return boatdatascript.GetDataStartTime();
	
}

function Gadget(gadget,cx,cy,width,height,angle)
{
	var mback:Matrix4x4  = GUI.matrix;
	var centerpos:Vector2 = Vector2(cx,cy);
	GUIUtility.RotateAroundPivot(angle, centerpos);
	var gadgetrect:Rect = Rect(cx-width/2,cy-height/2,width,height);
	GUI.DrawTexture(gadgetrect, gadget);      
	GUI.matrix = mback;
}

function FormatTime(timeInSeconds:int)
{
	var minus = false;
	if (timeInSeconds<0)
	{
		minus = true;
		timeInSeconds = 0-timeInSeconds;
	}
	var hours:int = timeInSeconds / 3600 ;
	var minutes:int = (timeInSeconds - hours*3600) / 60 ;
	var seconds:int = timeInSeconds - (hours*3600 + minutes * 60);
	
	var strHours = hours.ToString();
	var strMinutes = minutes.ToString();
	var strSeconds = seconds.ToString();
	
	if (hours < 10) strHours = "0"+strHours;  
	if (minutes < 10) strMinutes = "0"+strMinutes;
	if (seconds < 10) strSeconds = "0"+strSeconds;
	
	if (minus==true) return "-"+strHours+":"+strMinutes+":"+strSeconds;
	else return strHours+":"+strMinutes+":"+strSeconds;
}

function make_line_between_marks(left,right,name,height,size):GameObject
{
	var x1:float = parseFloat(left["x"])/2;
	var y1:float = parseFloat(left["y"])/2;
	var x2:float = parseFloat(right["x"])/2;
	var y2:float = parseFloat(right["y"])/2;
	
	var midx:float = (x1+x2)/2;
	var midy:float = (y1+y2)/2;
					
	var line = Instantiate(templateRaceLine);
        
    line.name = name;
    line.transform.position.x = midx;
    line.transform.position.y = -2.5 + height;
    line.transform.position.z = midy;
 
    line.transform.localScale.x = 0.01 * size;
    line.transform.localScale.y = 1;
    line.transform.localScale.z = getdistance_between_points(x1,y1,x2,y2)/10;
    line.transform.Rotate(Vector3(0,1,0),-getdirection_between_points(x1,y1,x2,y2)-90);
    
    return line;
}

function getdistance_between_points(x1,y1,x2,y2):float
{
	
	var difx:float = x2 - x1;
	var dify:float = y2 - y1;
	
	return Mathf.Sqrt(difx*difx + dify*dify);
}

function getdirection_between_points(x1,y1,x2,y2):float
{
	
	var difx:float = x2 - x1;
	var dify:float = y2 - y1;
	if (difx==0)
	{
		if (dify>=0) return 0;
		else return 180;
	}
	if (dify==0)
	{
		if (difx>=0) return 90;
		else return -90;
	}
	else return Mathf.Atan(dify/difx)*Mathf.Rad2Deg;
}

function redraw_grid()
{
	var navigator = GameObject.Find("navigator");

	for (var line : GameObject in grid_horizontal)
	{
		//line.transform.position.x = navigator.transform.position.x;
		if (line.transform.position.x + 25 < navigator.transform.position.x) line.transform.position.x += 25;
		if (line.transform.position.x - 25 > navigator.transform.position.x) line.transform.position.x -= 25;	
		
		
		//if (line.transform.position.z + 175 < navigator.transform.position.z) line.transform.position.z += 325;
		//if (line.transform.position.z - 175 > navigator.transform.position.z) line.transform.position.z -= 325;	
		if (line.transform.position.z + (grid_number*25+25) < navigator.transform.position.z) line.transform.position.z += (grid_number*50+25);
		if (line.transform.position.z - (grid_number*25+25) > navigator.transform.position.z) line.transform.position.z -= (grid_number*50+25);	
		
	} 
	
	for (var line : GameObject in grid_vertical)
	{
		//line.transform.position.z = navigator.transform.position.z;
		if (line.transform.position.z + 25 < navigator.transform.position.z) line.transform.position.z += 25;
		if (line.transform.position.z - 25 > navigator.transform.position.z) line.transform.position.z -= 25;
		
		//if (line.transform.position.x + 175 < navigator.transform.position.x) line.transform.position.x += 325;
		//if (line.transform.position.x - 175 > navigator.transform.position.x) line.transform.position.x -= 325;
		if (line.transform.position.x + (grid_number*25+25) < navigator.transform.position.x) line.transform.position.x += (grid_number*50+25);
		if (line.transform.position.x - (grid_number*25+25) > navigator.transform.position.x) line.transform.position.x -= (grid_number*50+25);
		
	} 
	
}

/*function GetMarkVector(iMarkIndex):Vector2
{
	var markdata = marker["marks"][iMarkIndex];
	var index:int = mark_indexes[iMarkIndex];
	
	for (var idxb = 0; idxb < boatsorder.Count; idxb++) 
		{
			var thisboat:GameObject = boats[boatsorder[idxb]];
			var thisboatdatascript:boatdata = thisboat.GetComponent(boatdata);
			
	if ((index>-1)&&(index<thisboatdatascript.track_data.length))
	{
		//Debug.Log ("==zzz=="+iMarkIndex+": "+index);
		return Vector2(thisboatdatascript.track_data[index]["x"],thisboatdatascript.track_data[index]["y"]);
	}
	else
	{
		return Vector2(markdata["x"],markdata["y"]);
	}	
}*/

function redraw_marks()
{	
	for (var idxm = 0; idxm < mark_objects.Count; idxm++)
	{
		var mark : GameObject  = mark_objects[idxm];
		var index : int  = mark_indexes[idxm];
		//Debug.Log ("==zzz== Index: "+index);
		//var data = marker["marks"][idxm];
		//if (index+1<data.length)
		//{
			var marktime = parseFloat(marker["timestamp"]);
			if (playtime > marktime)
			{
				index = index + 1;
				mark_indexes[idxm] = index;
				
				mark.transform.position.x = marker["marks"][idxm]["x"]/2;
        		mark.transform.position.z = marker["marks"][idxm]["y"]/2;
          
				//Debug.Log ("==UPM=="+idxm+": "+index+"/"+data.length+" "+data[index]["x"]+"x"+data[index]["y"]);
			//}
		}
		
	} 
}