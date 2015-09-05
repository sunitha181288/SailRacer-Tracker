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
	
	var overlapfront:GameObject = transform.Find("overlapfront").gameObject;
	var overlapback:GameObject = transform.Find("overlapback").gameObject;
	
	overlapfront.active = false;
	overlapback.active = false;
	
	boatdatascript.testanimationscript = this;
}

function ForceUpdate()
{
	var boatdatascript:boatdata = GetComponent(boatdata);
	
	transform.position.x = boatdatascript.positionX / 2;
	transform.position.z = boatdatascript.positionY / 2;
	transform.Rotate(Vector3(0,1,0),(boatdatascript.positionR - transform.eulerAngles.y));
	//transform.rotation.eulerAngles.y = boatdatascript.positionR;
	
	
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
	
	var heeldiff = boatdatascript.boatHeel-container.transform.eulerAngles.z;
	if (heeldiff<0) heeldiff = 360 + heeldiff;
	if (heeldiff>180) heeldiff = heeldiff - 360;
			
	//container.transform.Rotate(Vector3(0,0,1),heeldiff*Time.deltaTime*controllerscript.speedfactor);
	container.transform.Rotate(Vector3(0,0,1),heeldiff*Time.deltaTime);
	
	
	// sails
	
	//var sheetdiff:float = (boatdatascript.boatSheet-sheet)*Time.deltaTime*controllerscript.speedfactor;
	var sheetdiff:float = (boatdatascript.boatSheet-sheet)*Time.deltaTime;
	if (sheetdiff<0) sheetdiff = 360 + sheetdiff;
	if (sheetdiff>180) sheetdiff = sheetdiff - 360;
	
	sheet = sheet + sheetdiff;
	if (sheet<0) sheet = 360 + sheet;
	if (sheet>180) sheet = sheet - 360;
	
	var frontsail:GameObject = transform.Find("container/frontsail/object").gameObject;
	var mainsail:GameObject = transform.Find("container/mainsail/object").gameObject;
	
	if (boatdatascript.boatSpinaker==1)
	{
		frontsail.transform.localRotation.eulerAngles.y = sheet;
		mainsail.transform.localRotation.eulerAngles.y = sheet;
	}
	else
	{
		if (boatdatascript.boatBeating==1)
		{
			frontsail.transform.localRotation.eulerAngles.y = sheet;
			mainsail.transform.localRotation.eulerAngles.y = sheet/5;
		}
		else
		{
			frontsail.transform.localRotation.eulerAngles.y = sheet;
			mainsail.transform.localRotation.eulerAngles.y = sheet;
		}
	}
	
	// overlap
	//var overlapfront:GameObject = transform.Find("overlapfront").gameObject;
	//if (boatdatascript.overlapedAtFront==1) overlapfront.active = true;
	//else overlapfront.active = false;	
	
	var overlapback:GameObject = transform.Find("overlapback").gameObject;
	if (boatdatascript.overlaped == 1) overlapback.active = true;
	else overlapback.active = false;	
	
}