/*
 * Player.js
 *
 * プレイヤーのオブジェクト
 * 画像と画面の横幅を指定するとその幅の範囲内で動く
 *
 */

(function (window) {

	// Player のグローバルプロパティ
	// ※ これはおそらく何の意味もない感じの変数たち 

	var isIdle;        // 静止状態かどうか
	var direction;     // 右方向か(1)、左方向か(-1);
	var vX;            // x のベクトル(?)
	var vY;            // y のベクトル(Jump 用)
	var timeMoveStart; // 一定時間後に走るスピードをアップさせる為
	var player_width;
	var player_height;
	var isJumping;     // ジャンプ中は true;
	var isOnLand;      // 地上にいるかどうか
	var y_prev;        // 前回のy の座標を保持（ジャンプ用）
	var isRunning;

	// new されたときに呼ばれる
	function Player(playerImage, stage_width) {
		this.initialize(playerImage, stage_width);
	}

	Player.prototype = new createjs.BitmapAnimation();

	Player.prototype.BitmapAnimation_initialize = Player.prototype.initialize;


	// --- ----------- --- //
	// --- initializer --- //
	Player.prototype.initialize = function(playerImage, stage_width) {

		this.isIdle = true;
		this.direction = 1;
		this.vX = 3;
		this.player_width = 34;
		this.isJumping = false;
		this.stopJumping = false;
		this.isOnLand = true;
		this.isRunning = false;
		this.isDied = false;
		
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
		/*
		bmpAnimation = new createjs.BitmapAnimation(spriteSheet);
		bmpAnimation.gotoAndPlay("stand");
	
		bmpAnimation.name = "yoshi";
		bmpAnimation.direction = 90;
		bmpAnimation.vX = 0;
		bmpAnimation.x  = 16;
		bmpAnimation.y = 32;
	
		bmpAnimation.currentFrame = 0;
		//stage.addChild(bmpAnimation);
		*/
		// 上のコメントアウトの部分の初期化の部分を以下で行う？
		this.BitmapAnimation_initialize(spriteSheet);
	}

	// どこからかプレイヤーが地面についた時点で呼ぶ
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

	
	// Frame毎に呼ばれる
	// ここで位置をプレイヤーの位置を変更する
	Player.prototype.tick = function() {
		// 死んでると何も操作させない
		if(this.isDied) {
			return;
		}


		// 静止状態でなければ direction の方向へ動かす
		if(!this.isIdle) {
			// スタートした時間を取得
			if(!this.timeStartMove) { this.timeStartMove = now(); }
			// 経過時間を取得
			var elapsed = now() - this.timeStartMove;

			// 壁に接触していると移動はさせない:
			if(this.x <= (this.player_width / 2)) {
				this.x = this.player_width / 2;
			} else if(this.x >= FIELD_WIDTH - (this.player_width * 0.5)) {
				this.x = FIELD_WIDTH - (this.player_width * 0.5);
			} else {

				// 壁に接触していないときは移動する
				if(elapsed > 900) this.isRunning = true;

				if(this.isRunning) {

					// 連続して走っていたらスピードアップ
					this.x += (this.vX * this.direction) + (4 * this.direction);

				} else {
					this.x += this.vX * this.direction;
				}

			}
		}
		// 移動が終了したとき
		else {
			this.isRunning = false;
			this.timeStartMove = null;
			// 壁にめり込んでいる分を戻す
			// がくがくするのを抑える為にこうしている
			// もっといい計算方法が欲しい・・・
			if(this.x <= (this.player_width / 2)) {
				this.x = this.player_width / 2 + 0.1;
			} else if(this.x >= FIELD_WIDTH - (this.player_width + 0.5)) {
				this.x = FIELD_WIDTH - (this.player_width * 0.5) - 0.1;
			}
		}

		// ジャンプの処理
		if(this.isJumping) {
			var GROUND = 483;
			var f;
			if(!this.stopJumping) {
				f = this.isOnLand ? 20 : -2;
			} else {
				f = -2;
				if(this.y_prev > this.y) {
					this.y_prev = this.y;	
				}
			}

			// 前回の座標を保持
			var y_temp = this.y;
			
			// 最初の座標をリンクさせる
			if(!this.y_prev) { this.y_prev = this.y; }

			this.y -= (this.y_prev - this.y) + f;
			
			this.y_prev = y_temp;
			this.isOnLand = false;

			// ジャンプ終了後
			if(this.isOnLand) {
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
				this.y = 483;
				this.isOnLand = true;
				this.y_prev = null;
				this.stopJumping = false;
				this.isJumping   = false;
			}
		}
	}
	
	// たぶんグローバルオブジェクトに代入
	window.Player = Player;
}) (window);

