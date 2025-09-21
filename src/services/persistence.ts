import type { GameState } from "../types/game.d";

/**
 * Game Persistence Service
 * Provides utility functions for saving, loading, and managing game state in localStorage
 */

// Constants for localStorage keys
const SAVE_KEYS = {
  CURRENT_GAME: "san-gubat-current-game",
  GAME_SETTINGS: "san-gubat-settings",
  PLAYER_STATS: "san-gubat-player-stats",
} as const;

// Interface for saved game data
interface SavedGameData {
  gameState: GameState;
  timestamp: number;
  version: string;
  playerName: string;
}

// Interface for player statistics
interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  totalPlayTime: number;
  lastPlayedAt: number;
  bestEnding: string | null;
}

// Interface for game settings
interface GameSettings {
  autoSave: boolean;
  soundEnabled: boolean;
  theme: "light" | "dark";
  textSpeed: "slow" | "medium" | "fast";
}

/**
 * Save current game state to localStorage
 * @param state - Current game state to save
 * @returns Success status and any error message
 */
export function saveGame(state: GameState): {
  success: boolean;
  error?: string;
} {
  try {
    // Validate state before saving
    if (!state.player.name) {
      return { success: false, error: "Cannot save game without player name" };
    }

    // Prepare save data
    const saveData: SavedGameData = {
      gameState: {
        ...state,
        // Convert Set to Array for JSON serialization
        visitedNodes: Array.from(state.visitedNodes) as any,
      },
      timestamp: Date.now(),
      version: "1.0.0",
      playerName: state.player.name,
    };

    // Save to localStorage
    localStorage.setItem(SAVE_KEYS.CURRENT_GAME, JSON.stringify(saveData));

    console.log("Game saved successfully:", {
      player: state.player.name,
      location: state.currentNodeId,
      hp: state.player.hp,
      items: state.player.inventory.length,
    });

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Failed to save game:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Load game state from localStorage
 * @returns Loaded game state or null if no save exists
 */
export function loadGame(): {
  success: boolean;
  gameState?: GameState;
  error?: string;
} {
  try {
    const savedData = localStorage.getItem(SAVE_KEYS.CURRENT_GAME);

    if (!savedData) {
      return { success: false, error: "No saved game found" };
    }

    const parsedData: SavedGameData = JSON.parse(savedData);

    // Validate save data structure
    if (!parsedData.gameState || !parsedData.gameState.player) {
      return { success: false, error: "Invalid save data structure" };
    }

    // Restore the game state with proper Set conversion
    const gameState: GameState = {
      ...parsedData.gameState,
      // Convert Array back to Set
      visitedNodes: new Set(
        Array.isArray(parsedData.gameState.visitedNodes)
          ? parsedData.gameState.visitedNodes
          : Array.from(parsedData.gameState.visitedNodes as Set<string>)
      ),
    };

    console.log("Game loaded successfully:", {
      player: gameState.player.name,
      location: gameState.currentNodeId,
      saveTime: new Date(parsedData.timestamp).toLocaleString(),
    });

    return { success: true, gameState };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Failed to load game:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Clear saved game data from localStorage
 * @param clearAll - Whether to clear all data including settings and stats
 * @returns Success status and any error message
 */
export function clearGame(clearAll: boolean = false): {
  success: boolean;
  error?: string;
} {
  try {
    // Always clear the current game save
    localStorage.removeItem(SAVE_KEYS.CURRENT_GAME);

    if (clearAll) {
      // Clear all game-related data
      localStorage.removeItem(SAVE_KEYS.GAME_SETTINGS);
      localStorage.removeItem(SAVE_KEYS.PLAYER_STATS);
      console.log("All game data cleared");
    } else {
      console.log("Current game save cleared");
    }

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Failed to clear game data:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Check if a saved game exists
 * @returns Object with existence status and save info
 */
export function hasSavedGame(): {
  exists: boolean;
  saveInfo?: { playerName: string; timestamp: number; location: string };
} {
  try {
    const savedData = localStorage.getItem(SAVE_KEYS.CURRENT_GAME);

    if (!savedData) {
      return { exists: false };
    }

    const parsedData: SavedGameData = JSON.parse(savedData);

    return {
      exists: true,
      saveInfo: {
        playerName: parsedData.playerName,
        timestamp: parsedData.timestamp,
        location: parsedData.gameState.currentNodeId,
      },
    };
  } catch (error) {
    console.error("Error checking for saved game:", error);
    return { exists: false };
  }
}

/**
 * Save player statistics
 * @param stats - Player statistics to save
 */
export function savePlayerStats(stats: Partial<PlayerStats>): void {
  try {
    const existingStats = getPlayerStats();
    const updatedStats: PlayerStats = { ...existingStats, ...stats };

    localStorage.setItem(SAVE_KEYS.PLAYER_STATS, JSON.stringify(updatedStats));
  } catch (error) {
    console.error("Failed to save player stats:", error);
  }
}

/**
 * Get player statistics
 * @returns Player statistics object
 */
export function getPlayerStats(): PlayerStats {
  try {
    const statsData = localStorage.getItem(SAVE_KEYS.PLAYER_STATS);

    if (!statsData) {
      // Return default stats
      return {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        totalPlayTime: 0,
        lastPlayedAt: 0,
        bestEnding: null,
      };
    }

    return JSON.parse(statsData);
  } catch (error) {
    console.error("Failed to load player stats:", error);
    // Return default stats on error
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      totalPlayTime: 0,
      lastPlayedAt: 0,
      bestEnding: null,
    };
  }
}

/**
 * Save game settings
 * @param settings - Game settings to save
 */
export function saveGameSettings(settings: Partial<GameSettings>): void {
  try {
    const existingSettings = getGameSettings();
    const updatedSettings: GameSettings = { ...existingSettings, ...settings };

    localStorage.setItem(
      SAVE_KEYS.GAME_SETTINGS,
      JSON.stringify(updatedSettings)
    );
  } catch (error) {
    console.error("Failed to save game settings:", error);
  }
}

/**
 * Get game settings
 * @returns Game settings object
 */
export function getGameSettings(): GameSettings {
  try {
    const settingsData = localStorage.getItem(SAVE_KEYS.GAME_SETTINGS);

    if (!settingsData) {
      // Return default settings
      return {
        autoSave: true,
        soundEnabled: true,
        theme: "light",
        textSpeed: "medium",
      };
    }

    return JSON.parse(settingsData);
  } catch (error) {
    console.error("Failed to load game settings:", error);
    // Return default settings on error
    return {
      autoSave: true,
      soundEnabled: true,
      theme: "light",
      textSpeed: "medium",
    };
  }
}

/**
 * Export game save data as JSON string (for backup)
 * @returns JSON string of save data or null if no save exists
 */
export function exportSaveData(): string | null {
  try {
    const savedData = localStorage.getItem(SAVE_KEYS.CURRENT_GAME);
    return savedData;
  } catch (error) {
    console.error("Failed to export save data:", error);
    return null;
  }
}

/**
 * Import game save data from JSON string (for restore)
 * @param saveDataJson - JSON string containing save data
 * @returns Success status and any error message
 */
export function importSaveData(saveDataJson: string): {
  success: boolean;
  error?: string;
} {
  try {
    // Validate JSON format
    const parsedData: SavedGameData = JSON.parse(saveDataJson);

    // Basic validation
    if (!parsedData.gameState || !parsedData.gameState.player) {
      return { success: false, error: "Invalid save data format" };
    }

    // Save the imported data
    localStorage.setItem(SAVE_KEYS.CURRENT_GAME, saveDataJson);

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Invalid JSON format";
    return { success: false, error: errorMessage };
  }
}

/**
 * Get storage usage information
 * @returns Object with storage usage details
 */
export function getStorageInfo() {
  try {
    const currentGameSize =
      localStorage.getItem(SAVE_KEYS.CURRENT_GAME)?.length || 0;
    const settingsSize =
      localStorage.getItem(SAVE_KEYS.GAME_SETTINGS)?.length || 0;
    const statsSize = localStorage.getItem(SAVE_KEYS.PLAYER_STATS)?.length || 0;

    return {
      currentGameSize: Math.round((currentGameSize / 1024) * 100) / 100, // KB
      settingsSize: Math.round((settingsSize / 1024) * 100) / 100, // KB
      statsSize: Math.round((statsSize / 1024) * 100) / 100, // KB
      totalSize:
        Math.round(
          ((currentGameSize + settingsSize + statsSize) / 1024) * 100
        ) / 100, // KB
    };
  } catch (error) {
    console.error("Failed to get storage info:", error);
    return { currentGameSize: 0, settingsSize: 0, statsSize: 0, totalSize: 0 };
  }
}

// Export all functions as default object for convenient importing
export default {
  saveGame,
  loadGame,
  clearGame,
  hasSavedGame,
  savePlayerStats,
  getPlayerStats,
  saveGameSettings,
  getGameSettings,
  exportSaveData,
  importSaveData,
  getStorageInfo,
};
