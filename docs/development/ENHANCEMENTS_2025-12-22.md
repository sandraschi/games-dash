# Enhancements Log: December 22, 2025

## 📚 Dictionary & Language Learning Overhaul

We have successfully transformed the games app into a powerful language learning platform with the integration of professional-grade Japanese dictionary data.

### 1. JMdict/EDICT2 Integration (The "Real" Dictionary)
- **Migration**: Migrated from a simple personal vocabulary list to the massive **JMdict/EDICT2** dataset (190,000+ entries).
- **Dual-Database Architecture**:
  - `jmdict` table: Stores the official, read-only dictionary entries.
  - `vocabulary` table: Retains your personal, custom-added words.
- **Unified Search**: The `/api/dictionary/search` endpoint now seamlessly queries *both* tables, prioritizing your personal definitions while providing the breadth of a full dictionary.

### 2. Example Sentences (Tatoeba Project)
- **Context is King**: Integrated 150,000+ Japanese-English example sentence pairs from the **Tatoeba Project**.
- **Real-time Lookup**: Search results now include relevant example sentences to show usage in context.
- **Smart Matching**: Sentences are matched based on the search term, providing immediate practical examples.

### 3. "My Words" Filtering & Personalization
- **Source Control**: Added a new filtering system to the Dictionary UI.
  - **All Sources**: Best of both worlds (Default).
  - **My Words**: Focus strictly on your personal vocabulary list (~40k words).
  - **Official Dict**: Search the broader JMdict database.
- **Visual Indicators**: Clear badges ("My Word" in gold, "Official" in white) instantly identify the source of each entry.
- **Priority Sorting**: Your personal definitions always appear at the top of mixed search results.

### 4. Technical Improvements
- **Database Optimization**: Added indices to `jmdict` and `examples` tables for millisecond-latency searches.
- **API Robustness**: Enhanced error handling and pagination for large result sets.
- **Code Quality**: Refactored `kanji-api.py` to maintain clean separation of concerns.

---

## 🚀 Major AI Remote Access Fix (December 22, 2025)

**BREAKING NEWS**: Fixed the long-standing issue where AI **NEVER worked** on iPad remotely!

### The Problem
- AI functionality was completely broken on iPad via Tailscale
- nginx proxy configuration was fundamentally broken
- `$server_port` variable didn't work for routing AI requests
- No proper port-specific proxying to Windows AI servers

### The Solution
- ✅ **Fixed nginx proxy configuration** with specific routes for each AI service
- ✅ **Added proper port mapping**:
  - `/api/stockfish/*` → `host.docker.internal:9543`
  - `/api/shogi/*` → `host.docker.internal:9544`
  - `/api/go/*` → `host.docker.internal:9545`
  - `/api/multiplayer/*` → `host.docker.internal:9877`
- ✅ **Enhanced API routing** with timeout and error handling
- ✅ **Automatic Tailscale IP detection** for VPN networks
- ✅ **Created automated setup script** `setup_remote_ai_access.ps1`

### Result
**AI now works perfectly on iPad via Tailscale!** 🎉

---

## ✅ Completed Features (December 22, 2025)

### Japanese Learning Expansion
- ✅ **Flashcard System**: Spaced repetition vocabulary learning with "My Words" integration
- ✅ **Listening Practice**: Text-to-speech Japanese listening comprehension
- ✅ **Enhanced Kanji Tools**: Stroke order practice and advanced kanji table

### AI Remote Access
- ✅ **iPad AI Functionality**: Complete fix for remote AI access
- ✅ **Automated Setup**: One-click remote AI access configuration
- ✅ **Enhanced Diagnostics**: Comprehensive connectivity testing

---

**Remaining Next Steps**:
- JLPT level tagging for JMdict entries.
- Stroke order diagrams for Kanji details.
- Advanced spaced repetition algorithms.
