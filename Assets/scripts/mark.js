var zonesize = 0;
var zonedisplay = 0;

function Start () 
{
	var zone:GameObject = transform.Find("zone").gameObject;
	zone.transform.localScale.x = 0;
	zone.transform.localScale.z = 0;
}

function Update () 
{
	
	
	// check boat distance and display zone
	
	zonedisplay = 0;
	zonesize = 0;
	
	var controller:GameObject = GameObject.Find("controller");
 	var controllerscript:startup = controller.GetComponent(startup);
 	
 	for (var boat in controllerscript.boats)
	{
		var boatdatascript:boatdata = boat.GetComponent(boatdata);
		if (boatdatascript.routeIndex>=0)
		{
			var distance = Mathf.Abs(Mathf.Sqrt(Mathf.Pow(transform.position.x-boat.transform.position.x, 2) + Mathf.Pow(transform.position.z-boat.transform.position.z, 2)));
			if (distance/2 < boatdatascript.boatLength*2)
			{
				zonedisplay = 1;
				if (zonesize < boatdatascript.boatLength*3)
				{
					zonesize = boatdatascript.boatLength*3;
				}
			}
		}	
	}
	var zone:GameObject = transform.Find("zone").gameObject;
	
	if (zonedisplay==1)
	{
		zone.active = true;
		zone.transform.localScale.x = zonesize*2;
		zone.transform.localScale.z = zonesize*2;
	}
	else
	{
		zone.active = false;
	}
}