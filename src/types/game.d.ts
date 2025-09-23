// Player-related types
export interface Player {
  name: string;
  hp: number;
  maxHp: number;
  inventory: string[];
}

// Game state management
export interface GameState {
  player: Player;
  currentNodeId: string;
  isGameOver: boolean;
  isVictory: boolean;
  visitedNodes: Set<string>;
  gameStarted: boolean;
}

// Choice system
export interface Choice {
  text: string;
  to: string;
  requires?: string; // Item required to select this choice
  hideIf?: string; // Hide choice if player has this item
  effects?: ChoiceEffect[]; // Effects when choice is selected
  jumpscareAsset?: string; // Path to jumpscare asset (video, image, .vg file)
}

// Choice effects
export interface ChoiceEffect {
  type: "hp" | "item" | "flag";
  value: number | string;
}

// Story node structure
export interface StoryNode {
  id?: string; // Node identifier
  text: string;
  choices?: Choice[];
  onArrive?: NodeAction;
  isEnding?: boolean;
  metadata?: {
    title?: string;
    location?: string;
    characterImage?: string;
    backgroundImage?: string;
    jumpscareImage?: string;
    mood?: "tense" | "peaceful" | "mysterious" | "dangerous" | "hopeful";
    backgroundMusic?: string;
  };
}

// Actions that can occur when arriving at a node
export interface NodeAction {
  addItem?: string;
  takeDamage?: number;
  heal?: number;
  setFlag?: string;
}

// Game action types for state management
export type GameAction =
  | { type: "START_GAME"; playerName?: string }
  | { type: "NAVIGATE_TO_NODE"; nodeId: string }
  | { type: "APPLY_CHOICE_EFFECTS"; effects: ChoiceEffect[] }
  | { type: "ADD_ITEM"; item: string }
  | { type: "TAKE_DAMAGE"; amount: number }
  | { type: "HEAL"; amount: number }
  | { type: "SET_PLAYER_NAME"; name: string }
  | { type: "RESET_GAME" }
  | { type: "END_GAME"; isVictory: boolean }
  | { type: "LOAD_SAVED_GAME"; savedState: GameState };

// Story data structure (matches story.json format)
export interface StoryData {
  [nodeId: string]: StoryNode;
}

// Game context type for React context
export interface GameContextType {
  gameState: GameState;
  dispatch: (action: GameAction) => void;
  story: StoryData;
  getCurrentNode: () => StoryNode | null;
  canSelectChoice: (choice: Choice) => boolean;
  shouldHideChoice: (choice: Choice) => boolean;
  saveGame: () => void;
  loadGame: () => boolean;
}

// Utility types
export type GameStatus = "menu" | "playing" | "gameOver" | "victory";

export interface GameStats {
  nodesVisited: number;
  itemsCollected: number;
  damageReceived: number;
  choicesMade: number;
}
