
Para usar comandos

`SELECT` no MariaDB pelo terminal Linux, faça login com `mysql -u usuario -p`, selecione o banco com `USE nome_banco;` e execute consultas como `SELECT * FROM tabela;`. Comandos essenciais incluem filtros (`WHERE`), ordenação (`ORDER BY`), limitação (`LIMIT`) e contagem (`COUNT`), sempre finalizando com ponto e vírgula. 

Aqui estão os principais exemplos de comandos `SELECT` no terminal: 

1\. Preparação (Acesso) 

bash

```
# Logar no MariaDB
mysql -u root -p

# Selecionar o banco de dados
USE nome_do_banco;

# Listar tabelas para saber de onde selecionar
SHOW TABLES;
```

2\. Comandos `SELECT` Básicos e Essenciais 

- **Selecionar todas as colunas de uma tabela:**
	sql
	```
	SELECT * FROM nome_da_tabela;
	```

- **Selecionar colunas específicas:**
	sql
	```
	SELECT coluna1, coluna2 FROM nome_da_tabela;
	```

- **Selecionar com filtro (`WHERE`):**
	sql
	```
	SELECT * FROM nome_da_tabela WHERE coluna1 = 'valor';
	```

- **Selecionar dados distintos (sem duplicatas):**
	sql
	```
	SELECT DISTINCT coluna1 FROM nome_da_tabela;
	```


3\. Comandos `SELECT` Avançados 

- **Ordenar resultados (`ORDER BY` - ASC ou DESC):**
	sql
	```
	SELECT * FROM nome_da_tabela ORDER BY coluna1 DESC;
	```

- **Limitar o número de resultados (`LIMIT`):**
	sql
	```
	SELECT * FROM nome_da_tabela LIMIT 10;
	```

- **Contar registros (`COUNT`):**
	sql
	```
	SELECT COUNT(*) FROM nome_da_tabela;
	```

- **Buscar por padrão (`LIKE`):**
	sql
	```
	SELECT * FROM nome_da_tabela WHERE coluna1 LIKE 'texto%';
	```

4\. Consultas com Múltiplas Tabelas (JOIN) 

- **Unir duas tabelas (`INNER JOIN`):**
	sql
	```
	SELECT t1.coluna1, t2.coluna2
	FROM tabela1 AS t1
	INNER JOIN tabela2 AS t2 ON t1.id = t2.t1_id;
	```


**Dicas de Terminal:** 

- Todos os comandos SQL devem terminar com `;`.
- Para sair, digite `exit` ou pressione `Ctrl+D`.
- Utilize `DESCRIBE nome_da_tabela;` para ver a estrutura da tabela antes de fazer o SELECT.