/*
 * Player.js
 *
 * プレイヤーのオブジェクト
 * 画像と画面の横幅を指定するとその幅の範囲内で動く
 *
 */

(function (window) {

	// new されたときに呼ばれる
	function Player(playerImage, physics) {
		this.initialize(playerImage, physics);
	}

	// 継承関係？
	Player.prototype = new createjs.BitmapAnimation();
	Player.prototype.BitmapAnimation_initialize = Player.prototype.initialize;


	// --- ----------- --- //
	// --- initializer --- //
	Player.prototype.initialize = function(playerImage, physics) {

		this.isIdle = true;
		this.direction = 1;
		this.vX = 3;
		this.player_width = 34;
		this.isJumping = false;
		this.stopJumping = false;
		this.isOnLand = true;
		this.isRunning = false;
		this.isDied = false;
		this.physics = physics;
		
		this.isWalkingRight = false;
		this.isWalkingLeft  = false;
		this.isStop = true;

		// width とかheight とかのプロパティが無いので
		// 自分で追加(必要ならば動的に変化させる
		this.width = 34;
		this.height = 34; 

		var regX = this.width / 2;
		var regY = this.height / 2;
		
		// init
		var spriteSheet = new createjs.SpriteSheet({
			images: [playerImage],
	
			//frames: {x: 40, y: 40, width: 34, height: 34, regX: 16, regY: 16},
			frames: [
				// for stand
				// 0~
				[0,   0, 34, 34, 0, regX, regY],
				[35,  0, 32, 34, 0, regX, regY],
				[68,  0, 34, 34, 0, regX, regY],
				[102, 0, 34, 34, 0, regX, regY],
				[136, 0, 34, 34, 0, regX, regY],
				[170, 0, 34, 34, 0, regX, regY],
				[206, 0, 34, 34, 0, regX, regY],
				// for run
				// ~7~
				[5, 45, 34, 34, 0, regX, regY],
				[39, 45, 34, 34, 0, regX, regY],
				[73, 45, 34, 34, 0, regX, regY],
				[107, 45, 34, 34, 0, regX, regY],
				[141, 45, 34, 34, 0, regX, regY],
				[174, 45, 34, 34, 0, regX, regY],
				[207, 45, 34, 34, 0, regX, regY],
				[241, 45, 34, 34, 0, regX, regY],
				[275, 45, 34, 34, 0, regX, regY],
				// run section 2
				// ~16~
				[325, 45, 40, 34, 0, regX, regY],
				[365, 45, 40, 34, 0, regX, regY],
				[405, 45, 40, 34, 0, regX, regY],
				[445, 45, 40, 34, 0, regX, regY],
				[487, 45, 40, 34, 0, regX, regY],
				[527, 45, 40, 34, 0, regX, regY],
				// jump motion
				// ~22~
				[3, 215,  31, 34, 0, regX, regY],
				[35, 215, 30, 34, 0, regX, regY],
				[67, 215, 30, 34, 0, regX, regY],
				[98, 215, 31, 34, 0, regX, regY],
				[130, 215, 30, 34, 0, regX, regY]
			],
			animations: {
				stand: [0, 6, "stand", 3],
				walk: [7, 15, "run", 2],
				run: [16, 21, "run", 2],
				jump: [22, 26, "", 5]
			}
		});

		createjs.SpriteSheetUtils.addFlippedFrames(spriteSheet, true, false, false);
	
		// create a BitmapAnimation instance to display and play back the sprite sheet:
		this.BitmapAnimation_initialize(spriteSheet);
	}





	// --- プレイヤー操作 --- //

	// プレイヤーが地面についた時点で呼ぶ
	Player.prototype.onLand = function() {
		if(!this.isOnLand) {
			// ジャンプ終了後
			if(this.direction > 0) {
				if(this.isRunning) {
					this.gotoAndPlay("run");
				} else {
					this.gotoAndPlay("stand");
				}
			} else {
				if(this.isRunning) {
					this.gotoAndPlay("run_h");
				} else {
					this.gotoAndPlay("stand_h");
				}
			}
			this.isOnLand = true;
			this.y_prev = null;
			this.stopJumping = false;
			this.isJumping   = false;
		}
	}
	Player.prototype.jump = function() {
		if(!this.isJumping) {
			if(this.direction > 0) {
				this.gotoAndPlay("jump");
			} else {
				this.gotoAndPlay("jump_h");
			}
			this.isOnLand = false;
			this.isJumping = true;
			this.physics.jump();
		}
	}
	Player.prototype.runRight = function() {
		if( this.isIdle ) {
			if ( !this.isJumping ) {
				this.gotoAndPlay("run");
			}
			
			Yoshi.isRunning = true;
			Yoshi.direction = 1;
			Yoshi.isIdle = false;
			Yoshi.isWalkingRight = true;
			Yoshi.isStop = false;

		}
	}
	Player.prototype.runLeft = function() {
		if(this.isIdle) {
			if(!this.isJumping) {
				this.gotoAndPlay("run_h");
			}
			this.isRunning = true;
			this.direction = -1;
			this.isIdle = false;
			this.isWalkingLeft = true;
			this.isStop = false;

		}

	}
	Player.prototype.stopRunning = function() {
			this.isIdle = true;
			if(this.direction > 0) {
				this.gotoAndPlay("stand");
			} else {
				this.gotoAndPlay("stand_h");
			}
			this.isRunning = false;
			this.isWalkingLeft = false;
			this.isWalkingRight = false;
			this.isStop = true;
			this.physics.stop();
	}
	Player.prototype.goal = function() {
		if(!this.isStop) {
			if(this.direction > 0) {
				this.gotoAndPlay("stand");
			} else {
				this.gotoAndPlay("stand_h");
			}
		}
		this.isWalkingLeft = false;
		this.isWalkingRight = false;
		this.isStop = true;
		this.isDied = true;
		this.physics.stop();
	}
	Player.prototype.fail = function() {
		this.isWalkingLeft = false;
		this.isWalkingRight = false;
		this.isStop = true;
		this.isDied = true;
		if(this.direction > 0) {
			this.gotoAndPlay("stand");
		} else {
			this.gotoAndPlay("stand_h");
		}
		this.physics.stop();
	}


	Player.prototype.tick = function() {
		if(this.isWalkingLeft) {
			this.physics.moveLeft();
		} else if(this.isWalkingRight) {
			this.physics.moveRight();
		}
	}

	window.Player = Player;
}) (window);

