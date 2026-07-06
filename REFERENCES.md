# References & Further Reading

## OpenSpiel

OpenSpiel is Google DeepMind's framework for 119+ game environments with a shared API. It's used in reinforcement learning research and provides MCTS, minimax, and other AI algorithms out of the box.

- **Core paper:** Lanctot et al., "OpenSpiel: A Framework for Reinforcement Learning in Games" (2019). [arXiv:1908.09453](https://arxiv.org/abs/1908.09453)
- **Website:** [github.com/google-deepmind/open_spiel](https://github.com/google-deepmind/open_spiel)
- **MCTS:** Browne et al., "A Survey of Monte Carlo Tree Search Methods" (2012). [IEEE CIG](https://ieeexplore.ieee.org/document/6145622)

OpenSpiel includes implementations of: AlphaZero-style MCTS, tabular Q-learning, NFSP, Deep CFR, and more. The games range from perfect-information (chess, Go, tic-tac-toe) to imperfect-information (poker, bridge, liars dice) to cooperative (Hanabi).

## Game AI Engines

### Stockfish (Chess)
- The strongest open-source chess engine. Stockfish 16 is rated 3500+ Elo.
- **Website:** [stockfishchess.org](https://stockfishchess.org/)
- **Paper:** Romstad et al., "Stockfish: A Strong Open-Source Chess Engine" (various). [GitHub](https://github.com/official-stockfish/Stockfish)
- **NNUE evaluation:** Nasu, "Efficiently Updatable Neural Networks for Chess" (2020). [GitHub](https://github.com/nasu/nnue-pytorch)

### KataGo (Go)
- Strongest open-source Go AI, uses a neural network trained via self-play with auxiliary tasks.
- **Paper:** Wu, "KataGo: A Distributed Training Approach for Computer Go" (2020). [GitHub](https://github.com/lightvector/KataGo)
- **Blog:** "Accelerating Self-Play Learning in Go" (2020). [katagoblog](https://blog.katago.com/)

### Edax (Othello/Reversi)
- State-of-the-art Othello engine using alpha-beta search with large endgame tables.
- **Website:** [github.com/abulmo/edax-reversi](https://github.com/abulmo/edax-reversi)

### MoHex (Hex)
- Hex-playing AI using Monte Carlo tree search with connection-graph heuristics.
- **Paper:** Arneson et al., "MoHex: A New Generation of Hex AI" (2010). [AAAI](https://aaai.org/ocs/index.php/AAAI/AAAI10/paper/view/1802)

### GNU Backgammon
- Backgammon AI using neural network evaluation with rollout analysis.
- **Website:** [gnubg.org](https://gnubg.org/)
- **Paper:** Tesauro, "TD-Gammon: A Self-Teaching Backgammon Program" (1995). [Springer](https://link.springer.com/article/10.1007/BF00115327)

## Game Theory & Philosophy

- **Huizinga, *Homo Ludens*** (1938) — The foundational text on play as a cultural phenomenon. Argues that play is older than culture itself and underlies civilization.
- **Suits, *The Grasshopper: Games, Life and Utopia*** (1978) — A philosophical dialogue defining games as "the voluntary attempt to overcome unnecessary obstacles." Argues that the ideal life is one of playing games.
- **Caillois, *Man, Play and Games*** (1961) — Classifies games into four categories: *agon* (competition), *alea* (chance), *mimicry* (simulation), *ilinx* (vertigo).
- **von Neumann & Morgenstern, *Theory of Games and Economic Behavior*** (1944) — The founding text of game theory. Introduces the concept of mixed strategies and the minimax theorem.
- **Nash, "Equilibrium Points in N-Person Games"** (1950). [PNAS](https://www.pnas.org/doi/10.1073/pnas.36.1.48) — The Nash equilibrium.
- **Bostrom, *Superintelligence*** (2014) — Discusses AI game-playing as a milestone on the path to AGI, including the strategic implications of game-theoretic reasoning in AI.

## Neurobiology of Games & Decision-Making

- **Kahneman, *Thinking, Fast and Slow*** (2011) — Dual-process theory of cognition: System 1 (fast, intuitive) vs System 2 (slow, deliberate). Directly relevant to how humans (and AIs) make game-time decisions.
- **Damasio, *Descartes' Error*** (1994) — The somatic marker hypothesis: emotions are essential for rational decision-making. Relevant to why AI game agents that lack embodiment make fundamentally different decisions.
- **Camerer, *Behavioral Game Theory*** (2003) — Experimental evidence that human game play deviates systematically from classical game theory predictions.
- **Doya, "Modulators of Decision Making"** (2008). [Nature Neuroscience](https://doi.org/10.1038/nn2077) — Dopamine, serotonin, and norepinephrine in reward-based learning and game decisions.
- **Schultz, "Neuronal Reward and Decision Signals"** (2002). [Neuron](https://doi.org/10.1016/S0896-6273(02)00974-2) — How dopamine neurons encode reward prediction error during game-like tasks.
- **Lee et al., "The Neural Basis of Strategic Choice"** (2014). [Annual Review of Neuroscience](https://doi.org/10.1146/annurev-neuro-062012-170238) — How the brain implements game-theoretic reasoning.

## Technical Foundations

- **Three.js:** [threejs.org](https://threejs.org/) — 3D rendering library used for Mahjong, Pac-Man 3D, and the Jenga tower.
- **Cannon.js:** [schteppe.github.io/cannon.js](https://schteppe.github.io/cannon.js/) — Physics engine used for Jenga's tower simulation.
- **FastMCP:** [github.com/jlowin/fastmcp](https://github.com/jlowin/fastmcp) — Python MCP framework used to expose all games as agent-accessible tools.
- **Model Context Protocol:** [modelcontextprotocol.io](https://modelcontextprotocol.io/) — Open protocol for connecting AI agents to tools and data sources.
- **Lean 4 + Mathlib:** [lean-lang.org](https://lean-lang.org/) — Theorem prover used in the Theorem Prover game. Mathlib is the largest formalized mathematics library.
- **AlphaProof Nexus:** [arXiv:2605.22763](https://arxiv.org/abs/2605.22763) — DeepMind's formal proof system that inspired the Leanforge MCP architecture.

## Games as Cultural Artifacts

- **Murray, *Hamlet on the Holodeck*** (1997) — The nature of stories in digital spaces, including game narratives.
- **Juul, *Half-Real: Video Games Between Real Rules and Fictional Worlds*** (2005) — Argues that games occupy a dual ontological state: rules are real, the game world is fictional.
- **Bogost, *Persuasive Games*** (2007) — How games make arguments through their procedural rhetoric.
- **McGonigal, *Reality Is Broken*** (2011) — Why games make us better and how they can change the world.
