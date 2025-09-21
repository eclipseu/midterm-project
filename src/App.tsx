import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "./contexts/GameContext";
import GameLayout from "./components/layout/GameLayout";
import StartScreen from "./pages/StartScreen";
import GameScreen from "./pages/GameScreen";
import GameOverScreen from "./pages/GameOverScreen";
import VictoryScreen from "./pages/VictoryScreen";

function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <GameLayout>
          <Routes>
            <Route path="/" element={<StartScreen />} />
            <Route path="/game" element={<GameScreen />} />
            <Route path="/gameover" element={<GameOverScreen />} />
            <Route path="/victory" element={<VictoryScreen />} />
          </Routes>
        </GameLayout>
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
