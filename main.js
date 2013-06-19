var KEYCODE_SPACE = 32;
var KEYCODE_UP    = 38;
var KEYCODE_LEFT  = 37;
var KEYCODE_RIGHT = 39;
var KEYCODE_W     = 87;
var KEYCODE_A     = 65;
var KEYCODE_D     = 68;
var KEYCODE_F     = 70;

var FIELD_WIDTH = 1024;
var FIELD_HEIGHT = 500;

var Yoshi;
var contentManager;
var stage;
var canvas;
var context;
var goalPole;
var field;

// 雪
var snows = new createjs.Container();
var snowInterval    = 1; // このカウント毎に雪を精製
var intervalCounter = 0;
var snowLimit       = 300;    // 雪がこれ以上の数になると生成を中止

var manager;
var box2d;



// -------------------------- //
// --- jQuery initializer --- //
$(function() {
	// setup functions to run once page is loaded
	init();
});




// keyboard setting
document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;



function init() {
	// Easel
	canvas = document.getElementById("canvas");
	context = canvas.getContext('2d');
	stage = new createjs.Stage(canvas);


	// load all images
	contentManager = new ContentManager();
	contentManager.SetDownloadCompleted(downloadCompleted);
	contentManager.loadAllImages();

	stage.addChild(snows);

	// 爆破効果（？）のセットアップ
	//explosion(100, 100);
	stage.addEventListener("stagemousedown", function(event) {
		explosion(event.stageX - stage.x, event.stageY + stage.y);
		//createBirdObject();
	});
}


// -------------------------- //
// --- Game's Initializer --- //
function downloadCompleted() {

	// GameManager
	manager = new GameManager(stage);
	box2d = manager.getPhysics();
	//box2d.setup();
	manager.createField(1);

	// Create Yoshi object
/*	Yoshi = new Player(contentManager.imgPlayer, FIELD_WIDTH);
	Yoshi.isIdle = true;
	Yoshi.gotoAndPlay("stand");
	Yoshi.x = FIELD_WIDTH / 2;
	Yoshi.y = FIELD_HEIGHT - (34 * 0.5); 
	*/
	//Yoshi.x = 2724;
	//Yoshi.y = 82;
	//Yoshi.regX = 17;
	//Yoshi.regY = 17;


	// Create Yoshi Collicion Object
	//box2d.createPlayer(Yoshi);
	//stage.addChild(Yoshi);

	Yoshi = manager.getPlayer();

	createjs.Ticker.addListener(window);
	createjs.Ticker.useRAF = true;
	//createjs.Ticker.setFPS(60);



	// ----------------------------
	// Effects

	// クリックでくっついてくる様に見える
	var blurCircle  = new Effects("BlurredCircle", 150, 150, 60, "#0ff");
	stage.addChild(blurCircle);

	var myCircle = new createjs.Container();

	// ただのぼかし丸
	var tweenCircle = new Effects("BounceBlurredCircle", 0, -50, 100, "#0f0");
	//stage.addChild(tweenCircle);
	var tweenCircle2 = new Effects("BounceBlurredCircle", 50, 50, 100, "#00f");
	//stage.addChild(tweenCircle2);
	var tweenCircle3 = new Effects("BounceBlurredCircle", -50, 50, 100, "#f00");
	//stage.addChild(tweenCircle3);

	myCircle.addChild(tweenCircle);
	myCircle.addChild(tweenCircle2);
	myCircle.addChild(tweenCircle3);

	stage.addChild(myCircle);

	myCircle.x = 300;
	myCircle.y = 300;

	var tween = createjs.Tween.get(myCircle, {loop:true})
		.to({rotation: -360}, 2500, createjs.Ease.linear);

	//tween.wait(1000);
	//tween.to({scaleX: 2, scaleY: 2}, 1000, createjs.Ease.linear);

	// ただの丸
	var circle = new Effects("Circle", 500, 100, 60, "#00F");
	stage.addChild(circle);

	// 星の作成
	// x, y, radius, color, sharp_num, 窪み具合
	var star = new Effects("Star", 500, 400, 50, "#f00", 5, 2);
	stage.addChild(star);

	// 魔方陣
	var magicSquare = new Effects("MagicSquare", 700, 400, 50, "#ff0", 5, 2);
	stage.addChild(magicSquare);
}


// ------------------ //
// --- keyhandler --- //s
function handleKeyDown(e) {
	if(Yoshi.isDied) return;

	if(!e) { var e = window.event; }
	switch(e.keyCode) {
		case KEYCODE_F:
			var cannon = new Cannon(stage, Yoshi.x, Yoshi.y, Yoshi.direction);
			stage.addChild(cannon);

		break;
		case KEYCODE_SPACE:
			if(!Yoshi.isJumping) {
				if(Yoshi.direction > 0) {
					Yoshi.gotoAndPlay("jump");
				} else {
					Yoshi.gotoAndPlay("jump_h");
				}
				Yoshi.isJumping = true;
				box2d.jump();
			}
			break;
		case KEYCODE_RIGHT:
			if(Yoshi.isIdle) {
				if(!Yoshi.isJumping) {
					Yoshi.gotoAndPlay("run");
				}
				Yoshi.isRunning = true;
				Yoshi.direction = 1;
				Yoshi.isIdle = false;
				Yoshi.isWalkingRight = true;
				Yoshi.isStop = false;
				//box2d.moveRight();
			}
			break;
		case KEYCODE_LEFT:
			if(Yoshi.isIdle) {
				if(!Yoshi.isJumping) {
					Yoshi.gotoAndPlay("run_h");
				}
				Yoshi.isRunning = true;
				Yoshi.direction = -1;
				Yoshi.isIdle = false;
				Yoshi.isWalkingLeft = true;
				Yoshi.isStop = false;
				//box2d.moveLeft();
			}
			break;
	}
}
function handleKeyUp(e) {
	if(Yoshi.isDied) return;

	if(!e) { var e = window.event; }
	switch(e.keyCode) {
		case KEYCODE_RIGHT:
		case KEYCODE_LEFT:
			Yoshi.isIdle = true;
			if(Yoshi.direction > 0) {
				Yoshi.gotoAndPlay("stand");
			} else {
				Yoshi.gotoAndPlay("stand_h");
			}
			Yoshi.isWalkingLeft = false;
			Yoshi.isWalkingRight = false;
			Yoshi.isStop = true;
			box2d.stop();
			break;
		case KEYCODE_SPACE:
			if(Yoshi.isJumping && !Yoshi.stopJumping) {
				Yoshi.stopJumping = true;	
			}
			break;
	}
}

// -------------- //
// --- Ticker --- //
function tick(event) {
	var snows_count = snows.getNumChildren();

	// generate snow
	if((snows_count < snowLimit) && (intervalCounter == snowInterval)) {
		createSnow();
		intervalCounter = 0;
	} else if(snows_count >= snowLimit) {
		intervalCounter = 0;
	}
	intervalCounter++;

	// collision detection
	/*for(var i = 0; i < snows_count; i++) {
		var snow = snows.getChildAt(i);	
		var pt = snow.localToLocal(0, 0, Yoshi);
		if(!Yoshi.isDied && Yoshi.hitTest(pt.x, pt.y)) {
			explosion(Yoshi.x, Yoshi.y);
			Yoshi.isDied = true;
		}
	}*/

	// ゴールの判定
	var pt = Yoshi.localToLocal(0, 0, goalPole);
	if(goalPole.hitTest(pt.x, pt.y)) {
		Yoshi.isWalkingLeft = false;
		Yoshi.isWalkingRight = false;
		Yoshi.isStop = true;
		box2d.stop();
		Yoshi.isDied = true;
		manager.field.goal();	
	}

	// 床落ちの判定
	if(Yoshi.y > FIELD_HEIGHT) {
		Yoshi.isWalkingLeft = false;
		Yoshi.isWalkingRight = false;
		Yoshi.isStop = true;
		box2d.stop();
		Yoshi.isDied = true;
		console.log(Yoshi.y);
		manager.field.fail();
	}

	// カメラの動きをさせる
	stage.x = ((FIELD_WIDTH / 2) - Yoshi.x);
	snows.x = stage.x * -1;

	// 左右の移動
	if(Yoshi.isWalkingRight) { box2d.moveRight() }
	if(Yoshi.isWalkingLeft)  { box2d.moveLeft()  }

	Yoshi.tick();
	box2d.update();
	stage.update();
}



// ------------------------ //
// --- related to snows --- //
function createSnow()
{
	var snowLayerCount = 10;
	var snow = new createjs.Container();

	for(var i = 0; i < snowLayerCount; i++) {
		var snowLayer = new createjs.Shape();
		snowLayer.graphics.setStrokeStyle(5);
		snowLayer.graphics.beginFill('#ffffff');
		snowLayer.graphics.drawCircle(0, 0, (i+1) * 1);
		snowLayer.alpha = 1 - i * 0.4;
		snowLayer.x = 0;
		snowLayer.y = 0;

		snow.addChild(snowLayer);
		//stage.addChild(snow);
	}

	// 雪の位置を設定
	snow.x = Math.random() * 1024;
	snow.y = -1;

	// アニメーションを設定
	createjs.Tween.get(snow)
		.to({x: snow.x - 50, y: FIELD_HEIGHT + 10}, 10000, createjs.Ease.cubicIn)
		.call(snowTouchedGround, [snow]); 

	snows.addChild(snow);
}

// 雪が地面にタッチしたときに消す
function snowTouchedGround(snow)
{
	snows.removeChild(snow);
}

// 爆発のエフェクト	
function explosion(x, y)
{
	var baseLine = 5;
	var exp = new createjs.Container();
	
	for(var i = 0; i < 50; i++) {
		var layer = new createjs.Shape();
		layer.graphics.setStrokeStyle(5);
		layer.graphics.beginStroke('#ff3333');
		layer.graphics.drawCircle(0, 0, baseLine+((i+1)*0.1));
		layer.alpha = 0.05;
		layer.compositeOperation = "lighter";

		exp.addChild(layer);	
	}

	stage.addChild(exp);

	exp.x = x;
	exp.y = y;

	createjs.Tween.get(exp)
		.to({scaleX: 10, scaleY: 10, alpha: 0}, 800, createjs.Ease.linear)
		.call(afterExplosion, [exp]);
}

function afterExplosion(exp)
{
	stage.removeChild(exp);	

	//launchBeam(200, 200, 100);
}


function launchBeam(x, y, deg)
{
	var beam = new createjs.Container();

	for(var i = 0; i < 20; i++) {
		var layer = new createjs.Shape();
		layer.graphics.beginFill("blue");
		layer.regX = ( 50 * (i * 0.1) ) * 0.5;
		layer.regY = ( 3 * (i * 0.1) ) * 0.5;
		layer.graphics.drawRoundRect(0, 0, 50 * (i * 0.1), 3 * (i * 0.1), 10);
		layer.alpha = 0.09;
		//layer.rotation = deg;
		layer.compositeOperation = "lighter";

		beam.addChild(layer);
	}

	beam.x = 10;
	beam.y = y;

	createjs.Tween.get(beam)
		.to({x: 1024}, 1000, createjs.Ease.linear);

	stage.addChild(beam);
}




// create a bitmap object for box2d
function createBirdObject()
{
	var birdBMP = new createjs.Bitmap("bird.png");
	birdBMP.x = Math.random() * 500;
	birdBMP.y = 100;
	birdBMP.regX = 25;
	birdBMP.regY = 25;
	birdBMP.snapToPixel = true;
	birdBMP.mouseEnabled = false;
	stage.addChild(birdBMP);
	box2d.createBird(birdBMP);
}





function createExit(x, y)
{
	goalPole = new createjs.Bitmap("img/Exit.png");
	goalPole.x = x;
	goalPole.y = y;
	stage.addChild(goalPole);
}

