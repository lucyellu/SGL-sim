$sh = New-Object -ComObject WScript.Shell
$lnk = $sh.CreateShortcut([Environment]::GetFolderPath("Desktop") + "\SGL Telescope.lnk")
Write-Host "Target Path:" $lnk.TargetPath
Write-Host "Working Directory:" $lnk.WorkingDirectory
