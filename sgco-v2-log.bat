@echo off
echo ====================================================================
echo STATUS DO SERVIDOR:
pm2 status sgco-v2
echo ====================================================================
echo.
echo LOGS EM TEMPO REAL (Ctrl+C para sair do log):
pm2 logs sgco-v2
exit