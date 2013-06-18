(function (window) {

	GameManager.prototype = new createjs.Container();

	function GameManager(stage)
	{
		// 情報プロパティ
		this.field_number = 1; // フィールド番号
		this.player = null;    // プレイヤーのオブジェクトを格納
		this.stage = stage;

		// 物理世界の作成		
		this.physics = new Physics();		
		this.physics.setup();

		// フィールドの作成
		//this.field = new Field(stage, this.physics, 1);
		//stage.addChild(this.field);
	}


	// number 番号のフィールドを作成する
	// プレイヤーのオブジェクトも同時に作成する
	GameManager.prototype.createField = function(number)
	{
		this.field = new Field(stage, this.physics, 1);
		this.stage.addChild(this.field);

		// Player のオブジェクトを作成
		this.player = new Player(contentManager.imgPlayer, FIELD_WIDTH);
		this.player.isIdle = true;
		this.player.gotoAndPlay("stand");
		this.player.x = FIELD_WIDTH / 2;
		this.player.y = FIELD_HEIGHT - ( 34 * 0.5 );
		// player physics
		this.physics.createPlayer(this.player);

		this.stage.addChild(this.player);
	}




	// 物理世界のオブジェクトの取得
	GameManager.prototype.getPhysics = function()
	{
		return this.physics;
	}

	// プレイヤーオブジェクトの取得
	GameManager.prototype.getPlayer = function()
	{
		return this.player;
	}

	window.GameManager = GameManager;
}) (window);
