import { executeSql, executeSqlBatch } from './connection';

export async function initializeDatabase(): Promise<void> {
  // Foreign keys devem ser habilitadas a cada conexão
  await executeSql('PRAGMA foreign_keys = ON');

  await executeSqlBatch([
    {
      sql: `CREATE TABLE IF NOT EXISTS alunos (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        nome       TEXT NOT NULL,
        matricula  TEXT NOT NULL UNIQUE,
        curso      TEXT NOT NULL,
        nota       TEXT
      )`,
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS trabalhos (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        nome             TEXT NOT NULL,
        data_entrega     TEXT NOT NULL,
        estimativa_horas REAL NOT NULL DEFAULT 0,
        situacao         TEXT NOT NULL DEFAULT 'pendente'
                         CHECK (situacao IN ('pendente', 'concluido', 'cancelado'))
      )`,
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS trabalho_alunos (
        trabalho_id INTEGER NOT NULL REFERENCES trabalhos(id) ON DELETE CASCADE,
        aluno_id    INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
        PRIMARY KEY (trabalho_id, aluno_id)
      )`,
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS atividades (
        id                INTEGER PRIMARY KEY AUTOINCREMENT,
        trabalho_id       INTEGER NOT NULL REFERENCES trabalhos(id) ON DELETE CASCADE,
        descricao         TEXT NOT NULL,
        aluno_responsavel INTEGER NOT NULL REFERENCES alunos(id) ON DELETE RESTRICT,
        situacao          TEXT NOT NULL DEFAULT 'pendente'
                         CHECK (situacao IN ('pendente', 'concluida', 'cancelada')),
        estimativa_horas  REAL NOT NULL DEFAULT 0,
        horas_trabalhadas REAL NOT NULL DEFAULT 0
      )`,
    },
  ]);
}

// Migração removida — AsyncStorage não é mais dependência do projeto.
// O banco SQLite é a única fonte de dados.
