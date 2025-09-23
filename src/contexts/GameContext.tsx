import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import type {
  GameState,
  GameAction,
  GameContextType,
  StoryData,
  StoryNode,
  Choice,
  Player,
} from "../types/game.d";
import {
  saveGame as persistSaveGame,
  loadGame as persistLoadGame,
} from "../services/persistence";
import storyData from "../data/story.json";

// LocalStorage key for game save data - removed, using persistence service now

// Initial player state
const createInitialPlayer = (name: string = ""): Player => ({
  name,
  hp: 100,
  maxHp: 100,
  inventory: [],
});

// Initial game state
const createInitialGameState = (playerName: string = ""): GameState => ({
  player: createInitialPlayer(playerName),
  currentNodeId: "start",
  isGameOver: false,
  isVictory: false,
  visitedNodes: new Set<string>(),
  gameStarted: false,
});

// Game state reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "START_GAME":
      return {
        ...state,
        gameStarted: true,
        player: {
          ...state.player,
          name: action.playerName || state.player.name,
        },
      };

    case "SET_PLAYER_NAME":
      return {
        ...state,
        player: {
          ...state.player,
          name: action.name,
        },
      };

    case "NAVIGATE_TO_NODE":
      const newVisitedNodes = new Set(state.visitedNodes);
      newVisitedNodes.add(action.nodeId);

      const targetNode = (storyData as StoryData)[action.nodeId];
      let newState = {
        ...state,
        currentNodeId: action.nodeId,
        visitedNodes: newVisitedNodes,
      };

      // Check if this is an ending node
      if (targetNode?.isEnding) {
        // Determine if it's a victory or defeat based on node content
        const isVictoryEnding =
          targetNode.text.toLowerCase().includes("saved") ||
          targetNode.text.toLowerCase().includes("victory") ||
          targetNode.text.toLowerCase().includes("sun begins to rise");

        newState = {
          ...newState,
          isGameOver: !isVictoryEnding,
          isVictory: isVictoryEnding,
        };
      }

      return newState;

    case "ADD_ITEM":
      if (state.player.inventory.includes(action.item)) {
        return state; // Don't add duplicate items
      }
      return {
        ...state,
        player: {
          ...state.player,
          inventory: [...state.player.inventory, action.item],
        },
      };

    case "TAKE_DAMAGE":
      const newHp = Math.max(0, state.player.hp - action.amount);
      const isDead = newHp <= 0;

      return {
        ...state,
        player: {
          ...state.player,
          hp: newHp,
        },
        isGameOver: isDead,
        isVictory: false,
        // If player dies, navigate to game over node
        currentNodeId: isDead ? "gameOver_hp" : state.currentNodeId,
      };

    case "HEAL":
      return {
        ...state,
        player: {
          ...state.player,
          hp: Math.min(state.player.maxHp, state.player.hp + action.amount),
        },
      };

    case "APPLY_CHOICE_EFFECTS":
      let effectState = { ...state };

      action.effects.forEach((effect) => {
        switch (effect.type) {
          case "hp":
            const hpChange = Number(effect.value);
            const currentHp = effectState.player.hp;
            const newHp = Math.max(
              0,
              Math.min(effectState.player.maxHp, currentHp + hpChange)
            );
            const isDead = newHp <= 0;

            effectState = {
              ...effectState,
              player: {
                ...effectState.player,
                hp: newHp,
              },
              isGameOver: isDead,
              currentNodeId: isDead ? "gameOver_hp" : effectState.currentNodeId,
            };
            break;

          case "item":
            const item = String(effect.value);
            if (!effectState.player.inventory.includes(item)) {
              effectState = {
                ...effectState,
                player: {
                  ...effectState.player,
                  inventory: [...effectState.player.inventory, item],
                },
              };
            }
            break;

          case "flag":
            // Handle game flags if needed in the future
            break;
        }
      });

      return effectState;

    case "END_GAME":
      return {
        ...state,
        isGameOver: !action.isVictory,
        isVictory: action.isVictory,
      };

    case "RESET_GAME":
      return createInitialGameState(state.player.name);

    case "LOAD_SAVED_GAME":
      // Convert visitedNodes array back to Set if needed
      const loadedState = {
        ...action.savedState,
        visitedNodes: new Set(Array.from(action.savedState.visitedNodes)),
      };
      return loadedState;

    default:
      return state;
  }
};

// Create the context
const GameContext = createContext<GameContextType | null>(null);

// GameProvider component
interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
  const [gameState, dispatch] = useReducer(
    gameReducer,
    createInitialGameState()
  );

  // Get current story node
  const getCurrentNode = useCallback((): StoryNode | null => {
    return (storyData as StoryData)[gameState.currentNodeId] || null;
  }, [gameState.currentNodeId]);

  // Check if player can select a choice (has required item)
  const canSelectChoice = useCallback(
    (choice: Choice): boolean => {
      if (!choice.requires) return true;
      return gameState.player.inventory.includes(choice.requires);
    },
    [gameState.player.inventory]
  );

  // Check if choice should be hidden
  const shouldHideChoice = useCallback(
    (choice: Choice): boolean => {
      if (!choice.hideIf) return false;
      return gameState.player.inventory.includes(choice.hideIf);
    },
    [gameState.player.inventory]
  );

  // Save game to localStorage using persistence service
  const saveGame = useCallback(() => {
    try {
      const result = persistSaveGame(gameState);
      if (!result.success) {
        console.error("Failed to save game:", result.error);
      }
    } catch (error) {
      console.error("Failed to save game:", error);
    }
  }, [gameState]);

  // Load game from localStorage using persistence service
  const loadGame = useCallback((): boolean => {
    try {
      const result = persistLoadGame();
      if (result.success && result.gameState) {
        dispatch({ type: "LOAD_SAVED_GAME", savedState: result.gameState });
        return true;
      } else {
        console.warn("Failed to load game:", result.error);
        return false;
      }
    } catch (error) {
      console.error("Failed to load game:", error);
      return false;
    }
  }, []);

  // Auto-save when game state changes (but not on initial load)
  useEffect(() => {
    if (gameState.gameStarted && gameState.player.name) {
      saveGame();
    }
  }, [gameState, saveGame]);

  // Process node actions when arriving at a new node
  useEffect(() => {
    const currentNode = getCurrentNode();
    if (currentNode?.onArrive && gameState.gameStarted) {
      const { onArrive } = currentNode;

      if (onArrive.addItem) {
        dispatch({ type: "ADD_ITEM", item: onArrive.addItem });
      }

      if (onArrive.takeDamage) {
        dispatch({ type: "TAKE_DAMAGE", amount: onArrive.takeDamage });
      }

      if (onArrive.heal) {
        dispatch({ type: "HEAL", amount: onArrive.heal });
      }
    }
  }, [gameState.currentNodeId, gameState.gameStarted, getCurrentNode]);

  const contextValue: GameContextType = {
    gameState,
    dispatch,
    story: storyData as StoryData,
    getCurrentNode,
    canSelectChoice,
    shouldHideChoice,
    saveGame,
    loadGame,
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
};

// Custom hook to use the GameContext
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

export default GameContext;
