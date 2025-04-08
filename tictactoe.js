import { computeMove } from "./ai.mjs";
import { winningCombinations } from "./const.mjs";

/**
 * Tic Tac Toe Game
 * This script implements a simple Tic Tac Toe game with a graphical user interface.
 * Players can choose to play against each other or against a computer opponent.
 * The game keeps track of the current player, checks for winning conditions,
 * and allows players to restart the game.
 *
 * @version 1.0
 * @license MIT
 * (c) 2023 Tobias von Essen
 * This code is licensed under the MIT License.
 */

document.addEventListener("DOMContentLoaded", () => {
	let cells = document.querySelectorAll("[data-cell]");
	let gameMessage = document.getElementById("game-message");
	let gameContainer = document.getElementById("game-container");
	let restartButton = document.getElementById("restart-button");
	let gameBoard = document.getElementById("game-board");
	let opponent;
	let playerSymbol; // required for AI

	while (
		cells.length === 0 ||
		!(gameMessage instanceof HTMLElement) ||
		!restartButton ||
		!gameContainer
	) {
		// Wait for the document to be fully loaded and all references to be available.
		// This should not necessary in a real-world scenario, but is used here to ensure
		// the code runs after the DOM is ready.
		cells = document.querySelectorAll("[data-cell]");
		gameMessage = document.getElementById("game-message");
		restartButton = document.getElementById("restart-button");
		gameContainer = document.getElementById("game-container");
		gameBoard = document.getElementById("game-board");
	}

	let currentPlayer = "X";
	const board = Array(9).fill(null);

	// Add event handlers //

	cells.forEach((cell, index) => {
		cell.addEventListener("click touchstart", () =>
			handleClickCell(cell, index),
		);
		cell.addEventListener("mouseenter", handleHoverCell);
		cell.addEventListener("mouseleave", handleLeaveCell);
	});

	for (const button of document.querySelectorAll("#choose-opponent button")) {
		button.addEventListener("click touchstart", handleChooseOpponent);
	}

	for (const button of document.querySelectorAll("#choose-symbol button")) {
		button.addEventListener("click touchstart", handleChooseSymbol);
	}

	restartButton.addEventListener("click touchstart", restartGame);

	// functions //

	/**
	 * Handles the mouse enter event on a cell.
	 * Sets the cell's content to the current player's symbol.
	 * @param {Event} event - The mouse enter event.
	 */
	function handleHoverCell(event) {
		if (event.target instanceof HTMLElement) {
			const cell = event.target;
			cell.textContent = currentPlayer;
		}
	}

	/**
	 * Handles the mouse leave event on a cell.
	 * Clears the cell's content.
	 * @param {Event} event - The mouse leave event.
	 */
	function handleLeaveCell(event) {
		if (event.target instanceof HTMLElement) {
			const cell = event.target;
			cell.textContent = "";
		}
	}

	/**
	 * Handles the click event on a cell. Updates the cell's content,
	 * checks for a winner, and switches the current player.
	 * @param {Element} cell - The clicked cell element.
	 * @param {number} index - The index of the clicked cell in the board array.
	 */
	function handleClickCell(cell, index) {
		// Place the current player's mark
		cell.textContent = currentPlayer;
		cell.setAttribute("data-cell", currentPlayer);
		cell.removeEventListener("mouseenter", handleHoverCell);
		cell.removeEventListener("mouseleave", handleLeaveCell);
		board[index] = currentPlayer;

		// Check for a winner
		const winningCombination =
			winningCombinations.find((combination) =>
				combination.every((field) => board[field] === currentPlayer),
			) ?? null;

		if (winningCombination) {
			if (opponent === "computer") {
				if (gameMessage)
					gameMessage.textContent =
						currentPlayer === playerSymbol ? "You win!" : "The computer wins!";
			} else if (gameMessage)
				gameMessage.textContent = `${currentPlayer} Wins!`;
			endGame(winningCombination);
			return;
		}

		// Check for a draw
		if (board.every((cell) => cell !== null)) {
			if (gameMessage) gameMessage.textContent = `It's a Draw! ¯\\_(ツ)_/¯`;
			endGame();
			return;
		}

		// Switch to the next player
		currentPlayer = currentPlayer === "X" ? "O" : "X";
		if (opponent === "computer" && currentPlayer !== playerSymbol) {
			computerMove();
		} else if (gameMessage)
			gameMessage.textContent =
				opponent === "computer" ? "Your turn" : `${currentPlayer} 's turn`;
	}

	/**
	 * Handles the click event for choosing an opponent.
	 * Sets the opponent type and updates the game container's content.
	 * @param {Event} clickEvent - The click event.
	 */
	function handleChooseOpponent(clickEvent) {
		if (!(clickEvent.target instanceof HTMLButtonElement)) return;
		opponent = clickEvent.target.id.includes("computer") ? "computer" : "human";
		if (opponent === "computer") {
			gameContainer?.setAttribute("data-content", "choose-symbol");
		} else {
			gameContainer?.setAttribute("data-content", "game-board");
			if (gameMessage) gameMessage.textContent = `${currentPlayer} 's turn`;
		}
	}

	/**
	 * Handles the click event for choosing a symbol.
	 * Sets the current player symbol and updates the game container's content.
	 * @param {Event} clickEvent - The click event.
	 */
	function handleChooseSymbol(clickEvent) {
		if (!(clickEvent.target instanceof HTMLButtonElement)) return;
		playerSymbol = clickEvent.target.textContent;
		gameContainer?.setAttribute("data-content", "game-board");

		if (playerSymbol === "X") {
			currentPlayer = "X";
			if (gameMessage) gameMessage.textContent = "Your turn";
		} else {
			computerMove();
		}
	}

	function computerMove() {
		gameBoard?.classList.add("computer-busy");
		for (const cell of cells) {
			cell.removeEventListener("mouseenter", handleHoverCell);
			cell.removeEventListener("mouseleave", handleLeaveCell);
		}
		if (gameMessage) gameMessage.textContent = `Computer's thinking ...`;
		setTimeout(() => {
			const move = computeMove(board, currentPlayer);
			cells[move].dispatchEvent(new Event("click touchstart"));
			gameBoard?.classList.remove("computer-busy");
			for (const cell of cells) {
				cell.addEventListener("mouseenter", handleHoverCell);
				cell.addEventListener("mouseleave", handleLeaveCell);
			}
		}, 1500);
	}

	/**
	 * Ends the game by muting the non-winning cells and marking the game as over.
	 * @param {number[]=} winningCombination - The winning combination of cells, if any.
	 */
	function endGame(winningCombination) {
		if (winningCombination) {
			cells.forEach((cell, index) => {
				if (!winningCombination.includes(index)) {
					cell.classList.add("muted");
				}
			});
		}
		document.getElementById("game-board")?.classList.add("game-over");
	}

	/**
	 * Restarts the game by resetting the board and current player.
	 * Updates the game message and removes any muted classes from cells.
	 * Resets the game container's content to the choose opponent screen.
	 */
	function restartGame() {
		// Restart the game
		board.fill(null);
		currentPlayer = "X";
		if (gameMessage)
			gameMessage.textContent = "Welcome to a game of Tic Tac Toe!";
		gameContainer?.setAttribute("data-content", "choose-opponent");
		gameBoard?.classList.remove("game-over");
		for (const cell of cells) {
			cell.textContent = "";
			cell.classList.remove("muted");
			cell.removeAttribute("data-cell");
			cell.addEventListener("mouseenter", handleHoverCell);
			cell.addEventListener("mouseleave", handleLeaveCell);
		}
	}
});
