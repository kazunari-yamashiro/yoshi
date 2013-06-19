
// inherit
//Effects.prototype = new createjs.Shape();

// init
function Effects(type, x, y, radius, color, point_num, angle)
{
	var object = null; // 返すオブジェクト

	var CIRCLE       = 1;
	var BLUR         = 2;
	var BOUNCE_TWEEN = 4;
	var STAR         = 8;
	var MAGIC_SQUARE = 16;

	var flags = 0x0000;

	var typelow = type.toLowerCase();

	// 文字列からの
	// フラグの振り分け
	switch (typelow) {

		// circle 関係
		case "bounceblurredcircle":
			flags += BOUNCE_TWEEN;
		case "blurredcircle": 
			flags += BLUR;
		case "circle":
			flags += CIRCLE;
			break;

		// star 関連
		case "star":
			flags += STAR;
			break;

		// magic square
		case "magicsquare":
			flags += MAGIC_SQUARE;
			break;
	}

	// 取得したフラグの適用
	if(flags & CIRCLE)       circle(x, y, radius, color);
	if(flags & BLUR)         blur(x, y, radius, color);
	if(flags & BOUNCE_TWEEN) bounce_tween();

	if(flags & STAR)         star(x, y, radius, color, point_num, angle);

	if(flags & MAGIC_SQUARE) magicSquare(x, y, radius, color);

	return object;


	// --- 以下それぞれのエフェクトを適用するメソッド郡 --- //

	// magic square
	function magicSquare(x, y, radius, color) 
	{
		object = new createjs.Container();

		var star = new createjs.Shape();
		var sg = star.graphics;
		sg.beginStroke(color);
		sg.drawPolyStar(0, 0, radius, 5, 2);
		sg.endStroke(color);
		star.rotation = -18;

		var circle = new createjs.Shape();
		var cg = circle.graphics;
		cg.beginStroke(color);
		cg.drawCircle(0, 0, radius);
		cg.endStroke(color);

		object.x = x;
		object.y = y;

		object.addChild(star);
		object.addChild(circle);

		console.log(object);
	}


	// star
	function star(x, y, radius, color, point_num, angle)
	{
		object = new createjs.Shape();

		var g = object.graphics;
		//g.beginRadialGradientFill([color, color], [0, 1], 0, 0, 0, 0, 0, 30);
		//g.drawCircle(0, 0, 30);
		g.beginStroke(color);
		g.drawPolyStar(x, y, radius, point_num, angle);
		g.endStroke(color);
		object.rotation = -18;
	}

	// circle
	function circle(x, y, radius, color)
	{
		object = new createjs.Shape();
		var graphics = object.graphics;
		graphics.beginFill(color);
		graphics.drawCircle(x, y, radius);
		object.compositeOperation = "lighter";
		//object.alpha = 0.5;
	}

	// blur
	function blur(x, y, radius) 
	{
		// blur は最後にshapeの作成後に行う
		var blurFilter = new createjs.BoxBlurFilter(20, 20, 1);
		object.filters = [blurFilter];
		var bounds = blurFilter.getBounds();
		object.cache(x - radius + bounds.x, y - radius + bounds.y,  radius * 2 + bounds.width, radius * 2 + bounds.height);
	}

	// bounce_tween なんか言葉が出てこない
	function bounce_tween()
	{
		createjs.Tween.get(object, {loop: true})
			.to({scaleX: 1.2, scaleY: 1.2}, 1000, createjs.Ease.linear)
			.to({scaleX: 0.1, scaleY: 0.1}, 1500, createjs.Ease.linear)
			.wait(500)
			.to({scaleX: 1, scaleY: 1}, 1000, createjs.Ease.linear);
	}

}


