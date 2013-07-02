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

// 初期処理
function init() 
{

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
	/*
	stage.addEventListener("stagemousedown", function(event) {
		explosion(event.stageX - stage.x, event.stageY + stage.y);
		//createBirdObject();
	});
	*/
}



// -------------------------- //
// --- Game's Initializer --- //
//
// 全ての画像が読み込まれると呼ばれる
function downloadCompleted() 
{
	// GameManager
	manager = new GameManager(stage);
	box2d = manager.getPhysics();

	// フィールド1 の作成
	manager.createField(1);

	// Create Yoshi object
	Yoshi = manager.getPlayer();

	createjs.Ticker.addListener(window);
	createjs.Ticker.useRAF = true;
	//createjs.Ticker.setFPS(60);

	// keyboard setting
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
}



// ------------------ //
// --- keyhandler --- //
function handleKeyDown(e) 
{
	if(Yoshi.isDied) return;

	if(!e) { var e = window.event; }
	switch(e.keyCode) {
		case KEYCODE_F:
			var cannon = new Cannon(stage, Yoshi.x, Yoshi.y, Yoshi.direction);
			stage.addChild(cannon);
		break;
		case KEYCODE_SPACE:
			Yoshi.jump();
			break;
		case KEYCODE_RIGHT:
			Yoshi.runRight();
			break;
		case KEYCODE_LEFT:
			Yoshi.runLeft();
			break;
	}
}
function handleKeyUp(e) {
	if(Yoshi.isDied) return;
	if(!e) { var e = window.event; }
	switch(e.keyCode) {
		case KEYCODE_RIGHT:
		case KEYCODE_LEFT:
			Yoshi.stopRunning();
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

	// ゴールの判定
	var pt = Yoshi.localToLocal(0, 0, goalPole);
	if(goalPole.hitTest(pt.x, pt.y)) {
		Yoshi.goal();
		manager.field.goal();	
	}

	// 床落ちの判定
	if(Yoshi.y > FIELD_HEIGHT) {
		Yoshi.fail();
		manager.field.fail();
	}

	// カメラの動きをさせる
	stage.x = ((FIELD_WIDTH / 2) - Yoshi.x);
	snows.x = stage.x * -1;

	Yoshi.tick();
	box2d.update();
	stage.update();
}




















// ----- エフェクト ----- //


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
		.call(function(exp) {stage.removeChild(exp);console.log(exp);}, [exp]);
}

