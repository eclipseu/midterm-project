import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import DialogueBox from "../components/game/DialogueBox";
import ChoiceList from "../components/game/ChoiceList";
import JumpscareScreen from "../components/game/JumpscareScreen";
import Inventory from "../components/game/Inventory";
import HeartBar from "../components/ui/HeartBar";
import type { Choice } from "../types/game.d";

export const GameScreen = () => {
  const navigate = useNavigate();
  const {
    gameState,
    dispatch,
    getCurrentNode,
    canSelectChoice,
    shouldHideChoice,
    saveGame,
  } = useGame();

  const currentNode = getCurrentNode();

  // Dialogue flow state
  const [showDialogue, setShowDialogue] = useState(true);
  const [showChoices, setShowChoices] = useState(false);
  const [showJumpscare, setShowJumpscare] = useState(false);
  const [jumpscareAsset, setJumpscareAsset] = useState<string | undefined>(
    undefined
  );
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [jumpscareCompleted, setJumpscareCompleted] = useState(false);

  // Auto-save when game state changes
  useEffect(() => {
    if (gameState.gameStarted) {
      saveGame();
    }
  }, [gameState, saveGame]);

  // Navigate to appropriate screen when game ends (after jumpscare completes for ending nodes)
  useEffect(() => {
    if (gameState.isGameOver && jumpscareCompleted) {
      const timer = setTimeout(() => {
        navigate("/gameover");
      }, 5000); // 5 second delay after jumpscare completes

      return () => clearTimeout(timer);
    } else if (gameState.isVictory && jumpscareCompleted) {
      const timer = setTimeout(() => {
        navigate("/victory");
      }, 5000); // 5 second delay after jumpscare completes

      return () => clearTimeout(timer);
    }
  }, [gameState.isGameOver, gameState.isVictory, jumpscareCompleted, navigate]);

  const handleChoiceSelect = (choice: Choice) => {
    if (!canSelectChoice(choice)) {
      return;
    }

    // Apply choice effects first
    if (choice.effects && choice.effects.length > 0) {
      dispatch({ type: "APPLY_CHOICE_EFFECTS", effects: choice.effects });
    }

    // Check if choice will reduce HP (trigger jumpscare)
    const willReduceHP = choice.effects?.some(
      (effect) => effect.type === "hp" && Number(effect.value) < 0
    );

    if (willReduceHP) {
      // Set jumpscare asset if available in choice
      setJumpscareAsset(choice.jumpscareAsset);
      setShowJumpscare(true);

      // Navigate after jumpscare completes
      setTimeout(() => {
        dispatch({ type: "NAVIGATE_TO_NODE", nodeId: choice.to });
        setShowDialogue(true);
        setShowChoices(false);
      }, 2500);
    } else {
      // Normal navigation
      dispatch({ type: "NAVIGATE_TO_NODE", nodeId: choice.to });
      setShowDialogue(true);
      setShowChoices(false);
    }
  };

  const handleDialogueComplete = () => {
    setShowDialogue(false);

    // Only show choices if this isn't an ending node
    if (!currentNode?.isEnding) {
      setShowChoices(true);
    }
  };

  const handleJumpscareComplete = () => {
    setShowJumpscare(false);
    setJumpscareCompleted(true);

    // After jumpscare completes, show dialogue
    setShowDialogue(true);
    setShowChoices(false);
  };

  // Reset dialogue flow when node changes
  useEffect(() => {
    if (currentNode) {
      setJumpscareCompleted(false);

      // Check if node has jumpscareImage - trigger jumpscare first
      if (currentNode.metadata?.jumpscareImage) {
        setJumpscareAsset(currentNode.metadata.jumpscareImage);
        setShowJumpscare(true);
        setShowDialogue(false); // Hide dialogue during jumpscare
        setShowChoices(false);
      } else {
        // No jumpscare, show dialogue normally
        setShowDialogue(true);
        setShowChoices(false);
        setShowJumpscare(false);
        setJumpscareCompleted(true); // Mark as completed for ending timer logic
      }
    }
  }, [gameState.currentNodeId]);

  if (!gameState.gameStarted) {
    // Redirect to start screen if game hasn't been started
    navigate("/");
    return null;
  }

  return (
    <div className="game-screen-container">
      {/* Dynamic Background Image - Behind everything */}
      {currentNode?.metadata?.backgroundImage && (
        <div
          className="scene-background"
          style={{
            backgroundImage: `url(${currentNode.metadata.backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            opacity: 0.6,
          }}
        />
      )}

      {/* Jumpscare Screen Overlay */}
      <JumpscareScreen
        isVisible={showJumpscare}
        onComplete={handleJumpscareComplete}
        jumpscareAsset={jumpscareAsset}
        intensity="high"
        duration={3000}
      />

      {/* HP Hearts - Top Left */}
      <div className="hp-container">
        <HeartBar current={gameState.player.hp} max={gameState.player.maxHp} />
        <div className="hp-text">
          {gameState.player.hp}/{gameState.player.maxHp} HP
        </div>
      </div>

      {/* Inventory Icon - Top Right */}
      <div
        className="inventory-icon"
        onClick={() => setShowInventoryModal(true)}
      >
        <div className="cursed-chest">
          <span className="chest-glow">📦</span>
          {gameState.player.inventory.length > 0 && (
            <div className="item-count">
              {gameState.player.inventory.length}
            </div>
          )}
        </div>
      </div>

      {/* Character Art - Center */}
      <div className="character-container">
        <img
          src={(() => {
            // Use character image from current node metadata if available
            if (currentNode?.metadata?.characterImage) {
              return currentNode.metadata.characterImage;
            }

            // Fallback to HP-based character images
            const hpPercentage =
              (gameState.player.hp / gameState.player.maxHp) * 100;
            if (hpPercentage <= 25) {
              return "/assets/character-injured.png";
            } else if (hpPercentage <= 50) {
              return "/assets/character-tired.png";
            } else {
              return "/assets/character.png";
            }
          })()}
          alt="Character Portrait"
          className="character-image"
        />
      </div>

      {/* Dialogue Box - Bottom */}
      {showDialogue && currentNode && (
        <div className="dialogue-container">
          <DialogueBox
            node={currentNode}
            onDialogueComplete={handleDialogueComplete}
            className="horror-dialogue-box"
          />
        </div>
      )}

      {/* Choice List - Above Dialogue */}
      {showChoices && currentNode?.choices && (
        <div className="choices-container">
          <ChoiceList
            choices={currentNode.choices}
            onChoiceSelect={handleChoiceSelect}
            canSelectChoice={canSelectChoice}
            shouldHideChoice={shouldHideChoice}
            className="horror-choices"
          />
        </div>
      )}

      {/* Progress Info - Footer */}
      <div className="progress-footer">
        <div className="location-icons">
          {Array.from(gameState.visitedNodes)
            .slice(0, 6)
            .map((nodeId, index) => (
              <div key={nodeId} className="location-icon">
                {index % 3 === 0 ? "🕯️" : index % 3 === 1 ? "💀" : "🔮"}
              </div>
            ))}
        </div>
        <div className="current-location">
          Current: {gameState.currentNodeId}
        </div>
      </div>

      {/* Inventory Modal */}
      {showInventoryModal && (
        <div
          className="inventory-modal-overlay"
          onClick={() => setShowInventoryModal(false)}
        >
          <div
            className="inventory-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Cursed Inventory</h3>
              <button
                className="close-button"
                onClick={() => setShowInventoryModal(false)}
              >
                ✕
              </button>
            </div>
            <Inventory
              items={gameState.player.inventory}
              playerName={gameState.player.name}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GameScreen;
