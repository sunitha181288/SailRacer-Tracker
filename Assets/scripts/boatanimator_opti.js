private var sheet:float = 0;



function Start () 
{
	// name on sails
	var boatdatascript:boatdata = GetComponent(boatdata);
	
	var textleft:TextMesh = transform.Find("container/mainsail/object/textleft").gameObject.GetComponent(TextMesh);
	var textright:TextMesh = transform.Find("container/mainsail/object/textright").gameObject.GetComponent(TextMesh);
	
	textleft.text = boatdatascript.boatName;
	textright.text = boatdatascript.boatName;
	
	if(textleft.text.Length > 8) textleft.text = textleft.text.Substring(0,8);
	if(textright.text.Length > 8) textright.text = textright.text.Substring(0,8);
	
	var overlapback:GameObject = transform.Find("overlapback").gameObject;
	
	overlapback.active = false;
	
	boatdatascript.testanimationscript = this;
}

function ForceUpdate()
{
	var boatdatascript:boatdata = GetComponent(boatdata);
	
	transform.position.x = boatdatascript.positionX / 2;
	transform.position.z = boatdatascript.positionY / 2;
	transform.Rotate(Vector3(0,1,0),(boatdatascript.positionR - transform.eulerAngles.y));
	
	
	var controller:GameObject = GameObject.Find("controller");
 	var controllerscript:startup = controller.GetComponent(startup);
	
	// waves
	var waveleft:GameObject = transform.Find("waveleft").gameObject;
	var waveright:GameObject = transform.Find("waveright").gameObject;
	
	if (boatdatascript.boatSpeed > 0)
	{
		waveleft.particleEmitter.emit = true;
		waveleft.particleEmitter.minEmission = 12 * boatdatascript.boatSpeed;
		waveleft.particleEmitter.maxEmission = 12 * boatdatascript.boatSpeed;
		waveleft.particleEmitter.localVelocity = Vector3(-0.3 * boatdatascript.boatSpeed,0,0);
		
		waveright.particleEmitter.emit = true;
		waveright.particleEmitter.minEmission = 12 * boatdatascript.boatSpeed;
		waveright.particleEmitter.maxEmission = 12 * boatdatascript.boatSpeed;
		waveright.particleEmitter.localVelocity = Vector3(0.3 * boatdatascript.boatSpeed,0,0);
	}
	else
	{
		waveleft.particleEmitter.emit = false;
		waveright.particleEmitter.emit = false;
	}
	
	// heel
	
	var container:GameObject = transform.Find("container").gameObject;
	var boatHeel = boatdatascript.boatHeel;
	if (boatdatascript.boatSpinaker==1)
	{
		boatHeel = -15 * boatdatascript.boatSheetSide;
	}
	var heeldiff = boatHeel-container.transform.eulerAngles.z;
	if (heeldiff<0) heeldiff = 360 + heeldiff;
	if (heeldiff>180) heeldiff = heeldiff - 360;
			
	container.transform.Rotate(Vector3(0,0,1),heeldiff*Time.deltaTime);
	
	
	// sails
	
	var sheetdiff:float = (boatdatascript.boatSheet-sheet)*Time.deltaTime;
	if (sheetdiff<0) sheetdiff = 360 + sheetdiff;
	if (sheetdiff>180) sheetdiff = sheetdiff - 360;
	
	sheet = sheet + sheetdiff;
	if (sheet<0) sheet = 360 + sheet;
	if (sheet>180) sheet = sheet - 360;
	
	var mainsail:GameObject = transform.Find("container/mainsail/object").gameObject;
	
	if (boatdatascript.boatSpinaker==1)
	{
		mainsail.transform.localRotation.eulerAngles.y = sheet;
	}
	else
	{
		if (boatdatascript.boatBeating==1)
		{
			mainsail.transform.localRotation.eulerAngles.y = sheet;
		}
		else
		{
			mainsail.transform.localRotation.eulerAngles.y = sheet;
		}
	}
	
	var overlapback:GameObject = transform.Find("overlapback").gameObject;
	if (boatdatascript.overlaped == 1) overlapback.active = true;
	else overlapback.active = false;	
	
}