import { executeSql } from './connection';
import { Aluno, AlunoInput } from '@/types';

export async function getAll(): Promise<Aluno[]> {
  const result = await executeSql('SELECT * FROM alunos ORDER BY nome');
  const alunos: Aluno[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    alunos.push(result.rows.item(i));
  }
  return alunos;
}

export async function getById(id: number): Promise<Aluno | null> {
  const result = await executeSql('SELECT * FROM alunos WHERE id = ?', [id]);
  return result.rows.length > 0 ? result.rows.item(0) : null;
}

export async function create(input: AlunoInput): Promise<number> {
  const result = await executeSql(
    'INSERT INTO alunos (nome, matricula, curso, nota) VALUES (?, ?, ?, ?)',
    [input.nome, input.matricula, input.curso, input.nota]
  );
  return result.insertId!;
}

export async function update(id: number, input: AlunoInput): Promise<void> {
  await executeSql(
    'UPDATE alunos SET nome = ?, matricula = ?, curso = ?, nota = ? WHERE id = ?',
    [input.nome, input.matricula, input.curso, input.nota, id]
  );
}

export async function remove(id: number): Promise<void> {
  // Verifica dependências antes de excluir
  const deps = await executeSql(
    `SELECT COUNT(*) as count FROM atividades WHERE aluno_responsavel = ?
     UNION ALL
     SELECT COUNT(*) as count FROM trabalho_alunos WHERE aluno_id = ?`,
    [id, id]
  );

  const atividadeCount = deps.rows.item(0).count;
  const trabalhoCount = deps.rows.item(1).count;

  if (atividadeCount > 0) {
    throw new Error(
      `Este aluno é responsável por ${atividadeCount} atividade(s). Remova-o das atividades antes de excluir.`
    );
  }

  // Remove vínculos com trabalhos e então o aluno
  await executeSql('DELETE FROM trabalho_alunos WHERE aluno_id = ?', [id]);
  await executeSql('DELETE FROM alunos WHERE id = ?', [id]);
}
