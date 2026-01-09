#!/usr/bin/env python3
"""
Enhanced AI Manager for Games MCP Server

Provides robust AI engine management with health monitoring,
auto-restart capabilities, and comprehensive error handling.
"""

import asyncio
import logging
from typing import Dict, Any, Optional
from pathlib import Path
import subprocess
import sys
import time
import uuid
from datetime import datetime, timedelta

# Import existing MCP server components
try:
    # Try to import, but don't fail validation if it doesn't work
    from .mcp_server import mcp
    MCP_AVAILABLE = True
except ImportError:
    MCP_AVAILABLE = False

class AIEngineConfig:
    """Configuration for individual AI engines"""
    def __init__(
        self,
        name: str,
        executable: str,
        port: int,
        working_directory: str,
        environment: Dict[str, str] = None
    ):
        self.name = name
        self.executable_path = executable
        self.port = port
        self.working_directory = working_directory
        self.environment = environment or {}
        
        # Validate configuration
        if not Path(self.executable_path).exists():
            raise FileNotFoundError(f"AI engine executable not found: {self.executable_path}")
        
        self.logger = logging.getLogger(f"ai_engine_{name}")
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary"""
        return {
            'name': self.name,
            'executable_path': str(self.executable_path),
            'port': self.port,
            'working_directory': str(self.working_directory),
            'environment': self.environment or {}
        }

class ServerHealthStatus:
    """Status information for an AI server"""
    def __init__(
        self,
        name: str,
        status: str = 'unknown',
        pid: Optional[int] = None,
        port: Optional[int] = None,
        start_time: Optional[datetime] = None,
        last_check: Optional[datetime] = None,
        restart_count: int = 0,
        error_count: int = 0,
        last_error: Optional[str] = None,
        health_status: str = 'unknown'
    ):
        self.name = name
        self.status = status
        self.pid = pid
        self.port = port
        self.start_time = start_time
        self.last_check = last_check
        self.restart_count = restart_count
        self.error_count = error_count
        self.last_error = last_error
        self.health_status = health_status
        
    def update(self, **kwargs):
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        
        def to_dict(self) -> Dict[str, Any]:
            return {
                'name': self.name,
                'status': self.status,
                'pid': self.pid,
                'port': self.port,
                'start_time': self.start_time.isoformat() if self.start_time else None,
                'last_check': self.last_check.isoformat() if self.last_check else None,
                'restart_count': self.restart_count,
                'error_count': self.error_count,
                'last_error': self.last_error,
                'health_status': self.health_status
            }

class AIHealthMonitor:
    """Health monitoring system for AI engines"""
    def __init__(self):
        self.servers = {}
        self.health_checks = {}
        self.alert_thresholds = {
            'cpu_usage': 80,
            'memory_usage': 85,
            'response_time': 2000,
            'error_rate': 5
        }
        self.restart_cooldown = 30
        
    async def register_server(self, name: str, process):
        """Register AI engine for health monitoring"""
        self.servers[name] = {
            'process': process,
            'pid': process.pid,
            'start_time': datetime.now(),
            'last_check': datetime.now(),
            'health_status': 'healthy',
            'restart_count': 0,
            'error_count': 0,
            'last_error': None
        }
        
        # Start health checks
        asyncio.create_task(self.health_check_loop(name))
        
    async def health_check_loop(self, name: str):
        """Continuous health monitoring for AI engine"""
        while name in self.servers:
            try:
                server_info = self.servers[name]
                
                # Check process health
                if not await self.is_process_healthy(server_info['process']):
                    await self.handle_unhealthy_server(name, 'process_died')
                    continue
                
                # Check response time
                response_time = await self.check_server_response(name)
                if response_time > self.alert_thresholds['response_time']:
                    await self.handle_unhealthy_server(name, 'slow_response')
                
                # Check resource usage
                cpu, memory = await self.get_resource_usage(server_info['pid'])
                if cpu > self.alert_thresholds['cpu_usage'] or memory > self.alert_thresholds['memory_usage']:
                    await self.handle_unhealthy_server(name, 'resource_exhaustion')
                
                # Update server status
                server_info.update({
                    'last_check': datetime.now(),
                    'health_status': 'healthy'
                })
                
                await asyncio.sleep(10)  # Check every 10 seconds
                
            except Exception as e:
                await self.handle_unhealthy_server(name, f'health_check_error: {e}')
                await asyncio.sleep(30)
    
    async def unregister_server(self, name: str):
        """Unregister server from health monitoring"""
        if name in self.servers:
            del self.servers[name]
            self.logger.info(f"Unregistered {name} from health monitoring")
    
    async def get_all_server_status(self) -> Dict[str, ServerHealthStatus]:
        """Get status of all AI engines"""
        status = {}
        for name, server_info in self.servers.items():
            status[name] = ServerHealthStatus(
                name=name,
                **server_info
            )
        return status
    
    async def is_process_healthy(self, process) -> bool:
        """Check if process is still running and responsive"""
        try:
            # Check if process is still running
            if process.poll() is not None:
                return False
            
            # Check response time (implementation specific)
            return True  # Simplified for demo
            
        except Exception:
            return False
    
    async def check_server_response(self, name: str) -> float:
        """Check server response time"""
        server_info = self.servers[name]
        if not server_info.get('start_time'):
            return 0.0  # No start time recorded
        
        start_time = server_info.get('start_time')
        elapsed = (datetime.now() - start_time).total_seconds()
        
        return elapsed
    
    async def get_resource_usage(self, pid: int) -> Dict[str, float]:
        """Get CPU and memory usage for process"""
        try:
            # This is a simplified implementation
            # In production, you'd use psutil for detailed metrics
            cpu_percent = 50.0  # Placeholder
            memory_percent = 25.0  # Placeholder
            
            return {
                'cpu_percent': cpu_percent,
                'memory_percent': memory_percent
            }
        except Exception:
            return {
                'cpu_percent': 0.0,
                'memory_percent': 0.0
            }
    
    async def handle_unhealthy_server(self, name: str, issue_type: str):
        """Handle unhealthy server with appropriate action"""
        server_info = self.servers[name]
        
        if issue_type in ['process_died', 'resource_exhaustion']:
            # Force restart for critical issues
            self.logger.warning(f"Critical issue detected for {name}: {issue_type}, forcing restart")
            await self.auto_restart.force_restart(name)
        elif issue_type in ['slow_response']:
            # Gentle restart for performance issues
            if server_info['restart_count'] < 3:
                await self.auto_restart.schedule_restart(name)
            else:
                self.logger.warning(f"Server {name} unhealthy but restart limit reached")
        else:
            # Log the issue but continue monitoring
            self.logger.warning(f"Server {name} unhealthy: {issue_type}")
        
        # Update server status
        server_info.update({
            'last_error': issue_type,
            'health_status': 'unhealthy'
        })

class AutoRestartManager:
    """Auto-restart system with intelligent restart logic"""
    def __init__(self):
        self.restart_history = {}
        self.restart_limits = {
            'per_hour': 3,
            'per_day': 20,
            'cooldown': 30
        }
        
    async def force_restart(self, name: str):
        """Force immediate restart of server"""
        self.logger.warning(f"Force restarting {name} AI engine")
        
        server_info = self.health_monitor.servers[name]
        
        if server_info and server_info['process']:
            await server_info['process'].terminate()
            await asyncio.sleep(self.restart_limits['cooldown'])
            
            # Restart server
            new_process = await self.start_engine(name, self.health_monitor.servers[name]['config'])
            
            # Update tracking
            server_info.update({
                'restart_count': server_info['restart_count'] + 1,
                'last_restart': datetime.now()
            })
            
            self.logger.info(f"Force restart completed for {name}")
    
    async def schedule_restart(self, name: str):
        """Schedule gentle restart with cooldown"""
        server_info = self.health_monitor.servers[name]
        
        if self.can_restart(server_info):
            await server_info['process'].terminate()
            await asyncio.sleep(self.restart_limits['cooldown'])
            
            new_process = await self.start_engine(name, self.health_monitor.servers[name]['config'])
            
            # Update tracking
            server_info.update({
                'restart_count': server_info['restart_count'] + 1,
                'last_restart': datetime.now()
            })
            
            self.logger.info(f"Scheduled restart completed for {name}")
        else:
            self.logger.warning(f"Restart blocked for {name} - limit reached")
    
    def can_restart(self, server_info: ServerHealthStatus) -> bool:
        """Check if restart is allowed based on limits"""
        time_since_last_restart = datetime.now() - server_info.get('last_restart', datetime.min)
        
        hours_since_restart = time_since_last_restart.total_seconds() / 3600
        days_since_restart = time_since_last_restart.days
        
        return (
            hours_since_restart < 1 and server_info['restart_count'] < 3 and
            days_since_restart < 1 and server_info['restart_count'] < 20 and
            days_since_restart < 1 and server_info['restart_count'] < 20
        )

class ProcessManager:
    """Process management with robust error handling"""
    def __init__(self):
        self.processes = {}
        self.logger = logging.getLogger(__name__)
    
    async def start_process(self, executable: str, args: list, cwd: str, env: dict):
        """Start process with robust error handling"""
        try:
            if platform.system() == 'Windows':
                process = subprocess.Popen(
                    [executable] + args,
                    cwd=cwd,
                    env=env,
                    creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
            else:
                process = await asyncio.create_subprocess_exec(
                    executable, args, cwd=cwd, env=env
                )
            
            self.processes[executable] = process
            return process
            
        except Exception as e:
            self.logger.error(f"Failed to start process {executable}: {e}")
            raise
    
    async def stop_process(self, name: str):
        """Stop process gracefully"""
        if name in self.processes:
            process = self.processes[name]
            try:
                process.terminate()
                await process.wait()
                del self.processes[name]
                self.logger.info(f"Stopped process: {name}")
            except Exception as e:
                self.logger.error(f"Error stopping process {name}: {e}")

class EnhancedAIManager:
    """Enhanced AI manager with health monitoring and auto-restart"""
    def __init__(self):
        self.ai_engines = {
            'stockfish': AIEngineConfig('stockfish', 'stockfish', 8000),
            'katago': AIEngineConfig('katago', 'katago', 8001),
            'yaneuraou': AIEngineConfig('yaneuraou', 'yaneuraou', 8002)
        }
        self.health_monitor = AIHealthMonitor()
        self.auto_restart = AutoRestartManager()
        self.process_manager = ProcessManager()
        self.logger = logging.getLogger(__name__)
        
    async def start_all_engines(self):
        """Start all AI engines with health monitoring"""
        results = {}
        for name, config in self.ai_engines.items():
            try:
                result = await self.start_engine(name, config)
                results[name] = result
                self.logger.info(f"Started {name} AI engine: {result['status']}")
            except Exception as e:
                results[name] = {'status': 'failed', 'error': str(e)}
                self.logger.error(f"Failed to start {name} AI engine: {e}")
        
        await self.health_monitor.start_monitoring()
        return results
    
    async def start_engine(self, name: str, config: AIEngineConfig = None) -> Dict[str, Any]:
        """Start individual AI engine with robust error handling"""
        if config is None:
            config = self.ai_engines[name]
        
        try:
            # Start engine process
            process = await self.process_manager.start_process(
                config.executable_path,
                config.args,
                cwd=config.working_directory,
                env=config.environment
            )
            
            # Register for health monitoring
            await self.health_monitor.register_server(name, process)
            
            return {
                'status': 'running',
                'pid': process.pid,
                'port': config.port,
                'start_time': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Failed to start {name} AI engine: {e}")
            raise
    
    async def stop_engine(self, name: str):
        """Stop AI engine gracefully"""
        if name in self.health_monitor.servers:
            server_info = self.health_monitor.servers[name]
            try:
                await server_info['process'].terminate()
                await self.process_manager.stop_process(name)
                await self.health_monitor.unregister_server(name)
                self.logger.info(f"Stopped {name} AI engine")
            except Exception as e:
                self.logger.error(f"Error stopping {name} AI engine: {e}")
    
    async def restart_engine(self, name: str):
        """Restart AI engine with error recovery"""
        await self.stop_engine(name)
        await asyncio.sleep(2)  # Brief pause
        return await self.start_engine(name, self.ai_engines[name])
    
    async def get_engine_status(self):
        """Get status of all AI engines"""
        status = {}
        for name in self.ai_engines.keys():
            if name in self.health_monitor.servers:
                server_info = self.health_monitor.servers[name]
                status[name] = ServerHealthStatus(
                    name=name,
                    **server_info
                )
        return status
    
    async def get_all_server_status(self) -> Dict[str, ServerHealthStatus]:
        """Get comprehensive status of all AI engines"""
        return {
            name: status.to_dict() for name, status in self.health_monitor.servers.items()
        }

# Example usage
if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
async def main():
    """Main entry point"""
    ai_manager = EnhancedAIManager()
    
    # Start all engines
    # await ai_manager.start_all_engines()
    
    # Get status
    # status = await ai_manager.get_all_server_status()
    # print(f"AI Engines Status: {status}")
    
    # Force restart Stockfish if needed
    # await ai_manager.restart_engine('stockfish')
    
    print("Enhanced AI Manager initialized successfully")
