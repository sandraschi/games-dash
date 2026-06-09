; Kill UI + backend before install/uninstall (backend locks resources/*.exe).
!macro KillGamesFleetProcesses
  DetailPrint "Stopping Games Collection processes..."
  ExecWait 'taskkill /F /IM games-app-backend.exe /T' $0
  ExecWait 'taskkill /F /IM games-app-native.exe /T' $0
  !if "${INSTALLMODE}" == "currentUser"
    nsis_tauri_utils::KillProcessCurrentUser "games-app-backend.exe"
    Pop $0
    nsis_tauri_utils::KillProcessCurrentUser "games-app-native.exe"
    Pop $0
  !else
    nsis_tauri_utils::KillProcess "games-app-backend.exe"
    Pop $0
    nsis_tauri_utils::KillProcess "games-app-native.exe"
    Pop $0
  !endif
  Sleep 2000
!macroend

!macro NSIS_HOOK_PREINSTALL
  !insertmacro KillGamesFleetProcesses
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  !insertmacro KillGamesFleetProcesses
!macroend
