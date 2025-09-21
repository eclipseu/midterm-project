/**
 * Story System Type Definitions
 * Defines the core story structure, choices, and effects system
 */

// Effect types for modifying game state
export interface Effect {
  type: "hp" | "item" | "flag" | "custom";
  action: "add" | "remove" | "set" | "modify";
  value: string | number;
  amount?: number; // For HP modifications
}

// Enhanced Choice definition with effects system
export interface StoryChoice {
  id?: string; // Unique identifier for the choice
  text: string; // Display text for the choice
  to?: string; // Target node ID (optional for choices with only effects)
  requires?: string | string[]; // Item(s) required to select this choice
  hideIf?: string | string[]; // Hide choice if player has these item(s)
  effects?: Effect[]; // Effects that occur when choice is selected
  condition?: string; // Optional condition string for complex logic
  disabled?: boolean; // Whether choice is disabled
  tooltip?: string; // Helpful text shown on hover/focus
}

// Enhanced StoryNode definition with comprehensive features
export interface StoryNodeComplete {
  id: string; // Unique node identifier
  text: string; // Main story text content
  choices?: StoryChoice[]; // Available choices from this node
  effects?: Effect[]; // Effects that occur when arriving at this node
  isEnding?: boolean; // Whether this is an ending node
  isVictory?: boolean; // Whether this ending is a victory
  tags?: string[]; // Tags for categorization (e.g., 'combat', 'peaceful', 'supernatural')
  metadata?: {
    title?: string; // Optional title for the scene
    location?: string; // Location name for context
    mood?: "tense" | "peaceful" | "mysterious" | "dangerous" | "hopeful";
    backgroundMusic?: string; // Audio file reference
    backgroundImage?: string; // Image file reference
  };
}

// Effect execution results
export interface EffectResult {
  success: boolean;
  message?: string;
  newHp?: number;
  addedItems?: string[];
  removedItems?: string[];
  setFlags?: Record<string, boolean>;
}

// Story validation types
export interface StoryValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  nodeCount: number;
  choiceCount: number;
  endingCount: number;
  unreachableNodes: string[];
}

// Story building utilities
export interface StoryBuilder {
  nodes: Map<string, StoryNodeComplete>;
  addNode: (node: StoryNodeComplete) => StoryBuilder;
  addChoice: (nodeId: string, choice: StoryChoice) => StoryBuilder;
  addEffect: (nodeId: string, effect: Effect) => StoryBuilder;
  validate: () => StoryValidation;
  build: () => StoryData;
}

// Story data collection (maps to JSON structure)
export interface StoryData {
  [nodeId: string]: StoryNodeComplete;
}

// Choice execution context
export interface ChoiceContext {
  currentNodeId: string;
  playerInventory: string[];
  playerHp: number;
  playerMaxHp: number;
  visitedNodes: Set<string>;
  gameFlags: Record<string, boolean>;
}

// Effect execution context
export interface EffectContext {
  playerHp: number;
  playerMaxHp: number;
  playerInventory: string[];
  gameFlags: Record<string, boolean>;
}

// Story progression tracking
export interface StoryProgress {
  currentNodeId: string;
  visitedNodes: string[];
  choicesMade: Array<{
    nodeId: string;
    choiceId: string;
    choiceText: string;
    timestamp: number;
  }>;
  effectsApplied: Array<{
    nodeId: string;
    effect: Effect;
    result: EffectResult;
    timestamp: number;
  }>;
}

// Narrative branch definitions
export interface StoryBranch {
  id: string;
  name: string;
  description: string;
  startNodeId: string;
  endNodeIds: string[];
  requiredItems?: string[];
  requiredFlags?: Record<string, boolean>;
}

// Story statistics
export interface StoryStatistics {
  totalNodes: number;
  totalChoices: number;
  totalEndings: number;
  totalVictoryEndings: number;
  totalDefeatEndings: number;
  averageChoicesPerNode: number;
  maxChoicesInNode: number;
  uniqueItems: string[];
  totalEffects: number;
  nodesByTag: Record<string, number>;
  branchCount: number;
}

// Story event system
export interface StoryEvent {
  type: "nodeEntered" | "choiceSelected" | "effectApplied" | "gameEnded";
  nodeId: string;
  choiceId?: string;
  effect?: Effect;
  result?: EffectResult;
  timestamp: number;
}

// Conditional logic types
export type ConditionOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "greaterThan"
  | "lessThan";

export interface Condition {
  type: "inventory" | "hp" | "flag" | "visitedNode";
  operator: ConditionOperator;
  value: string | number | boolean;
  target?: string; // For inventory items, flag names, etc.
}

// Advanced choice with complex conditions
export interface AdvancedChoice extends StoryChoice {
  conditions?: Condition[];
  weight?: number; // For random choice selection
  priority?: number; // For choice ordering
  group?: string; // For choice grouping
}

// Story template for procedural generation
export interface StoryTemplate {
  id: string;
  name: string;
  description: string;
  nodeTemplates: Array<{
    id: string;
    textTemplates: string[];
    choiceTemplates: AdvancedChoice[];
    tags: string[];
  }>;
  variableSlots: Record<string, string[]>; // For random content insertion
}

// Export compatibility types (matching existing game.d.ts)
export { StoryNodeComplete as StoryNode };
export { StoryChoice as Choice };

// Legacy compatibility - maps to existing game.d.ts types
export interface LegacyStoryNode {
  text: string;
  choices?: LegacyChoice[];
  onArrive?: {
    addItem?: string;
    takeDamage?: number;
    heal?: number;
    setFlag?: string;
  };
  isEnding?: boolean;
}

export interface LegacyChoice {
  text: string;
  to: string;
  requires?: string;
  hideIf?: string;
}

// Conversion utilities between legacy and new formats
export interface StoryConverter {
  toLegacyFormat: (modern: StoryNodeComplete) => LegacyStoryNode;
  fromLegacyFormat: (legacy: LegacyStoryNode, id: string) => StoryNodeComplete;
  convertStoryData: (modernData: StoryData) => Record<string, LegacyStoryNode>;
}
