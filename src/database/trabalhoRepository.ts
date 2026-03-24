import { executeSql, executeSqlBatch } from './connection';
import { Trabalho, TrabalhoInput, TrabalhoComDetalhes, Aluno } from '@/types';

export async function getAll(): Promise<TrabalhoComDetalhes[]> {
  const result = await executeSql(`
    SELECT t.*,
      (SELECT COUNT(*) FROM trabalho_alunos ta WHERE ta.trabalho_id = t.id) as total_alunos,
      (SELECT COUNT(*) FROM atividades a WHERE a.trabalho_id = t.id) as total_atividades
    FROM trabalhos t
    ORDER BY t.data_entrega
  `);

  const trabalhos: TrabalhoComDetalhes[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    const row = result.rows.item(i);
    const alunos = await getAlunos(row.id);
    trabalhos.push({ ...row, alunos });
  }
  return trabalhos;
}

export async function getById(id: number): Promise<TrabalhoComDetalhes | null> {
  const result = await executeSql(
    `SELECT t.*,
      (SELECT COUNT(*) FROM atividades a WHERE a.trabalho_id = t.id) as total_atividades
    FROM trabalhos t WHERE t.id = ?`,
    [id]
  );
  if (result.rows.length === 0) return null;

  const row = result.rows.item(0);
  const alunos = await getAlunos(id);
  return { ...row, alunos };
}

export async function getAlunos(trabalhoId: number): Promise<Aluno[]> {
  const result = await executeSql(
    `SELECT a.* FROM alunos a
     INNER JOIN trabalho_alunos ta ON ta.aluno_id = a.id
     WHERE ta.trabalho_id = ?
     ORDER BY a.nome`,
    [trabalhoId]
  );
  const alunos: Aluno[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    alunos.push(result.rows.item(i));
  }
  return alunos;
}

export async function create(
  input: TrabalhoInput,
  alunoIds: number[]
): Promise<number> {
  const result = await executeSql(
    'INSERT INTO trabalhos (nome, data_entrega, estimativa_horas, situacao) VALUES (?, ?, ?, ?)',
    [input.nome, input.data_entrega, input.estimativa_horas, input.situacao]
  );

  const trabalhoId = result.insertId!;

  for (const alunoId of alunoIds) {
    await executeSql(
      'INSERT INTO trabalho_alunos (trabalho_id, aluno_id) VALUES (?, ?)',
      [trabalhoId, alunoId]
    );
  }

  return trabalhoId;
}

export async function update(
  id: number,
  input: TrabalhoInput,
  alunoIds: number[]
): Promise<void> {
  await executeSql(
    'UPDATE trabalhos SET nome = ?, data_entrega = ?, estimativa_horas = ?, situacao = ? WHERE id = ?',
    [input.nome, input.data_entrega, input.estimativa_horas, input.situacao, id]
  );

  // Recria vínculos com alunos
  await executeSql('DELETE FROM trabalho_alunos WHERE trabalho_id = ?', [id]);
  for (const alunoId of alunoIds) {
    await executeSql(
      'INSERT INTO trabalho_alunos (trabalho_id, aluno_id) VALUES (?, ?)',
      [id, alunoId]
    );
  }
}

export async function remove(id: number): Promise<void> {
  // CASCADE deleta trabalho_alunos e atividades automaticamente
  await executeSql('DELETE FROM trabalhos WHERE id = ?', [id]);
}
