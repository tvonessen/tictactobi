import { winningCombinations } from "./const.mjs";

export function computeMove(board, computerPlayer) {
	// Check if the current player can win in the next move
	const winningMoves = findPriorityMoves(board, computerPlayer);
	if (winningMoves.length > 0) {
		return winningMoves[0]; // Return the first winning move
	}

	// Check if opponent can win in the next move
	const opponent = computerPlayer === "X" ? "O" : "X";

	const mustBlocks = findPriorityMoves(board, opponent);
	if (mustBlocks.length > 0) {
		return mustBlocks[0]; // Block the opponent's winning move
	}

	// Check which move it is
	const moveCount = board.filter((cell) => cell !== null).length;

	if (moveCount === 1) {
		// Check if the first move was in the center
		if (board[4] !== null) {
			return randomCorner();
		}
		// Otherwise, pick the center
		return 4; // Then center is the best move
	}

	if ([2, 3].includes(moveCount)) {
		// Find and adjacent cell to the first move
		const firstMove = board.findIndex((cell) => cell === computerPlayer);
		const adjacentCells = [
			firstMove - 1,
			firstMove + 1,
			firstMove - 3,
			firstMove + 3,
		].filter((cell) => cell >= 0 && cell <= 8);
		const emptyAdjacentCells = adjacentCells.filter(
			(cell) => board[cell] === null,
		);
		if (emptyAdjacentCells.length > 0) {
			const randomIndex = Math.floor(Math.random() * emptyAdjacentCells.length);
			return emptyAdjacentCells[randomIndex]; // Random adjacent cell
		}
	}

	// From here on, there should be either a winning move or a block.
	// If it ends up down here, pick a random cell
	const emptyCells = board
		.map((field, i) => ({ index: i, value: field }))
		.filter((cell) => cell.value === null);
	const randomIndex = Math.floor(Math.random() * emptyCells.length);
	return emptyCells[randomIndex].index; // Random cell
}

/**
 * Finds the third field in a winning combination for the given player.
 * @param {("X" | "O" | null)[]} board - The current state of the board.
 * @param {"X" | "O"} player - The player to check for winning moves.
 * @returns {number[]} An array of indices representing the winning moves.
 * If no winning moves are found, an empty array is returned.
 */
function findPriorityMoves(board, player) {
	return winningCombinations
		.filter((combination) => {
			return (
				2 ===
				combination.reduce(
					// @ts-ignore
					(prev, field) => prev + (board[field] === player ? 1 : 0),
					0,
				)
			);
		})
		.map((combination) => combination.find((field) => board[field] === null))
		.filter((field) => field !== undefined);
}

/**
 * Returns a random corner index from the corners of the Tic Tac Toe board.
 * @returns {number} A random corner index (0, 2, 6, or 8).
 */
function randomCorner() {
	const corners = [0, 2, 6, 8];
	const randomIndex = Math.floor(Math.random() * corners.length);
	return corners[randomIndex]; // Random corner
}
