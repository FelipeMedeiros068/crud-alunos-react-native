import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TrabalhoComDetalhes } from '@/types';
import { colors, commonStyles } from '@/theme/styles';
import StatusBadge from './StatusBadge';

interface Props {
  trabalho: TrabalhoComDetalhes;
  onEditar: (trabalho: TrabalhoComDetalhes) => void;
  onExcluir: (id: number) => void;
}

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

export default function TrabalhoCard({ trabalho, onEditar, onExcluir }: Props) {
  return (
    <View style={commonStyles.card}>
      <View style={styles.header}>
        <Text style={styles.nome}>{trabalho.nome}</Text>
        <StatusBadge situacao={trabalho.situacao} />
      </View>
      <Text style={styles.detalhe}>Entrega: {formatarData(trabalho.data_entrega)}</Text>
      <Text style={styles.detalhe}>Estimativa: {trabalho.estimativa_horas}h</Text>
      <Text style={styles.detalhe}>
        {trabalho.alunos.length} aluno(s) | {trabalho.total_atividades} atividade(s)
      </Text>
      <View style={styles.acoes}>
        <TouchableOpacity style={[styles.btn, styles.btnEditar]} onPress={() => onEditar(trabalho)}>
          <Text style={styles.btnTexto}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnExcluir]}
          onPress={() => onExcluir(trabalho.id)}
        >
          <Text style={styles.btnTexto}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nome: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, flex: 1, marginRight: 8 },
  detalhe: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  acoes: { flexDirection: 'row', gap: 8, marginTop: 12 },
  btn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  btnEditar: { backgroundColor: colors.edit },
  btnExcluir: { backgroundColor: colors.danger },
  btnTexto: { color: colors.white, fontSize: 12, fontWeight: '600' },
});
