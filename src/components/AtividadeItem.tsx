import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AtividadeComAluno } from '@/types';
import { colors, commonStyles } from '@/theme/styles';
import StatusBadge from './StatusBadge';

interface Props {
  atividade: AtividadeComAluno;
  onEditar: (atividade: AtividadeComAluno) => void;
}

export default function AtividadeItem({ atividade, onEditar }: Props) {
  const percentual =
    atividade.estimativa_horas > 0
      ? Math.min(100, Math.round((atividade.horas_trabalhadas / atividade.estimativa_horas) * 100))
      : 0;

  return (
    <TouchableOpacity style={commonStyles.card} onPress={() => onEditar(atividade)}>
      <View style={styles.header}>
        <Text style={styles.descricao} numberOfLines={2}>
          {atividade.descricao}
        </Text>
        <StatusBadge situacao={atividade.situacao} />
      </View>
      <Text style={styles.detalhe}>Responsável: {atividade.aluno_nome}</Text>
      <View style={styles.progressRow}>
        <Text style={styles.detalhe}>
          {atividade.horas_trabalhadas}h / {atividade.estimativa_horas}h ({percentual}%)
        </Text>
      </View>
      <View style={styles.barraContainer}>
        <View style={[styles.barraProgresso, { width: `${percentual}%` }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  descricao: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  detalhe: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  barraContainer: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  barraProgresso: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});
