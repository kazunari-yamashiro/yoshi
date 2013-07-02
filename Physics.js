// Box2d Imporitng
var b2Vec2        = Box2D.Common.Math.b2Vec2;
var b2BodyDef     = Box2D.Dynamics.b2BodyDef;
var b2Body        = Box2D.Dynamics.b2Body;
var b2FixtureDef  = Box2D.Dynamics.b2FixtureDef;
var b2Fixture     = Box2D.Dynamics.b2Fixture;
var b2World       = Box2D.Dynamics.b2World;
var b2MassData    = Box2D.Collision.Shapes.b2MassData;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw   = Box2D.Dynamics.b2DebugDraw;
var b2Listener    = Box2D.Dynamics.b2ContactListener;

(function (window) {

	
	function Physics()
	{
		// world の作成
			// important box2d scale and speed vars
			var SCALE = 30, STEP = 20, TIMESTEP = 1/STEP;
		
			var world;
			var lastTimestamp = Date.now();
			var fixedTimestepAccumulator = 0;
			var bodiesToRemove = [];
			var actors = [];
			var bodies = [];
			var floors = [];
			var listener = new b2Listener;

			listener.BeginContact = function(contact) {
			}

		
			// box2d world setup and boundaries
			var setup = function() {
				world = new b2World(new b2Vec2(0, 9.8), true);
				world.SetContactListener(listener);
				//addDebug();
			}
		
			// --- 足場などの静的なオブジェクトを作成する --- //
			function createStaticObject(skin) {
				var fixture = new b2FixtureDef;
				fixture.density = 0;
				fixture.restitution = 0;
				fixture.friction = 0;
				fixture.shape = new b2PolygonShape;
				fixture.shape.SetAsBox(skin.width / SCALE / 2, skin.height / SCALE / 2);

				// filter
				//fixture.filter.categoryBits = 0x0002;
				fixture.filter.maskBits     = 0x0001;
				//fixture.filter.groupIndex   = 0x0032;

				var bodyDef = new b2BodyDef;
				bodyDef.type = b2Body.b2_staticBody;
				bodyDef.position.x = (skin.x + (skin.width / 2)) / SCALE;
				bodyDef.position.y = (skin.y + (skin.height / 2)) / SCALE;
				

				var body = world.CreateBody(bodyDef);
				body.CreateFixture(fixture);

				body.SetUserData(fixture);
				floors.push(body);
			}
		
			var actorObject = function(body, skin) {
				this.body = body;
				this.skin = skin;
				this.prevYv = 0;
				this.prevYvCount = 0;
				this.startedWalkAnimation = false;
				this.jumpingStateReset = true;
		
				this.update = function() {
					this.skin.rotation = this.body.GetAngle() * ( 180 / Math.PI);
					this.skin.x = this.body.GetWorldCenter().x * SCALE;
					this.skin.y = this.body.GetWorldCenter().y * SCALE;
		
					// 地上以外のジャンプ終了の処理
					// テストでとりあえず動く程度の代物
					// ここは変更を加える
					this.prevYv = this.body.GetLinearVelocity().y;
					if(this.prevYv === 0) {
						this.prevYvCount++;
						if(this.prevYvCount >= 1) {
							this.prevYvCount = 0;
							Yoshi.y_prev = null;
							Yoshi.stopJumping = false;
							Yoshi.isJumping = false;
							Yoshi.onLand();
						}
					}
		
		
					// Jump の高さを制御
					// これもちょっと改良しないといけないかな
					if(Yoshi.stopJumping) {
						var vel = this.body.GetLinearVelocity();
						if(vel.y < -4) {

							floors.push(body);
							vel.y = -4;
							this.body.SetLinearVelocity(vel);
							Yoshi.stopJumping = false;
						}
					}
				}
		
				// manipulation methods
				this.jump = function() {
					var vel = this.body.GetLinearVelocity();
					vel.y = -10;
					this.body.SetLinearVelocity( vel );
				}
				this.moveRight = function() {
					var vel = this.body.GetLinearVelocity();
					vel.x = 7;
					this.body.SetLinearVelocity( vel );
				}

				floors.push(body);
				this.moveLeft = function() {
					//this.body.ApplyImpulse(new b2Vec2(-2, 0), this.body.GetWorldCenter());
					var vel = this.body.GetLinearVelocity();
					vel.x = -7;
					this.body.SetLinearVelocity( vel );
				}
				this.stop = function() {
					var vel = this.body.GetLinearVelocity();
					vel.x = 0;
					this.body.SetLinearVelocity( vel );
				}
		
				actors.push(this);
			}
		
		
			// --- Player(Yoshi) object --- //
			var createPlayer = function(skin) {
				var fixture = new b2FixtureDef;
				fixture.density = 1;
				fixture.restitution = 0;
				fixture.shape = new b2PolygonShape;
				fixture.shape.SetAsBox(skin.width / SCALE / 2, skin.height / SCALE / 2);

				// filter
				fixture.filter.categoryBits = 0x0001;
				//fixture.filter.maskBits     = 0x0002;
				//fixture.filter.groupIndex   = 0x0004;
		
				var bodyDef = new b2BodyDef;
				bodyDef.type = b2Body.b2_dynamicBody;
				bodyDef.position.x = skin.x / SCALE;
				bodyDef.position.y = skin.y / SCALE;
				//bodyDef.preventRotation = true;
				bodyDef.fixedRotation = true;
				
				var body = world.CreateBody(bodyDef);
				body.CreateFixture(fixture);
				body.SetSleepingAllowed(false);
		
				var actor = new actorObject(body, skin);
				body.SetUserData(actor);
				bodies.push(body);	
				//actors.push(actor);
			}
		
			var update = function () {
				world.Step(TIMESTEP, 10, 10);
		
				for(var i = 0, l = actors.length; i<l; i++) {
					actors[i].update();
				}
		
		/*
				for(var i = 0, l = floors.length; i < l ; i++) {
					//console.log(bodies[0].GetPosition().x, floors[i].GetPosition().x);
					//console.log(floors[i].GetPosition().x);
					if(floors[i].GetPosition().x < bodies[0].GetPosition().x) {
						var fixtureDef = floors[i].GetUserData().filter;
						//console.log(filter.categoryBits);
						filter.categoryBits = 0x0000;
						floors[i].GetUserData().filter = filter;
					} else {
						var filter = floors[i].GetUserData().filter;
						//filter.categoryBits = 0x0001;
						floors[i].GetUserData().filter = filter;
					}
				}
				*/
			}
		
			
			// manipulation methods
			var jump = function() {
				actors[0].jump();
			}
			var moveRight = function() {
				actors[0].moveRight();
			}
			var moveLeft = function() {
				actors[0].moveLeft();
			}
			var stop = function() {
				actors[0].stop();
			}




		// --- block --- //
		var createBlocks = function(startX, startY, blockNum)
		{
			// images size is 40x32
			var blockWidth = 40;
			var blockHeight = 40;
		
			var blocks = new createjs.Container();
		
			blocks.width  = blockWidth * blockNum;
			blocks.height = blockHeight;
			blocks.x = startX;
			blocks.y = startY;
		
			// 指定された数のブロックを横に並べて作成
			for(var i = 0; i < blockNum; i++) {
				var bmp = new createjs.Bitmap("img/Tiles/BlockA0.png");
				bmp.x = blockWidth * i;
				//bmp.y = startY;	
				
				blocks.addChild(bmp);
			}
		
			// 当たり判定オブジェクトを作成
			box2d.createStaticObject(blocks);
		
			// 作成が終わったらステージに適応
			stage.addChild(blocks);
		}

			return {
				setup: setup,
				createPlayer: createPlayer,
				createStaticObject: createStaticObject,
				update: update,
				jump: jump,
				moveRight: moveRight,
				moveLeft: moveLeft,
				stop: stop,
				createBlocks: createBlocks
			};
	}
	
	window.Physics = Physics;
}) (window);
