import type {
  GameState,
  NodeAction,
  Choice,
  StoryNode,
  GameAction,
} from "../types/game.d";

/**
 * Game Engine Service
 * Handles game logic, effects application, and requirement checking
 */

/**
 * Apply effects from a node action to the game state
 * @param action - The node action to apply
 * @param gameState - Current game state
 * @returns Array of game actions to dispatch
 */
export function applyEffects(
  action: NodeAction,
  gameState: GameState
): GameAction[] {
  const actions: GameAction[] = [];

  // Add item to inventory
  if (action.addItem) {
    // Check if item already exists to avoid duplicates
    if (!gameState.player.inventory.includes(action.addItem)) {
      actions.push({ type: "ADD_ITEM", item: action.addItem });
    }
  }

  // Apply damage
  if (action.takeDamage && action.takeDamage > 0) {
    actions.push({ type: "TAKE_DAMAGE", amount: action.takeDamage });
  }

  // Apply healing
  if (action.heal && action.heal > 0) {
    actions.push({ type: "HEAL", amount: action.heal });
  }

  // Note: setFlag would be implemented here if we had a flag system
  // This could be added later for more complex game mechanics
  if (action.setFlag) {
    console.log(`Setting flag: ${action.setFlag}`);
    // Future implementation: actions.push({ type: 'SET_FLAG', flag: action.setFlag });
  }

  return actions;
}

/**
 * Check if a choice's requirements are met
 * @param choice - The choice to check
 * @param gameState - Current game state
 * @returns true if requirements are met, false otherwise
 */
export function checkRequirements(
  choice: Choice,
  gameState: GameState
): boolean {
  // If no requirements, choice is always available
  if (!choice.requires) {
    return true;
  }

  // Check if player has the required item
  return gameState.player.inventory.includes(choice.requires);
}

/**
 * Check if a choice should be hidden based on hideIf condition
 * @param choice - The choice to check
 * @param gameState - Current game state
 * @returns true if choice should be hidden, false otherwise
 */
export function shouldHideChoice(
  choice: Choice,
  gameState: GameState
): boolean {
  // If no hideIf condition, never hide
  if (!choice.hideIf) {
    return false;
  }

  // Hide if player has the specified item
  return gameState.player.inventory.includes(choice.hideIf);
}

/**
 * Get all available choices for the current node
 * @param node - The current story node
 * @param gameState - Current game state
 * @returns Array of available choices (filtered by requirements and visibility)
 */
export function getAvailableChoices(
  node: StoryNode,
  gameState: GameState
): Choice[] {
  if (!node.choices) {
    return [];
  }

  return node.choices.filter((choice) => {
    // Hide choices that should be hidden
    if (shouldHideChoice(choice, gameState)) {
      return false;
    }

    // Always show choices, but mark unavailable ones
    return true;
  });
}

/**
 * Get choices that are visible but not selectable (due to unmet requirements)
 * @param node - The current story node
 * @param gameState - Current game state
 * @returns Array of unselectable choices
 */
export function getUnselectableChoices(
  node: StoryNode,
  gameState: GameState
): Choice[] {
  if (!node.choices) {
    return [];
  }

  return node.choices.filter((choice) => {
    // Only include visible choices that don't meet requirements
    return (
      !shouldHideChoice(choice, gameState) &&
      !checkRequirements(choice, gameState)
    );
  });
}

/**
 * Calculate the player's current health percentage
 * @param gameState - Current game state
 * @returns Health percentage (0-100)
 */
export function getHealthPercentage(gameState: GameState): number {
  return Math.round((gameState.player.hp / gameState.player.maxHp) * 100);
}

/**
 * Check if the player is in critical health (below 25%)
 * @param gameState - Current game state
 * @returns true if health is critical
 */
export function isCriticalHealth(gameState: GameState): boolean {
  return getHealthPercentage(gameState) < 25;
}

/**
 * Check if the game should end due to player death
 * @param gameState - Current game state
 * @returns true if player should die
 */
export function shouldPlayerDie(gameState: GameState): boolean {
  return gameState.player.hp <= 0;
}

/**
 * Determine if a story node represents a victory ending
 * @param node - The story node to check
 * @returns true if it's a victory ending
 */
export function isVictoryEnding(node: StoryNode): boolean {
  if (!node.isEnding) {
    return false;
  }

  const victoryKeywords = [
    "saved",
    "victory",
    "sun begins to rise",
    "you have won",
    "success",
    "triumph",
    "hero",
    "you win",
  ];

  const nodeText = node.text.toLowerCase();
  return victoryKeywords.some((keyword) => nodeText.includes(keyword));
}

/**
 * Determine if a story node represents a defeat ending
 * @param node - The story node to check
 * @returns true if it's a defeat ending
 */
export function isDefeatEnding(node: StoryNode): boolean {
  if (!node.isEnding) {
    return false;
  }

  const defeatKeywords = [
    "game over",
    "you die",
    "death",
    "failure",
    "defeat",
    "your hunt ends",
    "darkness consumes",
    "you collapse",
  ];

  const nodeText = node.text.toLowerCase();
  return defeatKeywords.some((keyword) => nodeText.includes(keyword));
}

/**
 * Get game statistics based on current state
 * @param gameState - Current game state
 * @returns Object with various game statistics
 */
export function getGameStats(gameState: GameState) {
  return {
    nodesVisited: gameState.visitedNodes.size,
    itemsCollected: gameState.player.inventory.length,
    healthPercentage: getHealthPercentage(gameState),
    damageReceived: gameState.player.maxHp - gameState.player.hp,
    isCriticalHealth: isCriticalHealth(gameState),
    uniqueItems: [...new Set(gameState.player.inventory)].length,
  };
}

/**
 * Validate a story node structure
 * @param nodeId - The node ID
 * @param node - The node object
 * @returns Object with validation results
 */
export function validateStoryNode(nodeId: string, node: StoryNode) {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!node.text || node.text.trim() === "") {
    errors.push(`Node '${nodeId}' is missing text content`);
  }

  // Check choices
  if (node.choices) {
    node.choices.forEach((choice, index) => {
      if (!choice.text || choice.text.trim() === "") {
        errors.push(`Node '${nodeId}' choice ${index} is missing text`);
      }
      if (!choice.to || choice.to.trim() === "") {
        errors.push(`Node '${nodeId}' choice ${index} is missing 'to' target`);
      }
    });
  } else if (!node.isEnding) {
    warnings.push(
      `Node '${nodeId}' has no choices and is not marked as ending`
    );
  }

  // Check actions
  if (node.onArrive) {
    const { takeDamage, heal } = node.onArrive;
    if (takeDamage !== undefined && takeDamage < 0) {
      warnings.push(`Node '${nodeId}' has negative damage value`);
    }
    if (heal !== undefined && heal < 0) {
      warnings.push(`Node '${nodeId}' has negative heal value`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Process a player's choice and return the resulting actions
 * @param choice - The selected choice
 * @param gameState - Current game state
 * @returns Object with navigation target and any additional actions
 */
export function processChoice(choice: Choice, gameState: GameState) {
  const result = {
    canSelect: checkRequirements(choice, gameState),
    targetNodeId: choice.to,
    actions: [] as GameAction[],
  };

  // If choice can't be selected, don't process it
  if (!result.canSelect) {
    return result;
  }

  // Add navigation action
  result.actions.push({ type: "NAVIGATE_TO_NODE", nodeId: choice.to });

  return result;
}

export default {
  applyEffects,
  checkRequirements,
  shouldHideChoice,
  getAvailableChoices,
  getUnselectableChoices,
  getHealthPercentage,
  isCriticalHealth,
  shouldPlayerDie,
  isVictoryEnding,
  isDefeatEnding,
  getGameStats,
  validateStoryNode,
  processChoice,
};
