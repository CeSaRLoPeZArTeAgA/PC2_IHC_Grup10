#!/usr/bin/env python3
"""Compatibilidad: delega al generador central de entregables.
Evita reintroducir el código estudiantil desactualizado.
"""
from pathlib import Path
import subprocess
import sys

if __name__ == '__main__':
    task = Path(__file__).with_name('finalizar_entregables_pc2.py')
    subprocess.run([sys.executable, str(task)], check=True)
