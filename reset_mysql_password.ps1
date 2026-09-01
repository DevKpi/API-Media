Write-Host "Restableciendo contraseña de MySQL..." -ForegroundColor Cyan
Stop-Service MySQL80 -ErrorAction SilentlyContinue

$proc = Start-Process -FilePath "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" -ArgumentList '--defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini"', '--init-file="C:\Users\isft118\Desktop\Software 2do\API-Media\mysql-init.txt"', '--console' -PassThru
Start-Sleep -Seconds 5
Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue

Start-Service MySQL80
Write-Host "¡Contraseña actualizada a 'root1234' y servicio MySQL80 iniciado!" -ForegroundColor Green
Start-Sleep -Seconds 3
