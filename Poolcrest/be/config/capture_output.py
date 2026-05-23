"""
Enhanced logging utilities for capturing ALL output.
This module ensures that everything printed to console also goes to log files.
"""

import sys
import logging
from pathlib import Path


class TeeOutput:
    """
    A class that duplicates output to both console and log file.
    Everything written to this object goes to both destinations.
    """
    
    def __init__(self, stream, log_file_path):
        self.terminal = stream
        self.log_file_path = Path(log_file_path)
        self.log_file_path.parent.mkdir(exist_ok=True, parents=True)
        
    def write(self, message):
        # Write to terminal
        self.terminal.write(message)
        self.terminal.flush()
        
        # Write to log file
        try:
            with open(self.log_file_path, 'a', encoding='utf-8') as f:
                f.write(message)
                f.flush()
        except Exception:
            pass  # Silently fail if can't write to log
    
    def flush(self):
        self.terminal.flush()
    
    def __getattr__(self, attr):
        return getattr(self.terminal, attr)


def setup_tee_output():
    """
    Set up output capturing to ensure ALL console output goes to log files.
    This captures stdout, stderr, and all print statements.
    """
    log_dir = Path(__file__).parent.parent / 'logs'
    log_dir.mkdir(exist_ok=True)
    
    # Create tee outputs for stdout and stderr
    sys.stdout = TeeOutput(sys.stdout, log_dir / 'stdout.log')
    sys.stderr = TeeOutput(sys.stderr, log_dir / 'stderr.log')
    
    # Also create a combined output log
    class CombinedTeeOutput(TeeOutput):
        def __init__(self, stdout_stream, stderr_stream, log_file_path):
            super().__init__(stdout_stream, log_file_path)
            self.stderr_terminal = stderr_stream
            
        def write_stderr(self, message):
            # Write to stderr terminal
            self.stderr_terminal.write(message)
            self.stderr_terminal.flush()
            
            # Write to combined log file
            try:
                with open(self.log_file_path, 'a', encoding='utf-8') as f:
                    f.write(f"[STDERR] {message}")
                    f.flush()
            except Exception:
                pass
    
    # Create combined output that captures both stdout and stderr
    combined_log = log_dir / 'combined_output.log'
    
    # Add timestamp to combined log
    try:
        from datetime import datetime
        with open(combined_log, 'a', encoding='utf-8') as f:
            f.write(f"\n{'='*60}\n")
            f.write(f"Session started at: {datetime.now()}\n")
            f.write(f"{'='*60}\n")
    except Exception:
        pass
    
    return True


# Automatically set up tee output when this module is imported
try:
    setup_tee_output()
except Exception:
    pass  # If it fails, continue without tee output


def force_flush_all():
    """Force flush all output streams and logging handlers."""
    # Flush standard streams
    sys.stdout.flush()
    sys.stderr.flush()
    
    # Flush all logging handlers
    for handler in logging.root.handlers:
        try:
            handler.flush()
        except Exception:
            pass
    
    # Flush all logger handlers
    for logger_name in logging.Logger.manager.loggerDict:
        logger = logging.getLogger(logger_name)
        for handler in logger.handlers:
            try:
                handler.flush()
            except Exception:
                pass
