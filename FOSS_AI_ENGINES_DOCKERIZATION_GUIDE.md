# FOSS AI Engines & Dockerization Guide for Games Collection

## Overview

This document outlines a comprehensive plan to enhance the Games Collection with additional strong Free and Open Source Software (FOSS) AI engines, and provides a complete dockerization strategy for cross-platform deployment.

## Current Architecture

### Hybrid Windows + Docker Setup
```
Windows Host (Native Execution):
├── Stockfish.exe (Chess) - Port 9543
├── KataGo.exe (Go) - Port 9545
├── YaneuraOu.exe (Shogi) - Port 9544

Docker Container (Linux):
└── Web Server + Games UI - Port 80/443
```

**Benefits:** AI engines run natively for optimal performance
**Limitations:** Windows-only deployment, complex setup

## Dockerization Strategy

### Target Architecture
```
Docker Compose Stack (Cross-Platform):
├── games-web (Nginx + Python) - Port 80
├── stockfish-engine (Ubuntu + Stockfish) - Port 9543
├── katago-engine (Ubuntu + KataGo + OpenCL) - Port 9545
├── edax-engine (Ubuntu + Edax Reversi) - Port 9546 [NEW]
├── gnubg-engine (Ubuntu + GNU Backgammon) - Port 9547 [NEW]
└── quackle-engine (Ubuntu + Quackle Scrabble) - Port 9548 [NEW]
```

## AI Engines Analysis & Recommendations

### Chess Engines (Current: Stockfish)
**Stockfish 16** (~3500 ELO) is already included and is the strongest chess engine available.

**Alternative/Additional Options:**
- **Leela Chess Zero (LC0)**: Neural network based, different playing style
- **Komodo**: Commercial, but very strong
- **Houdini**: Commercial, excellent endgame play

### Go Engines (Current: KataGo)
**KataGo v1.15.3** is already included and is world-class.

**Alternative Options:**
- **Leela Zero**: Original AlphaGo-style implementation
- **ELF OpenGo**: Facebook's Go engine
- **PhoenixGo**: Tencent's implementation

### Shogi Engines (Current: YaneuraOu)
**YaneuraOu v9.10** is already included. Since you indicated disinterest in Shogi, this can remain Windows-only or be dropped.

### Additional FOSS AI Engines for Existing Games

#### 1. Othello/Reversi Engine: EDAX ⭐⭐⭐
**Strength:** Tournament champion level
**Platforms:** Linux, macOS, Windows
**License:** GPL-3.0
**URL:** https://github.com/abulmo/edax-reversi

**Why Add:**
- Games Collection already has Othello game
- EDAX is the strongest Othello engine available
- Perfect play up to ~20 ply depth
- Active development and maintenance

**Docker Implementation:**
```dockerfile
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y wget make gcc
WORKDIR /app
RUN wget https://github.com/abulmo/edax-reversi/archive/refs/tags/v4.6.tar.gz
RUN tar -xf v4.6.tar.gz && cd edax-reversi-4.6 && make
EXPOSE 9546
CMD ["./bin/lEdax", "-server", "9546"]
```

#### 2. Backgammon Engine: GNU Backgammon ⭐⭐⭐
**Strength:** World-class with neural network evaluation
**Platforms:** Linux, macOS, Windows
**License:** GPL-3.0
**URL:** https://www.gnu.org/software/gnubg/

**Why Add:**
- Games Collection already has Backgammon game
- Uses advanced neural network evaluation
- Includes extensive analysis tools
- Active FOSS project

**Docker Implementation:**
```dockerfile
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y gnubg python3-gi python3-gi-cairo
EXPOSE 9547
CMD ["gnubg", "--web-server", "9547"]
```

#### 3. Scrabble Engine: Quackle ⭐⭐⭐
**Strength:** Tournament-level Scrabble AI
**Platforms:** Linux, macOS, Windows
**License:** GPL-2.0
**URL:** https://github.com/quackle/quackle

**Why Add:**
- Games Collection has multiple word games
- Quackle is the strongest open source Scrabble engine
- Includes extensive word lists and analysis
- Used in competitive Scrabble tournaments

**Docker Implementation:**
```dockerfile
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y cmake build-essential qtbase5-dev
WORKDIR /app
RUN git clone https://github.com/quackle/quackle.git && cd quackle && mkdir build && cd build && cmake .. && make
EXPOSE 9548
CMD ["./quackle/quacker/bin/quacker", "--server", "9548"]
```

#### 4. Checkers Engine: Cake ⭐⭐
**Strength:** World champion level
**Platforms:** Linux, macOS, Windows
**License:** GPL-3.0
**URL:** https://github.com/abulmo/cake

**Why Add:**
- Games Collection already has Checkers game
- Cake is the strongest checkers engine available
- Supports multiple checkers variants
- Active development

#### 5. Poker AI Framework: OpenHoldem ⭐⭐
**Strength:** Comprehensive poker bot framework
**Platforms:** Windows (primarily)
**License:** GPL-3.0
**URL:** https://github.com/OpenHoldem

**Why Add:**
- Games Collection has Poker game
- Framework for implementing poker AIs
- Extensive documentation and community
- Educational value

## Bridge AI Reality Check

**Status:** Very limited FOSS options exist for Bridge AI.

**Commercial Engines:**
- **Bridge Baron** - Most popular commercial bridge AI
- **GIB (Bridge)** - Advanced bidding and play
- **Jack** - Another commercial option

**FOSS Limitations:**
- Bridge requires massive datasets for bidding systems
- Complex auction theory is hard to encode
- Most research remains academic/prototype level
- No tournament-ready FOSS implementations exist

**Recommendation:** Skip Bridge AI for now - focus on games where strong FOSS AIs exist.

## Docker Implementation Details

### Base Engine Container Pattern
```dockerfile
FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Download and build engine
WORKDIR /app
RUN wget [ENGINE_URL] && \
    tar -xf [ENGINE_FILE] && \
    cd [ENGINE_DIR] && \
    [BUILD_COMMANDS]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:[PORT]/health || exit 1

EXPOSE [PORT]
CMD ["[ENGINE_BINARY]", "[ENGINE_ARGS]"]
```

### Docker Compose Configuration
```yaml
version: '3.8'

services:
  games-web:
    build: .
    ports:
      - "80:80"
    depends_on:
      - stockfish-engine
      - katago-engine
      - edax-engine
      - gnubg-engine
      - quackle-engine
    networks:
      - games-network

  stockfish-engine:
    build: ./engines/stockfish
    ports:
      - "9543:9543"
    networks:
      - games-network

  katago-engine:
    build: ./engines/katago
    ports:
      - "9545:9545"
    networks:
      - games-network

  edax-engine:
    build: ./engines/edax
    ports:
      - "9546:9546"
    networks:
      - games-network

  gnubg-engine:
    build: ./engines/gnubg
    ports:
      - "9547:9547"
    networks:
      - games-network

  quackle-engine:
    build: ./engines/quackle
    ports:
      - "9548:9548"
    networks:
      - games-network

networks:
  games-network:
    driver: bridge
```

### Nginx Proxy Configuration
```nginx
# Engine routing
location /api/stockfish/ {
    proxy_pass http://stockfish-engine:9543/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

location /api/go/ {
    proxy_pass http://katago-engine:9545/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

location /api/othello/ {
    proxy_pass http://edax-engine:9546/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

location /api/backgammon/ {
    proxy_pass http://gnubg-engine:9547/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

location /api/scrabble/ {
    proxy_pass http://quackle-engine:9548/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Benefits of Dockerization

### 1. Cross-Platform Deployment
- **Linux/macOS/Windows** support out of the box
- **ARM64/x86_64** architecture compatibility
- **Cloud deployment** ready (AWS ECS, Google Cloud Run, etc.)

### 2. Simplified Deployment
- **Single command deployment**: `docker compose up -d`
- **Consistent environments** across development/production
- **Dependency isolation** prevents conflicts

### 3. Scalability & Performance
- **Horizontal scaling** of AI engines
- **Load balancing** across multiple engine instances
- **Resource isolation** per engine

### 4. Maintenance Benefits
- **Automated updates** via container registries
- **Rollback capability** with image versioning
- **Security updates** through base image updates

## Challenges & Solutions

### Challenge 1: GPU Acceleration
**Issue:** KataGo and other engines benefit from GPU acceleration
**Solution:** Use NVIDIA Docker runtime or OpenCL in containers

### Challenge 2: Engine Communication
**Issue:** Engines use different protocols (UCI, GTP, etc.)
**Solution:** Create protocol adapters in Python services

### Challenge 3: Container Size
**Issue:** Large container images with neural network models
**Solution:** Multi-stage builds and model downloading at runtime

### Challenge 4: Performance Optimization
**Issue:** Container overhead vs native performance
**Solution:** Use host networking mode and optimized base images

## Implementation Roadmap

### Phase 1: Core Engines (High Priority)
1. Stockfish containerization ✅
2. KataGo containerization ✅
3. Update nginx proxy configuration
4. Test end-to-end functionality

### Phase 2: Additional Engines (Medium Priority)
1. EDAX (Othello) implementation
2. GNU Backgammon implementation
3. Quackle (Scrabble) implementation
4. Update game UIs to use new engines

### Phase 3: Advanced Features (Future)
1. Engine load balancing
2. Tournament management
3. Engine performance monitoring
4. Cloud deployment configurations

## Engine Strength Comparison

| Game | Current Engine | Strength | New Engine Options | Potential Improvement |
|------|----------------|----------|-------------------|---------------------|
| Chess | Stockfish 16 | ~3500 ELO | Leela Chess Zero | Different playing styles |
| Go | KataGo 1.15.3 | Professional | Leela Zero, ELF | Alternative architectures |
| Othello | None | Basic AI | EDAX | World champion level |
| Backgammon | None | Basic AI | GNU Backgammon | Expert level analysis |
| Scrabble | None | Basic AI | Quackle | Tournament strength |
| Checkers | None | Basic AI | Cake | World champion level |

## Conclusion

This dockerization and engine expansion plan will transform the Games Collection into a comprehensive FOSS gaming platform with world-class AI opponents across multiple games. The containerized approach ensures cross-platform compatibility while maintaining high performance through optimized deployments.

**Priority Focus:** Chess and Go are already excellently covered. The biggest impact additions will be Othello (EDAX), Backgammon (GNU Backgammon), and Scrabble (Quackle) engines for games that already exist in the collection.