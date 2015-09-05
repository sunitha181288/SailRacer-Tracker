private var mode = "t";
transform.position = Vector3(0,160,-28);
transform.eulerAngles = Vector3(80,0,0);
private var lastPosition : Vector3;
private var zoomReset = 0;

function Start ()
{
	//transform.Translate(Vector3.back*12);
} 


function RotateTo(degrees)
{
	var navigator = GameObject.Find("navigator");
	var rdiff = degrees - transform.rotation.eulerAngles.y;
	
	transform.RotateAround(Vector3(navigator.transform.position.x,navigator.transform.position.y,navigator.transform.position.z), Vector3(0,1,0),rdiff);
	
}

function Update () 
{
	var navigator = GameObject.Find("navigator");
	
	// switch camera view mode
	if (Input.GetKey(UnityEngine.KeyCode.P) && mode=="t") {
		transform.position = Vector3(navigator.transform.position.x,5,navigator.transform.position.z-28);
		transform.eulerAngles = Vector3(10,0,0);
		zoomReset=0;
		mode = "p";
	}
	
	if (Input.GetKey(UnityEngine.KeyCode.T) && mode=="p") {
		transform.position = Vector3(navigator.transform.position.x,160,navigator.transform.position.z-28);
		transform.eulerAngles = Vector3(80,0,0);
		zoomReset=0;
		mode = "t";
	}
	
	// rotate
	
	if (Input.GetKey(UnityEngine.KeyCode.LeftArrow))
	{
		if (mode=="p")
		{
			transform.RotateAround(navigator.transform.position, Vector3.up,5);
		}
		else
		{
			transform.Translate(Vector3.left*5);
		}
	}

	if (Input.GetKey(UnityEngine.KeyCode.RightArrow))
	{
		if (mode=="p")
		{
			transform.RotateAround(navigator.transform.position, Vector3.up,-5);
		}
		else
		{
			transform.Translate(Vector3.right*5);
		}
	}
	
	// rotate and pan
	if (Input.GetMouseButtonDown(0))
	{
		lastPosition = Input.mousePosition;
	}
	
	if(Input.GetMouseButton(0)) 
	{
		if (mode=="p")
		{		
        	transform.RotateAround(navigator.transform.position, Vector3.up,Input.GetAxis("Mouse X")*5);
        }
        else
        {
        	var delta : Vector3 = Input.mousePosition - lastPosition;
        	transform.Translate(-delta.x, -delta.y, 0);
        	lastPosition = Input.mousePosition;      	
        }
	}
	
	if (Input.GetKey(UnityEngine.KeyCode.UpArrow)&&mode=="t")
	{
		transform.Translate(Vector3.up*5);
	}
	if (Input.GetKey(UnityEngine.KeyCode.DownArrow)&&mode=="t")
	{
		transform.Translate(Vector3.down*5);
	}

	// zoom
	
	if (Input.GetKey(UnityEngine.KeyCode.UpArrow)&&mode=="p"&&transform.position.y>2)
	{
		transform.Translate(Vector3.forward*(transform.position.y/10+0.2));
	}
	if (Input.GetKey(UnityEngine.KeyCode.DownArrow)&&mode=="p"&&transform.position.y<20)
	{
		transform.Translate(Vector3.back*(transform.position.y/10+0.2));
	}
	
	if (Input.GetAxis("Mouse ScrollWheel") < 0) // back
	{
	    if ((transform.position.y<160 && mode=="t")||(transform.position.y<20 && mode=="p"))
		{
			transform.Translate(Vector3.back*5);
		}
	}
	if (Input.GetAxis("Mouse ScrollWheel") > 0) // forward
	{
	    if ((transform.position.y>50 && mode=="t")||(transform.position.y>2 && mode=="p"))
		{
			transform.Translate(Vector3.forward*5);
		}
	}
	
	// zoom after clicking on a boat
	if (Input.GetMouseButtonDown (0)&&mode=="t") {
		var ray : Ray = Camera.main.ScreenPointToRay(Input.mousePosition);
		var hit : RaycastHit;
  		if (Physics.Raycast(ray, hit)) {
			zoomReset = 1;
  		}
  	}
	if (zoomReset==1)
	{
		var velocity = 0.0f;
		var newPosition : float = Mathf.SmoothDamp(transform.position.y, 50,velocity, 0.3f);
		transform.position = Vector3(transform.position.x, newPosition, transform.position.z);
		if (Input.GetAxis("Mouse ScrollWheel") < 0){zoomReset=0;}
	}

}

