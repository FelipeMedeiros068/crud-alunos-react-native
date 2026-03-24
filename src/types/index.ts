// ─── Entidades do banco ──────────────────────────────────────────────────────

export interface Aluno {
  id: number;
  nome: string;
  matricula: string;
  curso: string;
  nota: string | null;
}

export type SituacaoTrabalho = 'pendente' | 'concluido' | 'cancelado';
export type SituacaoAtividade = 'pendente' | 'concluida' | 'cancelada';

export interface Trabalho {
  id: number;
  nome: string;
  data_entrega: string; // ISO "YYYY-MM-DD"
  estimativa_horas: number;
  situacao: SituacaoTrabalho;
}

export interface TrabalhoComDetalhes extends Trabalho {
  alunos: Aluno[];
  total_atividades: number;
}

export interface Atividade {
  id: number;
  trabalho_id: number;
  descricao: string;
  aluno_responsavel: number;
  situacao: SituacaoAtividade;
  estimativa_horas: number;
  horas_trabalhadas: number;
}

export interface AtividadeComAluno extends Atividade {
  aluno_nome: string;
}

// ─── Inputs (sem id, para criação) ───────────────────────────────────────────

export type AlunoInput = Omit<Aluno, 'id'>;
export type TrabalhoInput = Omit<Trabalho, 'id'>;
export type AtividadeInput = Omit<Atividade, 'id'>;
