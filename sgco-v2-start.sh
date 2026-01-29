#!/bin/bash
echo "Iniciando a aplicação sgco-v2 com pm2..."
pm2 start src/server.js --name sgco-v2
pm2 status sgco-v2
