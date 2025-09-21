import { z } from "zod";
import type { StoryData } from "../types/game.d";

/**
 * Story Parser Service
 * Validates and loads story.json using Zod schema validation
 */

// Zod schema for NodeAction
const NodeActionSchema = z
  .object({
    addItem: z.string().optional(),
    takeDamage: z.number().int().min(0).optional(),
    heal: z.number().int().min(0).optional(),
    setFlag: z.string().optional(),
  })
  .strict();

// Zod schema for Choice
const ChoiceSchema = z
  .object({
    text: z.string().min(1, "Choice text cannot be empty"),
    to: z.string().min(1, "Choice target cannot be empty"),
    requires: z.string().optional(),
    hideIf: z.string().optional(),
  })
  .strict();

// Zod schema for StoryNode
const StoryNodeSchema = z
  .object({
    text: z.string().min(1, "Story node text cannot be empty"),
    choices: z.array(ChoiceSchema).optional(),
    onArrive: NodeActionSchema.optional(),
    isEnding: z.boolean().optional(),
  })
  .strict()
  .refine(
    (node) => {
      // Either has choices or is an ending node
      return node.choices || node.isEnding;
    },
    {
      message: "Story node must have either choices or be marked as ending",
    }
  );

// Zod schema for complete story data
const StoryDataSchema = z
  .record(z.string().min(1, "Node ID cannot be empty"), StoryNodeSchema)
  .refine(
    (story) => {
      // Must have a 'start' node
      return "start" in story;
    },
    {
      message: "Story must contain a 'start' node",
    }
  );

/**
 * Validation result type
 */
export interface ValidationResult {
  success: boolean;
  data?: StoryData;
  errors: string[];
  warnings: string[];
}

/**
 * Parse and validate story data from JSON
 * @param jsonData - Raw JSON data to parse
 * @returns Validation result with parsed data or errors
 */
export function parseStoryData(jsonData: unknown): ValidationResult {
  const result: ValidationResult = {
    success: false,
    errors: [],
    warnings: [],
  };

  try {
    // Validate the data against the schema
    const validatedData = StoryDataSchema.parse(jsonData);

    // Additional custom validations
    const customValidation = validateStoryIntegrity(validatedData);

    result.success = customValidation.isValid;
    result.data = validatedData;
    result.errors = customValidation.errors;
    result.warnings = customValidation.warnings;
  } catch (error) {
    if (error instanceof z.ZodError) {
      result.errors = error.issues.map((err) => {
        const path = err.path.length > 0 ? ` at ${err.path.join(".")}` : "";
        return `${err.message}${path}`;
      });
    } else {
      result.errors = ["Unknown parsing error occurred"];
    }
  }

  return result;
}

/**
 * Load and validate story from JSON file content
 * @param jsonContent - String content of the JSON file
 * @returns Validation result
 */
export function loadStoryFromJson(jsonContent: string): ValidationResult {
  try {
    const parsedJson = JSON.parse(jsonContent);
    return parseStoryData(parsedJson);
  } catch (error) {
    return {
      success: false,
      errors: [
        `Invalid JSON format: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      ],
      warnings: [],
    };
  }
}

/**
 * Validate story integrity (cross-references, unreachable nodes, etc.)
 * @param story - Validated story data
 * @returns Validation result with detailed analysis
 */
function validateStoryIntegrity(story: StoryData) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const nodeIds = new Set(Object.keys(story));
  const referencedNodes = new Set<string>();
  const reachableNodes = new Set<string>();

  // Track all referenced nodes and check if they exist
  for (const [nodeId, node] of Object.entries(story)) {
    if (node.choices) {
      for (const choice of node.choices) {
        referencedNodes.add(choice.to);

        // Check if referenced node exists
        if (!nodeIds.has(choice.to)) {
          errors.push(
            `Node '${nodeId}' references non-existent node '${choice.to}'`
          );
        }
      }
    }
  }

  // Perform reachability analysis starting from 'start'
  const visited = new Set<string>();
  const queue = ["start"];

  while (queue.length > 0) {
    const currentNodeId = queue.shift()!;

    if (visited.has(currentNodeId)) {
      continue;
    }

    visited.add(currentNodeId);
    reachableNodes.add(currentNodeId);

    const currentNode = story[currentNodeId];
    if (currentNode?.choices) {
      for (const choice of currentNode.choices) {
        if (!visited.has(choice.to)) {
          queue.push(choice.to);
        }
      }
    }
  }

  // Check for unreachable nodes
  for (const nodeId of nodeIds) {
    if (!reachableNodes.has(nodeId)) {
      warnings.push(`Node '${nodeId}' is unreachable from start`);
    }
  }

  // Check for nodes with no choices that aren't endings
  for (const [nodeId, node] of Object.entries(story)) {
    if (!node.choices && !node.isEnding) {
      errors.push(
        `Node '${nodeId}' has no choices and is not marked as ending`
      );
    }
  }

  // Check for potential infinite loops (nodes with only self-referencing choices)
  for (const [nodeId, node] of Object.entries(story)) {
    if (node.choices && node.choices.length > 0) {
      const allChoicesPointToSelf = node.choices.every(
        (choice) => choice.to === nodeId
      );
      if (allChoicesPointToSelf) {
        warnings.push(
          `Node '${nodeId}' may create an infinite loop (all choices point to itself)`
        );
      }
    }
  }

  // Check for dead-end nodes (non-ending nodes with choices that all lead to endings)
  for (const [nodeId, node] of Object.entries(story)) {
    if (node.choices && !node.isEnding) {
      const allChoicesLeadToEndings = node.choices.every((choice) => {
        const targetNode = story[choice.to];
        return targetNode?.isEnding === true;
      });

      if (allChoicesLeadToEndings && node.choices.length > 0) {
        warnings.push(`Node '${nodeId}' only leads to ending nodes`);
      }
    }
  }

  // Validate item consistency
  validateItemConsistency(story, warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate item usage consistency across the story
 * @param story - Story data
 * @param warnings - Array to add warnings to
 */
function validateItemConsistency(story: StoryData, warnings: string[]) {
  const itemsAdded = new Set<string>();
  const itemsRequired = new Set<string>();
  const itemsUsedForHiding = new Set<string>();

  // Collect all item references
  for (const node of Object.values(story)) {
    // Items added by nodes
    if (node.onArrive?.addItem) {
      itemsAdded.add(node.onArrive.addItem);
    }

    // Items required by choices
    if (node.choices) {
      for (const choice of node.choices) {
        if (choice.requires) {
          itemsRequired.add(choice.requires);
        }
        if (choice.hideIf) {
          itemsUsedForHiding.add(choice.hideIf);
        }
      }
    }
  }

  // Check for required items that are never added
  for (const requiredItem of itemsRequired) {
    if (!itemsAdded.has(requiredItem)) {
      warnings.push(
        `Item '${requiredItem}' is required by choices but never added to inventory`
      );
    }
  }

  // Check for hideIf items that are never added
  for (const hideIfItem of itemsUsedForHiding) {
    if (!itemsAdded.has(hideIfItem)) {
      warnings.push(
        `Item '${hideIfItem}' is used for hiding choices but never added to inventory`
      );
    }
  }

  // Check for items that are added but never used
  for (const addedItem of itemsAdded) {
    if (!itemsRequired.has(addedItem) && !itemsUsedForHiding.has(addedItem)) {
      warnings.push(
        `Item '${addedItem}' is added to inventory but never used in choices`
      );
    }
  }
}

/**
 * Get detailed story statistics
 * @param story - Validated story data
 * @returns Object with story statistics
 */
export function getStoryStatistics(story: StoryData) {
  const stats = {
    totalNodes: 0,
    endingNodes: 0,
    choiceNodes: 0,
    totalChoices: 0,
    uniqueItems: new Set<string>(),
    averageChoicesPerNode: 0,
    maxChoicesInNode: 0,
    nodesWithActions: 0,
    damageNodes: 0,
    healingNodes: 0,
  };

  for (const node of Object.values(story)) {
    stats.totalNodes++;

    if (node.isEnding) {
      stats.endingNodes++;
    }

    if (node.choices) {
      stats.choiceNodes++;
      stats.totalChoices += node.choices.length;
      stats.maxChoicesInNode = Math.max(
        stats.maxChoicesInNode,
        node.choices.length
      );

      // Collect items from choices
      for (const choice of node.choices) {
        if (choice.requires) stats.uniqueItems.add(choice.requires);
        if (choice.hideIf) stats.uniqueItems.add(choice.hideIf);
      }
    }

    if (node.onArrive) {
      stats.nodesWithActions++;
      if (node.onArrive.addItem) stats.uniqueItems.add(node.onArrive.addItem);
      if (node.onArrive.takeDamage) stats.damageNodes++;
      if (node.onArrive.heal) stats.healingNodes++;
    }
  }

  stats.averageChoicesPerNode =
    stats.choiceNodes > 0
      ? Math.round((stats.totalChoices / stats.choiceNodes) * 100) / 100
      : 0;

  return {
    ...stats,
    uniqueItems: Array.from(stats.uniqueItems),
  };
}

/**
 * Create a safe story loader function that handles errors gracefully
 * @param fallbackStory - Default story to use if loading fails
 * @returns Function that safely loads and validates story data
 */
export function createSafeStoryLoader(fallbackStory: StoryData) {
  return (jsonData: unknown): StoryData => {
    const result = parseStoryData(jsonData);

    if (result.success && result.data) {
      // Log warnings if any
      if (result.warnings.length > 0) {
        console.warn("Story validation warnings:", result.warnings);
      }
      return result.data;
    } else {
      // Log errors and use fallback
      console.error("Story validation failed:", result.errors);
      console.warn("Using fallback story data");
      return fallbackStory;
    }
  };
}

export default {
  parseStoryData,
  loadStoryFromJson,
  getStoryStatistics,
  createSafeStoryLoader,
  // Export schemas for external use
  schemas: {
    NodeActionSchema,
    ChoiceSchema,
    StoryNodeSchema,
    StoryDataSchema,
  },
};
