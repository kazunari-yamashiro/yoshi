(function (window) {

	//Cannon.prototype = new createjs.Container();

	// initializer
	function Cannon(stage, create_x, create_y, direction) {
		var endCount = 50;
		var stage_global;
		var removeCallbackMethod;
	
		var circleCount = 50;
		var tweens = [];
		var cannon = new createjs.Container();
		//this.endCount = 50; // このカウントが0になると消す

		// 玉を circleCount の分だけ作成する
		for( var i = 0; i < circleCount; i++) {
			// draw the circle, and put it on stage:
			var circle = new createjs.Shape();
			circle.graphics.setStrokeStyle(7);
			circle.graphics.beginFill("#113355");
			circle.graphics.drawCircle(0, 0, (i+1)*0.4);
			circle.alpha = 1 - i * 0.02;
			circle.x = Math.random() * 160 + create_x - 80;
			circle.y = Math.random() * 160 + create_y - 80;
			circle.compositeOperation = "lighter";

			var tween = createjs.Tween.get(circle).to({x: create_x, y: create_y}, /*(0.5+i*0.04)*1500*/i * 30, createjs.Ease.backIn);
			//this.tweens.push({tween:tween, ref:circle});
			//stage.addChild(circle);
			stage_global = stage;
			cannon.addChild(circle);
		}

		// 発射する
		createjs.Tween.get(cannon)
			.wait(1000)
			.to({x: 1024 * direction}, 500, createjs.Ease.getBackIn(0.9))
			.call(moveTweenComplete);

		function moveTweenComplete()
		{
			cannon.removeAllChildren();
			stage_global.removeChild(cannon);
		}	

		// コールバックを設定する
		// アニメーションが完了したときに呼ばれる
		function setCallback(callbackMethod) {
			removeCallbackMethod = callbackMethod;	
		}

		return cannon;
	}

	window.Cannon = Cannon;
}) (window);
