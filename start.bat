@echo off
python "%~dp0start_eventora.py" %*
if errorlevel 1 pause
