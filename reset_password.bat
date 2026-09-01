@echo off
title Restablecer Password MySQL
echo ======================================================
echo   Restableciendo contrasena de MySQL root a root1234
echo ======================================================

echo [1/4] Deteniendo servicio MySQL80...
net stop MySQL80 >nul 2>&1

echo [2/4] Aplicando nueva contrasena...
start "" /B "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini" --init-file="C:\Users\isft118\Desktop\Software 2do\API-Media\mysql-init.txt" --console

echo [3/4] Esperando aplicacion...
timeout /t 6 /nobreak >nul

taskkill /F /IM mysqld.exe >nul 2>&1

echo [4/4] Iniciando servicio MySQL80...
net start MySQL80

echo.
echo ======================================================
echo   EXITO! Contrasena actualizada a: root1234
echo ======================================================
pause
