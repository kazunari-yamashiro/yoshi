function ContentManager()
{
	var ondownloadcompleted;
	var NUM_ELEMENTS_TO_DOWNLOAD = 3;
	var numImagesLoaded = 0;

	// images contentManager.imgPlayer 等としてアクセス
	this.imgPlayer = new Image();
	this.imgExit   = new Image();
	this.imgWin    = new Image();
	this.imgLose  = new Image();

	this.SetDownloadCompleted = function (callbackMethod) {
		ondownloadcompleted = callbackMethod;
	}

	this.loadAllImages = function() {
		this.imgPlayer.src = "YoshiAndMarioSMA3.gif";
		this.imgPlayer.onload = loadedHandler;
		this.imgPlayer.onerror = errorHandler;
		this.imgExit.src = "img/Exit.png";
		this.imgExit.onload = loadedHandler;
		this.imgExit.onerror = errorHandler;
		this.imgWin.src = "img/you_win.png";
		this.imgWin.onload = loadedHandler;
		this.imgWin.onerror = errorHandler;
		this.imgLose.src = "img/you_lose.png";
		this.imgLose.onload = loadedHandler;
		this.imgLose.onerror = errorHandler;
	}

	function loadedHandler(e) {
		numImagesLoaded++;
		if(numImagesLoaded == NUM_ELEMENTS_TO_DOWNLOAD) {
			numImagesLoaded = 0;
			ondownloadcompleted();
		}
	}

	function errorHandler() {
		console.log("shit, error occurred");
	}
}
