import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import { useAudio } from "../contexts/AudioContext";
import DialogueBox from "../components/game/DialogueBox";
import ChoiceList from "../components/game/ChoiceList";
import JumpscareScreen from "../components/game/JumpscareScreen";
import Inventory from "../components/game/Inventory";
import HeartBar from "../components/ui/HeartBar";
import { AudioControls } from "../components/ui/AudioControls";
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
  const { playBackground } = useAudio();

  const currentNode = getCurrentNode();

  // Jumpscare cooldown helper function
  const isJumpscareInCooldown = () => {
    if (jumpscareLastTriggered === null) return false;
    const now = Date.now();
    const cooldownPeriod = 3000; // 3 seconds
    return now - jumpscareLastTriggered < cooldownPeriod;
  };

  // Dialogue flow state
  const [showDialogue, setShowDialogue] = useState(true);
  const [showChoices, setShowChoices] = useState(false);
  const [showJumpscare, setShowJumpscare] = useState(false);
  const [jumpscareAsset, setJumpscareAsset] = useState<string | undefined>(
    undefined
  );
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [jumpscareCompleted, setJumpscareCompleted] = useState(false);
  const [jumpscareTriggeredByChoice, setJumpscareTriggeredByChoice] =
    useState(false); // Track jumpscare source
  const [jumpscareLastTriggered, setJumpscareLastTriggered] = useState<
    number | null
  >(null); // Cooldown tracking
  const [cooldownMessage, setCooldownMessage] = useState<string | null>(null); // Cooldown message display
  const [dialogueVisible, setDialogueVisible] = useState(false);
  const [choicesVisible, setChoicesVisible] = useState(false);
  const [currentBackground, setCurrentBackground] = useState<
    string | undefined
  >(undefined);
  const [nextBackground, setNextBackground] = useState<string | undefined>(
    undefined
  );
  const [backgroundTransitioning, setBackgroundTransitioning] = useState(false);

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

  // Play game background music when component mounts
  useEffect(() => {
    playBackground("background");
  }, [playBackground]);

  const handleChoiceSelect = (choice: Choice) => {
    if (!canSelectChoice(choice)) {
      return;
    }

    // Start transition - fade out choices
    setChoicesVisible(false);

    // Apply choice effects first
    if (choice.effects && choice.effects.length > 0) {
      dispatch({ type: "APPLY_CHOICE_EFFECTS", effects: choice.effects });
    }

    // Check if choice will reduce HP (trigger jumpscare)
    const willReduceHP = choice.effects?.some(
      (effect) => effect.type === "hp" && Number(effect.value) < 0
    );

    if (willReduceHP) {
      // Check if jumpscare is in cooldown
      if (isJumpscareInCooldown()) {
        const timeRemaining = Math.ceil(
          (3000 - (Date.now() - jumpscareLastTriggered!)) / 1000
        );
        console.log("🎃 GameScreen: Jumpscare blocked by cooldown", {
          timeRemaining: timeRemaining * 1000,
        });

        // Show cooldown message
        setCooldownMessage(
          `Jumpscare on cooldown (${timeRemaining}s remaining)`
        );
        setTimeout(() => setCooldownMessage(null), 2000);

        // Skip jumpscare but still apply effects and navigate
        setTimeout(() => {
          dispatch({ type: "NAVIGATE_TO_NODE", nodeId: choice.to });
        }, 400);
        return;
      }
      console.log("🎃 GameScreen: Choice triggers jumpscare", {
        choice: choice.text,
        jumpscareAsset: choice.jumpscareAsset,
      });

      // Set jumpscare timing
      setJumpscareLastTriggered(Date.now());

      // Set jumpscare asset if available in choice
      setJumpscareAsset(choice.jumpscareAsset);
      setJumpscareTriggeredByChoice(true); // Mark that this jumpscare came from choice

      // Smooth transition to jumpscare
      setTimeout(() => {
        setShowJumpscare(true);
      }, 400); // Wait for choices to fade out completely

      // Navigate after jumpscare fully completes (increased time)
      setTimeout(() => {
        dispatch({ type: "NAVIGATE_TO_NODE", nodeId: choice.to });
      }, 5800); // Wait for full jumpscare duration + exit animation
    } else {
      // Normal navigation with smooth transition
      setTimeout(() => {
        dispatch({ type: "NAVIGATE_TO_NODE", nodeId: choice.to });
      }, 400); // Smooth transition delay
    }
  };

  const handleDialogueComplete = () => {
    // Smooth transition from dialogue to choices
    setDialogueVisible(false);

    setTimeout(() => {
      setShowDialogue(false);

      // Only show choices if this isn't an ending node
      if (!currentNode?.isEnding) {
        setShowChoices(true);
        setTimeout(() => {
          setChoicesVisible(true);
        }, 150); // Brief delay for smoother appearance
      }
    }, 400); // Wait for dialogue fade out completely
  };

  const handleJumpscareComplete = useCallback(() => {
    setShowJumpscare(false);
    setJumpscareCompleted(true);
    setJumpscareTriggeredByChoice(false); // Reset the flag

    // Ensure jumpscare is fully hidden before showing dialogue
    setTimeout(() => {
      setShowDialogue(true);
      // Add additional delay to ensure smooth appearance
      setTimeout(() => {
        setDialogueVisible(true);
      }, 200); // Stagger the dialogue appearance
      setShowChoices(false);
      setChoicesVisible(false);
    }, 400); // Longer delay for smoother transition
  }, []);

  // Handle smooth background transitions
  useEffect(() => {
    const newBackground = currentNode?.metadata?.backgroundImage;

    if (newBackground && newBackground !== currentBackground) {
      setBackgroundTransitioning(true);
      setNextBackground(newBackground);

      // Cross-fade transition
      setTimeout(() => {
        setCurrentBackground(newBackground);
        setNextBackground(undefined);
        setBackgroundTransitioning(false);
      }, 600); // 600ms cross-fade
    } else if (!newBackground && currentBackground) {
      // Fade out background
      setBackgroundTransitioning(true);
      setTimeout(() => {
        setCurrentBackground(undefined);
        setBackgroundTransitioning(false);
      }, 400);
    } else if (newBackground && !currentBackground) {
      // Fade in first background
      setCurrentBackground(newBackground);
    }
  }, [currentNode?.metadata?.backgroundImage, currentBackground]);

  // Reset dialogue flow when node changes
  useEffect(() => {
    if (currentNode) {
      setJumpscareCompleted(false);

      // Check if node has jumpscareImage - trigger jumpscare first
      // BUT only if jumpscare wasn't already triggered by choice selection AND not in cooldown
      if (
        currentNode.metadata?.jumpscareImage &&
        !jumpscareTriggeredByChoice &&
        !isJumpscareInCooldown()
      ) {
        console.log("🎃 GameScreen: Node triggers jumpscare", {
          nodeId: gameState.currentNodeId,
          jumpscareImage: currentNode.metadata.jumpscareImage,
        });

        // Set jumpscare timing
        setJumpscareLastTriggered(Date.now());

        setJumpscareAsset(currentNode.metadata.jumpscareImage);

        // Immediately hide all UI elements
        setShowDialogue(false);
        setDialogueVisible(false);
        setShowChoices(false);
        setChoicesVisible(false);

        // Show jumpscare with a brief delay to ensure UI is hidden
        setTimeout(() => {
          setShowJumpscare(true);
        }, 100);
      } else {
        console.log(
          "🎃 GameScreen: No jumpscare or already triggered by choice or in cooldown",
          {
            hasJumpscareImage: !!currentNode.metadata?.jumpscareImage,
            jumpscareTriggeredByChoice,
            isInCooldown: isJumpscareInCooldown(),
            cooldownRemaining: jumpscareLastTriggered
              ? Math.max(0, 3000 - (Date.now() - jumpscareLastTriggered))
              : 0,
          }
        );

        // No jumpscare, show dialogue normally with smooth transition
        // OR jumpscare was already triggered by choice, so just show dialogue
        setShowJumpscare(false);
        setShowChoices(false);
        setChoicesVisible(false);
        setJumpscareCompleted(true); // Mark as completed for ending timer logic

        // Reset the choice jumpscare flag for next time
        setJumpscareTriggeredByChoice(false);

        // Show dialogue with smooth entrance
        setShowDialogue(true);
        setTimeout(() => {
          setDialogueVisible(true);
        }, 200); // Delay for smooth entrance
      }
    }
  }, [gameState.currentNodeId, jumpscareTriggeredByChoice]);

  if (!gameState.gameStarted) {
    // Redirect to start screen if game hasn't been started
    navigate("/");
    return null;
  }

  return (
    <div className="game-screen-container">
      {/* Audio Controls */}
      <div className="absolute top-4 right-4 z-50">
        <AudioControls />
      </div>

      {/* Dynamic Background Images with Smooth Transitions */}
      {currentBackground && (
        <div
          className={`scene-background current-bg ${
            backgroundTransitioning ? "fade-out" : "fade-in"
          }`}
          style={{
            backgroundImage: `url(${currentBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            opacity: backgroundTransitioning ? 0.3 : 0.6,
            transition: "opacity 0.6s ease-in-out",
          }}
        />
      )}

      {/* Next Background for Cross-fade */}
      {nextBackground && (
        <div
          className="scene-background next-bg fade-in"
          style={{
            backgroundImage: `url(${nextBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 2,
            opacity: 0.6,
            transition: "opacity 0.6s ease-in-out",
          }}
        />
      )}

      {/* Jumpscare Screen Overlay */}
      <JumpscareScreen
        isVisible={showJumpscare}
        onComplete={handleJumpscareComplete}
        jumpscareAsset={jumpscareAsset}
        intensity="high"
        duration={5000}
      />

      {/* HP Hearts - Top Left */}
      <div className="hp-container">
        <HeartBar current={gameState.player.hp} max={gameState.player.maxHp} />
        <div className="hp-text">
          {gameState.player.hp}/{gameState.player.maxHp} HP
        </div>
        {/* Cooldown Message */}
        {cooldownMessage && (
          <div
            className="cooldown-message"
            style={{
              position: "absolute",
              top: "60px",
              left: "0",
              background: "rgba(0, 0, 0, 0.8)",
              color: "#ff6b6b",
              padding: "8px 12px",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "bold",
              zIndex: 1000,
              animation: "fadeIn 0.3s ease-in-out",
            }}
          >
            ⏱️ {cooldownMessage}
          </div>
        )}
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
        <div
          className={`dialogue-container ${
            dialogueVisible ? "fade-in" : "fade-out"
          }`}
        >
          <DialogueBox
            node={currentNode}
            onDialogueComplete={handleDialogueComplete}
            className="horror-dialogue-box"
          />
        </div>
      )}

      {/* Choice List - Above Dialogue */}
      {showChoices && currentNode?.choices && (
        <div
          className={`choices-container ${
            choicesVisible ? "fade-in" : "fade-out"
          }`}
        >
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
