#!/usr/bin/env python3
"""
AI Server Watcher - Automatically restarts AI servers on change
Uses watchfiles for high-efficiency monitoring
"""

import multiprocessing
import os
import sys
from pathlib import Path

from watchfiles import run_process


def run_stockfish():
    print("🚀 Starting Stockfish Server...")
    os.system(f"{sys.executable} stockfish-server.py")


def run_shogi():
    print("🚀 Starting Shogi Server...")
    os.system(f"{sys.executable} shogi-server.py")


def run_go():
    print("🚀 Starting Go Server...")
    os.system(f"{sys.executable} go-server.py")


def start_watcher(target_func, target_file):
    print(f"👀 Watching {target_file} for changes...")
    run_process(target_file, target=target_func)


if __name__ == "__main__":
    # Change to backend directory
    os.chdir(Path(__file__).parent)

    processes = [
        multiprocessing.Process(
            target=start_watcher, args=(run_stockfish, "stockfish-server.py")
        ),
        multiprocessing.Process(
            target=start_watcher, args=(run_shogi, "shogi-server.py")
        ),
        multiprocessing.Process(target=start_watcher, args=(run_go, "go-server.py")),
    ]

    for p in processes:
        p.start()

    print("\n✅ AI Server Watchers Active")
    print("AI servers will now automatically restart on file changes.\n")

    try:
        for p in processes:
            p.join()
    except KeyboardInterrupt:
        print("\n👋 Stopping watchers...")
        for p in processes:
            p.terminate()
