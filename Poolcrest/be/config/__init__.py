# Configuration module
# Import capture_output first to ensure all output is logged
try:
    from .capture_output import setup_tee_output
    setup_tee_output()
except Exception:
    pass
