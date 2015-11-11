'use strict';

/**
 * Construstor for Main Game view, Contains most of logic, responsible for markup DOM updates
 **/
var View = function( game ) {
	this.$el = $('#board');
	var self = this,
		cellSize = 33.33;

	this.init = function() {
		game.init();
		this.prepareView();
		this.updateStepOwner();
		this.initListeners();
	}

	/**
	 * appends all 9 cells into DOM(main board), specifying top/left params in percents. Adds click listener
	 **/
	this.prepareView = function() {
		var self = this;
		for ( var i = 0; i < 3; i++ ) {
			for ( var j = 0; j < 3; j++ ) {
				var $el = $('<div class="cell" style="top: '+ i * cellSize + '%; left:' + j * cellSize + '%"></div>');
				$el.data('position', i + ',' + j ).on('click', this.userClickAction);
				this.$el.append($el);
			}
		}
	}

	/**
	 * cell's click handler, triggers update methods
	 **/
	this.userClickAction = function() {
		var activePlayer = game.getActivePlayer();
		if ( game.updateGrid( $(this).data('position') ) ) {
			self.updateCell( $(this), activePlayer );
			self.updateStepOwner();
		} else {
			if ( game.isGameOvered() ) {
				self.updateCell( $(this), activePlayer );
				if ( !game.isNoBodyWon() ) {
					self.updateStepOwner();
				}
				$('.cell').off('click');
			}
		}
	}

	/**
	 * sets correspondent class (circle or cross) to a particular cell
	 * @param {Jquery Object} $cell - jquery object of clicked cell.
	 * @param {Object} activePlayer - model of currently active player
	 **/
	this.updateCell = function( $cell, activePlayer ) {
		$cell.addClass( activePlayer.sign );
	}

	/**
	 * Updates message above main board with current Player
	 **/
	this.updateStepOwner = function() {
		var isGameOver = game.isGameOvered();
		var userMessage = isGameOver ? ' Won!!!' : ' doing step...'

		$('#step-owner').html(game.getActivePlayer().name + userMessage);
	}

	/**
	 * Inits delegate listeners
	 **/
	this.initListeners = function() {
		var self = this;
		$(window).on('game.restart', function() {
			self.restartGame();
		});
	}

	/**
	 * sets all the defaults, adds initial listeners.
	 **/
	this.restartGame = function() {
		$('.cell', this.$el).removeClass('circle cross').on('click', this.userClickAction);
		this.updateStepOwner();
	}

	// embed init call, to init View immediately after instantiation
	this.init();
}


/**
 * Construstor for Game Controller, contains all information about the game
 * @param {Object} players - object with two players models
 **/
var GameController = function( players ) {
	var activePlayer,
		gameIsOver = false,
		noBodyWon = false;

	this.grid = [];

	this.init = function() {
		this.fillGrid();
		this.updateActivePlayer();
	}

	/**
	 * Fills grid with 3*3 array, each element has value false
	 **/
	this.fillGrid = function() {
		for ( var i = 0; i < 3; i++ ) {
			this.grid[i] = [];
			for ( var j = 0; j < 3; j++ ) {
				this.grid[i][j] = false;
			}
		}
	}


	/**
	 * Updates active player on init based on who has 'cross' sign
	 **/
	this.updateActivePlayer = function() {
		if ( players && players.player1 && players.player2 ) {
			activePlayer = players.player1.sign == 'cross' ? players.player1 : players.player2
			return true;
		}
	}

	/**
	 * Fills correspondent grid item with active player's sign
	 * @param {String} position - string representation of two values/coordinates in grid,
	 * separated by coma. Should look like this "1,2"
	 * @return !{Boolean} - whether any of the players won at this moment,
	 **/
	this.updateGrid = function( position ) {
		position = position.split(',');
		if ( this.grid[ position[0] ][ position[1] ] === false ) {
			this.grid[ position[0] ][ position[1] ] = activePlayer.sign;
			var isThereWinner = this.checkForWinner();

			if ( isThereWinner ) {
				this.overTheGame();
				return false;
			}
			if ( !this.isAnyEmptyCell() ) {
				this.overTheGame( 'noBodyWon' );
				return false;
			}
			return !isThereWinner;
		}
	}

	/**
	 * Checks whether nobody won a game
	 * @return {number} items - number of empty cells
	 **/
	this.isAnyEmptyCell = function() {
		var counter = 0;
		for ( var i = 0; i < 3; i++ ) {
			for ( var j = 0; j < 3; j++ ) {
				if ( this.grid[i][j] === false ) {
					counter++;
				}
			}
		}
		return counter;
	}

	/**
	 * Checks is there any of 3 types matches, to get the victory for a player
	 * @return {Boolean} whether game is over
	 **/
	this.checkForWinner = function() {
		var won = this.checkHorizontal() || this.checkVertical() || this.checkDiagonal();
		if (!won) {
			this.setActivePlayer( 3 - activePlayer.index );
		}
		return won;
	}
	this.checkHorizontal = function() {
		return this.checkVerticalHorizontal();
	}
	this.checkVertical = function() {
		return this.checkVerticalHorizontal( true );
	}

	/**
	 * Checks is there 3 items with equal sign, placed horizonally
	 * @param {Boolean} flip - flag to differ between horizontal and vertical checker
	 **/
	this.checkVerticalHorizontal = function( flip ) {
		var counter;
		for ( var i = 0; i < 3; i++ ) {
			counter = 0;
			for ( var j = 0; j < 3; j++ ) {
				var matchedCell = flip ? this.grid[j][i] : this.grid[i][j];
				if ( matchedCell != activePlayer.sign ) {
					break;
				}
				counter++;
				if ( counter == 3 ) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Checks is there 3 items with equal sign, placed in diagonal
	 **/
	this.checkDiagonal = function() {
		var counter = 0,
			matches = {};
		if ( this.grid[1][1] == activePlayer.sign ) {
			if ( ( (this.grid[0][0] == activePlayer.sign) && (this.grid[2][2] == activePlayer.sign) )
				|| (this.grid[0][2] == activePlayer.sign) && (this.grid[2][0] == activePlayer.sign) ) {
				return true;
			}
		}
	}

	/**
	 * returns active player
	 **/
	this.getActivePlayer = function() {
		return activePlayer;
	}

	/**
	 * Sets active player
	 * @param {number} newActiveIndex - player index. Should be either 1 or 2
	 * @return {Object} active player
	 **/
	this.setActivePlayer = function( newActiveIndex ) {
		if ( newActiveIndex === 1 || newActiveIndex === 2 ) {
			if ( !gameIsOver ) {
				activePlayer = players['player' + newActiveIndex];
			}
			return activePlayer;
		}
	}

	/**
	 * @return {Boolean} gameIsOvered
	 **/
	this.isGameOvered = function() {
		return gameIsOver;
	}

	/**
	 * stops the game, initiates prompt to start again
	 **/
	this.overTheGame = function( noBodyWonGame ) {
		var self = this;
		gameIsOver = true;
		noBodyWon = noBodyWonGame;
		//this check is to disable alerts in Jasmine
		if ($('#board').length) {
			setTimeout(function() {
				var newGame = confirm( noBodyWon ? "No body WON :( Would you like to have one more battle??" : "Would you like to have one more battle??");
				if (newGame) {
					self.restartGame();
				}
			}, 300);
		}
	}

	/**
	 * updates default values and starts game again
	 **/
	this.restartGame = function() {
		gameIsOver = false;
		noBodyWon = false;
		this.fillGrid();
		this.init();
		$(window).trigger('game.restart');
	}

	/**
	 * @return {Boolean} true - if no body won the game
	 **/
	this.isNoBodyWon = function() {
		return noBodyWon;
	}
}


/**
 * Construstor for Application controller, entry point to the app, collector of primary information about players
 **/
var AppController = function() {
	var players = {}
	this.init = function() {
		this.initListeners();
	}

	/**
	 * Listener to submit event of the form. 
	 * Perform serealizing data from forms and changing current view after button click
	 **/
	this.initListeners = function() {
		var self = this;
		$('form').on('submit', function( e ) {
			self.addPlayer( this );
			if ( players.player2 ) {
				self.initGame();
				$('#board').show();
			}
			return false;
		})
	}

	/**
	 * Serializes data from form, building player model
	 * @param {DOM element} form. Represents current active form to retrieve data from
	 **/
	this.addPlayer = function( form ) {
		var playerInfo = {
			name: $('input[type="text"]', form).val(),
			sign: $('input[type="radio"]:checked', form).val(),
			index: $(form).data('player')
		}
		if ( !playerInfo.sign ) {
			playerInfo.sign = (players.player1.sign == "circle") ? "cross" : "circle"
		}
		players['player' + playerInfo.index] = playerInfo;
		$(form).remove();
	}
	/**
	 * Instatiates Controller and passes it as a param to the View during View instantiation. 
	 **/
	this.initGame = function() {
		new View( new GameController( this.getPlayers() ) );
	}
	/**
	 * Returns private object with players
	 **/
	this.getPlayers = function() {
		return players;
	}
}


//App START
var App = new AppController();
App.init();