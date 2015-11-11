/* global describe, it */

(function () {
  'use strict';

	describe('Test Game Controller', function () {
		describe('Test Game Controller with Empty Players', function () {
	  	var gameController = new GameController();
	  	beforeEach(function() {
	  		spyOn(gameController, 'init');
	  		gameController.init();
	  	});

	    it('init function called', function () {
	      expect(gameController.init).toHaveBeenCalled();
	    });

	    it('updateActivePlayer shoud not work', function() {
	    	expect(gameController.updateActivePlayer()).toBeUndefined();
	    })
	  });
	  describe('Test Controller with players', function() {
	  	var fakePlayers = {
	    		player1: {
	    			index: 1,
	    			name: "Test",
	    			sign: "cross"
	    		},
	    		player2: {
	    			index: 2,
	    			name: "Test 2",
	    			sign: "circle"
	    		}
	    	}
	    var gameController = new GameController( fakePlayers );

	  	it('updateActivePlayer works', function() {
	    	expect(gameController.updateActivePlayer()).toBeTruthy();
	    })

	  	it('getActivePlayer returns player object', function() {
	    	expect(gameController.getActivePlayer()).toEqual(jasmine.any(Object));
	    })

	    it('setActivePlayer changes activePlayer', function() {
	    	gameController.setActivePlayer( 1 );
	    	expect(gameController.getActivePlayer().index).toEqual( 1 );
	    	gameController.setActivePlayer( 2 );
	    	expect(gameController.getActivePlayer().index).toEqual( 2 );
	    })

	    it('setActivePlayer doesnt change activePlayer if index is not 1 or 2', function() {
	    	var currentActivePlayerIndex = gameController.getActivePlayer().index;
	    	gameController.setActivePlayer( -1 );
	    	expect(gameController.getActivePlayer().index).toEqual( currentActivePlayerIndex );
	    	gameController.setActivePlayer( 3 );
	    	expect(gameController.getActivePlayer().index).toEqual( currentActivePlayerIndex );
	    })

	    it('Grid filling works properly', function() {
	    	var expectedArray = [];
	    	for ( var i = 0; i < 3; i++) {
	    		expectedArray[i] = [];
	    		for ( var j = 0; j < 3; j++) {
	    			expectedArray[i][j] = false;
	    		}
	    	}
	    	gameController.fillGrid();
	    	expect(gameController.grid).toEqual( expectedArray );
	    })

	    it('Grid update works properly', function() {
	    	var sign = gameController.getActivePlayer().sign;
	    	gameController.fillGrid();
	    	expect(gameController.grid[1][1]).toEqual( false );
				gameController.updateGrid('1,1');
				expect(gameController.grid[1][1]).toEqual( sign );
	    })


	    describe('Test checkForWinner functionality', function() {
	    	it('checkForWinner, horizontal check', function() {
		    	var activePlayer = gameController.getActivePlayer();
		    	gameController.fillGrid();
		    	expect(gameController.isGameOvered()).toEqual( false );

		    	for ( var i = 0; i < 3; i++) {
		    		gameController.grid[0][i] = activePlayer.sign;
		    	}
		    	expect(gameController.checkForWinner()).toEqual( true );
		    })
		    it('checkForWinner, vertical check', function() {
		    	var activePlayer = gameController.getActivePlayer();
		    	gameController.fillGrid();
		    	for ( var i = 0; i < 3; i++) {
		    		gameController.grid[i][0] = activePlayer.sign;
		    	}
		    	expect(gameController.checkForWinner()).toEqual( true );
		    })
		    it('checkForWinner, diagonal check', function() {
		    	var activePlayer = gameController.getActivePlayer();
		    	gameController.fillGrid();
		    	for ( var i = 0; i < 3; i++) {
		    		gameController.grid[i][i] = activePlayer.sign;
		    	}
		    	expect(gameController.checkForWinner()).toEqual( true );

		    	gameController.fillGrid();
		    	for ( var i = 0; i < 3; i++) {
		    		gameController.grid[i][2 - i] = activePlayer.sign;
		    	}
		    	expect(gameController.checkForWinner()).toEqual( true );
		    })
	    })

			it('Game over works', function() {
	    	gameController.overTheGame();
	    	expect(gameController.isGameOvered()).toEqual( true );
	    })

	    it('No body WON works', function() {
	    	gameController.grid = [
	    		[ 'circle', 'cross', 'cross' ],
	    		[ 'cross', 'cross', 'circle' ],
	    		[ 'circle', 'circle', false ]
	    	];

	    	gameController.updateGrid('2,2');
	    	console.log( gameController.isNoBodyWon() );
	    	expect(gameController.isNoBodyWon()).toEqual( "noBodyWon" );
	    })

	    it('Restart game works', function() {
	    	gameController.overTheGame();
	    	gameController.restartGame();
	    	expect(gameController.isGameOvered()).toEqual( false );
	    })
	  })
  });
})();
