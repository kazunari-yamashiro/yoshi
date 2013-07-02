(function (window) {
	// 継承する
	Field.prototype = new createjs.Container();

	// main method
	function Field(stage, physics, field_number) 
	{
		this.isGoal = false;
		this.isFail = false;
		this.stage = stage;
		this.physics = physics;

		switch(field_number) {
			case 1:
				this.createField1();
				break;
		}
	}

	Field.prototype.goal = function()
	{
		if(!this.isGoal) {
			this.isGoal = true;	
			showGoalMessage();
		}
	}
	Field.prototype.fail = function()
	{
		if(!this.isFail) {
			this.isFail = true;
			showFailMessage();
		}
	}
	Field.prototype.reset = function()
	{
			
	}

	Field.prototype.createField1 = function()
	{
		// ゴールの作成
		createExit(3899, 282 - 16);

		// 以下はループで回す

		// 床
		this.physics.createBlocks(0, FIELD_HEIGHT - 10, 30);
		this.physics.createBlocks(1800, FIELD_HEIGHT - 20, 7);
		this.physics.createBlocks(3220, 370, 7);
		this.physics.createBlocks(3760, 300, 7);

		// 空中の足場
		this.physics.createBlocks(100, 400, 4);
		this.physics.createBlocks(450, 300, 4);
		this.physics.createBlocks(300, 200, 4);
		this.physics.createBlocks(600, 400, 4);
		this.physics.createBlocks(560, 100, 5);

		this.physics.createBlocks(1300, 300, 5);

		this.physics.createBlocks(2300, 400, 1);
		this.physics.createBlocks(2300, 300, 1);
		this.physics.createBlocks(2300, 200, 1);
		
		this.physics.createBlocks(2500, 150, 1);
		this.physics.createBlocks(2700, 100, 1);

		this.physics.createBlocks(2900, 50, 1);
		this.physics.createBlocks(2940, 90, 1);
		this.physics.createBlocks(2980, 130, 1);
		this.physics.createBlocks(3020, 170, 1);
		this.physics.createBlocks(3060, 210, 1);
		this.physics.createBlocks(3100, 250, 1);
		this.physics.createBlocks(3140, 290, 1);
		this.physics.createBlocks(3180, 330, 1);
	}

	function showGoalMessage()
	{
		var bmp = new createjs.Bitmap(contentManager.imgWin);
		bmp.x = (this.stage.x - (FIELD_WIDTH / 2)) * -1;
		bmp.y = 0;
		this.stage.addChild(bmp);
	}
	function showFailMessage()
	{
		var bmp = new createjs.Bitmap(contentManager.imgLose);
		bmp.x = (this.stage.x - (FIELD_WIDTH / 2)) * -1;
		bmp.y = 0;
		this.stage.addChild(bmp);
	}
	function createExit(x, y)
	{
		goalPole = new createjs.Bitmap(contentManager.imgExit);
		goalPole.x = x;
		goalPole.y = y;
		stage.addChild(goalPole);
	}

	window.Field = Field;
}) (window);
