import { executeSql } from './connection';
import { Atividade, AtividadeInput, AtividadeComAluno } from '@/types';

export async function getByTrabalho(trabalhoId: number): Promise<AtividadeComAluno[]> {
  const result = await executeSql(
    `SELECT at.*, al.nome as aluno_nome
     FROM atividades at
     INNER JOIN alunos al ON al.id = at.aluno_responsavel
     WHERE at.trabalho_id = ?
     ORDER BY at.descricao`,
    [trabalhoId]
  );
  const atividades: AtividadeComAluno[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    atividades.push(result.rows.item(i));
  }
  return atividades;
}

export async function create(input: AtividadeInput): Promise<number> {
  const result = await executeSql(
    `INSERT INTO atividades (trabalho_id, descricao, aluno_responsavel, situacao, estimativa_horas, horas_trabalhadas)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      input.trabalho_id,
      input.descricao,
      input.aluno_responsavel,
      input.situacao,
      input.estimativa_horas,
      input.horas_trabalhadas,
    ]
  );
  return result.insertId!;
}

export async function update(id: number, input: Partial<AtividadeInput>): Promise<void> {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (input.descricao !== undefined) {
    fields.push('descricao = ?');
    values.push(input.descricao);
  }
  if (input.aluno_responsavel !== undefined) {
    fields.push('aluno_responsavel = ?');
    values.push(input.aluno_responsavel);
  }
  if (input.situacao !== undefined) {
    fields.push('situacao = ?');
    values.push(input.situacao);
  }
  if (input.estimativa_horas !== undefined) {
    fields.push('estimativa_horas = ?');
    values.push(input.estimativa_horas);
  }
  if (input.horas_trabalhadas !== undefined) {
    fields.push('horas_trabalhadas = ?');
    values.push(input.horas_trabalhadas);
  }

  if (fields.length === 0) return;

  values.push(id);
  await executeSql(`UPDATE atividades SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function updateProgress(
  id: number,
  horas_trabalhadas: number,
  situacao: string
): Promise<void> {
  await executeSql(
    'UPDATE atividades SET horas_trabalhadas = ?, situacao = ? WHERE id = ?',
    [horas_trabalhadas, situacao, id]
  );
}

export async function remove(id: number): Promise<void> {
  await executeSql('DELETE FROM atividades WHERE id = ?', [id]);
}
