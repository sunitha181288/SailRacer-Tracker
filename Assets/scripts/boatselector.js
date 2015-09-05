@script RequireComponent(AudioSource)
 
var displaytime = 0;
var x = 0;
var y = 0;
private var switcher = 0;

function Start()
{
	displaytime = Time.time - 5;
	x = -1000;
	y = -1000;

}
function OnMouseEnter()
{
	if ((Time.time-displaytime)>1+Time.timeScale)
	{
		x = Input.mousePosition.x-50;
		y = Screen.height - Input.mousePosition.y - 60;
		displaytime = Time.time;
	}
}


function OnGUI()
{
	var boat:GameObject = transform.parent.gameObject;
	var boatdatascript:boatdata = boat.GetComponent(boatdata);
	
	var controller:GameObject = GameObject.Find("controller");
 	var controllerscript:startup = controller.GetComponent(startup);
	
	if ((Time.time-displaytime)<1+Time.timeScale)
	{
		GUI.Box( Rect(x,y,120,50),"");
		
		var speed:float = boatdatascript.boatSpeed * 1.9438612860586; 
		var vmg:float = boatdatascript.boatVmg * 1.9438612860586; 
		
		GUI.skin.label.alignment = TextAnchor.MiddleLeft;
		GUI.Label( Rect(x+5,y+0,100,20),boatdatascript.boatName);
		GUI.Label( Rect(x+5,y+15,100,20),"Speed "+speed.ToString("f1"));
		GUI.Label( Rect(x+5,y+30,100,20),"VMG "+vmg.ToString("f1"));
		
		if(Input.GetMouseButtonUp(0))
		{
			for(var x in controllerscript.boatsEntry)
			{
			if (boatdatascript.boatName == x.Value)
			{
			var id = x.Key ;
			
			controllerscript.cameraboatindex = controllerscript.boatsorder[id];
			
			audio.Play();
			
			//renderer.material.shader = Shader.Find ("Outlined/Silhouette Only");
			renderer.material.color.a = 1;
			switcher = 1;
			}
			}
		}
	}
}

function Update() {
	if(Input.GetMouseButtonDown(0) && switcher==1){
		//renderer.material.shader = Shader.Find ("Transparent/Bumped Diffuse");
		renderer.material.color.a = 0;
		switcher = 0;
	}
}