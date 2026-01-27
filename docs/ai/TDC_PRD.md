# PRD: Tri-Dimensional Chess (Star Trek Style)

**Status**: [RELEASED] - January 26, 2026
**Version**: 1.0.0

## 1. Vision
To provide a high-fidelity, playable implementation of the iconic 23rd-century chess variant within the Games Collection "Zoo". This addition enhances the collection's prestige and serves as a technical showcase for 3D logic and rendering.

## 2. Product Scope
- **Standard Ruleset**: Implementation of the Bartmess/Roth ruleset, the most widely accepted formalization of the game seen in Star Trek.
- **Multi-Level Board**: 3 Neutral Boards ($4 \times 4$) and 4 Attack Boards ($2 \times 2$).
- **3D Interaction**: Full camera control (Orbit/Pan/Zoom) to visualize the vertical state-space.
- **Lore Integration**: Contextual help panels linking the game to Starfleet culture and notable matches (e.g., Kirk vs. Spock).

## 3. Technical Architecture
- **Rendering Stack**: Three.js + OrbitControls.
- **Logic Engine**: Custom `TDChessLogic` class using a unified (x, y, z) global coordinate mapping.
- **Piece Set**: Low-poly procedural geometry to maintain a futuristic, streamlined aesthetic.
- **Attack Board Implementation**: Dynamic pin-switching logic allowing $2 \times 2$ boards to move to any of the 4 corner pins on the Neutral Boards if they contain $\le 1$ piece.

## 4. Lore & History
The game primarily references **"The Tholian Web"** (Star Trek TOS), where the game serves as a vessel for dialogue concerning logic vs. intuition.

## 5. Roadmap (Future Versions)
- [ ] Battle Animations: 3D pieces animating captures.
- [ ] Network Multiplayer: Syncing 3D board states across WebRTC.
- [ ] AI Integration: Extending Stockfish or a custom NN to handle 3D coordinate spaces.
