import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('escola.db');

export function executeSql(
  sql: string,
  params: (string | number | null)[] = []
): Promise<SQLite.SQLResultSet> {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve(result),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => reject(error)
    );
  });
}

export function executeSqlBatch(
  statements: { sql: string; params?: (string | number | null)[] }[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        for (const stmt of statements) {
          tx.executeSql(stmt.sql, stmt.params ?? []);
        }
      },
      (error) => reject(error),
      () => resolve()
    );
  });
}

export default db;
