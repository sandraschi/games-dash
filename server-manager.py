#!/usr/bin/env python3
"""
Server Manager - Remote restart functionality for game servers
Allows iPad users to restart crashed services remotely
"""

import asyncio
import json
import logging
import os
import signal
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, List

import psutil

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ServerManager:
    """Manages game server processes and allows remote restarts"""

    def __init__(self):
        self.servers = {
            'stockfish-server': {
                'command': ['python', 'stockfish-server.py'],
                'cwd': '.',
                'process': None,
                'port': 9543,
                'auto_restart': True
            },
            'shogi-server': {
                'command': ['python', 'shogi-server.py'],
                'cwd': '.',
                'process': None,
                'port': 9544,
                'auto_restart': True
            },
            'go-server': {
                'command': ['python', 'go-server.py'],
                'cwd': '.',
                'process': None,
                'port': 9545,
                'auto_restart': True
            },
            'chess-server': {
                'command': ['python', 'chess-server.py'],
                'cwd': '.',
                'process': None,
                'port': 5000,
                'auto_restart': True
            },
            'sound-service': {
                'command': ['python', 'sound-service.py'],
                'cwd': '.',
                'process': None,
                'port': 8080,
                'auto_restart': True
            },
            'main-web': {
                'command': ['python', '-m', 'http.server', '9876'],
                'cwd': '.',
                'process': None,
                'port': 9876,
                'auto_restart': True
            }
        }

        self.restart_history = []
        self.max_history = 50

    def find_process_by_port(self, port: int) -> psutil.Process:
        """Find process using a specific port"""
        for proc in psutil.process_iter(['pid', 'name', 'connections']):
            try:
                for conn in proc.connections():
                    if conn.laddr.port == port:
                        return proc
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return None

    def is_port_open(self, port: int) -> bool:
        """Check if a port is being used"""
        try:
            proc = self.find_process_by_port(port)
            return proc is not None
        except:
            return False

    async def start_server(self, server_name: str) -> Dict:
        """Start a specific server"""
        if server_name not in self.servers:
            return {
                'success': False,
                'message': f'Unknown server: {server_name}'
            }

        server_config = self.servers[server_name]

        try:
            # Check if already running
            if self.is_port_open(server_config['port']):
                return {
                    'success': False,
                    'message': f'Server {server_name} is already running on port {server_config["port"]}'
                }

            # Kill any existing process
            if server_config['process']:
                try:
                    server_config['process'].terminate()
                    await asyncio.sleep(1)
                    if not server_config['process'].poll():
                        server_config['process'].kill()
                except:
                    pass

            # Start new process
            logger.info(f"Starting server: {server_name}")
            process = await asyncio.create_subprocess_exec(
                *server_config['command'],
                cwd=server_config['cwd'],
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                preexec_fn=os.setsid if hasattr(os, 'setsid') else None
            )

            server_config['process'] = process

            # Wait a bit and check if it's still running
            await asyncio.sleep(2)

            if process.returncode is None:
                # Log successful start
                self.restart_history.append({
                    'server': server_name,
                    'action': 'start',
                    'timestamp': time.time(),
                    'success': True
                })

                if len(self.restart_history) > self.max_history:
                    self.restart_history = self.restart_history[-self.max_history:]

                return {
                    'success': True,
                    'message': f'Server {server_name} started successfully on port {server_config["port"]}'
                }
            else:
                return {
                    'success': False,
                    'message': f'Server {server_name} failed to start'
                }

        except Exception as e:
            logger.error(f"Error starting server {server_name}: {e}")
            return {
                'success': False,
                'message': f'Error starting server {server_name}: {str(e)}'
            }

    async def stop_server(self, server_name: str) -> Dict:
        """Stop a specific server"""
        if server_name not in self.servers:
            return {
                'success': False,
                'message': f'Unknown server: {server_name}'
            }

        server_config = self.servers[server_name]

        try:
            if server_config['process']:
                try:
                    server_config['process'].terminate()
                    await asyncio.sleep(2)
                    if not server_config['process'].poll():
                        server_config['process'].kill()
                except:
                    pass

                server_config['process'] = None

            # Also try to kill by port
            proc = self.find_process_by_port(server_config['port'])
            if proc:
                try:
                    proc.terminate()
                    await asyncio.sleep(1)
                    if proc.is_running():
                        proc.kill()
                except:
                    pass

            # Log successful stop
            self.restart_history.append({
                'server': server_name,
                'action': 'stop',
                'timestamp': time.time(),
                'success': True
            })

            return {
                'success': True,
                'message': f'Server {server_name} stopped successfully'
            }

        except Exception as e:
            logger.error(f"Error stopping server {server_name}: {e}")
            return {
                'success': False,
                'message': f'Error stopping server {server_name}: {str(e)}'
            }

    async def restart_server(self, server_name: str, reason: str = "Remote restart requested") -> Dict:
        """Restart a specific server"""
        logger.info(f"Remote restart requested for {server_name}: {reason}")

        # Stop first
        stop_result = await self.stop_server(server_name)
        if not stop_result['success']:
            logger.warning(f"Failed to stop {server_name} during restart: {stop_result['message']}")

        # Wait a moment
        await asyncio.sleep(1)

        # Start again
        start_result = await self.start_server(server_name)

        # Log the restart
        self.restart_history.append({
            'server': server_name,
            'action': 'restart',
            'timestamp': time.time(),
            'reason': reason,
            'success': start_result['success']
        })

        return start_result

    def get_server_status(self) -> Dict:
        """Get status of all servers"""
        status = {}

        for server_name, config in self.servers.items():
            is_running = False
            pid = None

            if config['process'] and config['process'].returncode is None:
                is_running = True
                pid = config['process'].pid
            elif self.is_port_open(config['port']):
                is_running = True
                proc = self.find_process_by_port(config['port'])
                pid = proc.pid if proc else None

            status[server_name] = {
                'running': is_running,
                'port': config['port'],
                'pid': pid,
                'auto_restart': config['auto_restart']
            }

        return status

    def get_restart_history(self, limit: int = 10) -> List:
        """Get recent restart history"""
        return self.restart_history[-limit:]

# Global server manager instance
server_manager = ServerManager()

# Web server routes for the sound service (which includes restart functionality)
# The restart endpoint is already in sound-service.py, but we can add server management here too

async def get_server_status(request):
    """Get status of all servers"""
    try:
        status = server_manager.get_server_status()
        return web.json_response({
            'status': 'success',
            'servers': status
        })
    except Exception as e:
        logger.error(f"Error getting server status: {e}")
        return web.json_response({
            'status': 'error',
            'message': str(e)
        }, status=500)

async def restart_game_server(request):
    """Restart a specific game server"""
    try:
        data = await request.json()
        server_name = data.get('server', '')
        reason = data.get('reason', 'API restart request')

        if not server_name:
            return web.json_response({
                'status': 'error',
                'message': 'Server name required'
            }, status=400)

        result = await server_manager.restart_server(server_name, reason)

        return web.json_response(result)

    except Exception as e:
        logger.error(f"Error restarting server: {e}")
        return web.json_response({
            'status': 'error',
            'message': str(e)
        }, status=500)

async def start_game_server(request):
    """Start a specific game server"""
    try:
        data = await request.json()
        server_name = data.get('server', '')

        if not server_name:
            return web.json_response({
                'status': 'error',
                'message': 'Server name required'
            }, status=400)

        result = await server_manager.start_server(server_name)

        return web.json_response(result)

    except Exception as e:
        logger.error(f"Error starting server: {e}")
        return web.json_response({
            'status': 'error',
            'message': str(e)
        }, status=500)

async def stop_game_server(request):
    """Stop a specific game server"""
    try:
        data = await request.json()
        server_name = data.get('server', '')

        if not server_name:
            return web.json_response({
                'status': 'error',
                'message': 'Server name required'
            }, status=400)

        result = await server_manager.stop_server(server_name)

        return web.json_response(result)

    except Exception as e:
        logger.error(f"Error stopping server: {e}")
        return web.json_response({
            'status': 'error',
            'message': str(e)
        }, status=500)

async def get_restart_history(request):
    """Get server restart history"""
    try:
        limit = int(request.query.get('limit', 10))
        history = server_manager.get_restart_history(limit)
        return web.json_response({
            'status': 'success',
            'history': history
        })
    except Exception as e:
        logger.error(f"Error getting restart history: {e}")
        return web.json_response({
            'status': 'error',
            'message': str(e)
        }, status=500)

# Export functions for use in sound-service.py
__all__ = [
    'server_manager',
    'get_server_status',
    'restart_game_server',
    'start_game_server',
    'stop_game_server',
    'get_restart_history'
]
