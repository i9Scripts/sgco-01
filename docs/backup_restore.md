# Backup e Restore do banco de dados

Uso rápido:

- Criar backup (salva em `./backups` por padrão):

```bash
./scripts/db_backup.sh
# ou especificar diretório
./scripts/db_backup.sh /media/backup-drive/optosystem
```

- Restaurar backup:

```bash
# arquivo pode estar compactado (.gz) ou não
./scripts/db_restore.sh /media/backup-drive/optosystem/optosystem_20250101_120000.sql.gz
```

Como os scripts acham as credenciais:

- Eles carregam variáveis do arquivo `.env` na raiz do projeto.
- Se `DATABASE_URL` estiver no formato `mysql://user:pass@host:port/dbname`, o script extrai automaticamente `user`, `pass`, `host`, `port` e `dbname`.

Dicas:

- Torne os scripts executáveis: `chmod +x scripts/db_*.sh`
- Agende backups regulares com `cron` apontando para o diretório de destino (uma mídia externa montada).
- Verifique espaço disponível antes de gravar grandes dumps.

Exemplo de entrada no `crontab` (backup diário às 2:30):

```
30 2 * * * /media/i9scripts/1714C73F033CA5B0/Downloads/Codar/optosystem/scripts/db_backup.sh /media/backup-drive/optosystem
```
