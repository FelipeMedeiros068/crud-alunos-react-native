import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Aluno } from '@/types';
import { colors, commonStyles } from '@/theme/styles';

interface Props {
  aluno: Aluno;
  onEditar: (aluno: Aluno) => void;
  onExcluir: (id: number) => void;
}

export default function AlunoCard({ aluno, onEditar, onExcluir }: Props) {
  return (
    <View style={[commonStyles.card, styles.card]}>
      <View style={styles.info}>
        <Text style={styles.nome}>{aluno.nome}</Text>
        <Text style={styles.detalhe}>Matrícula: {aluno.matricula}</Text>
        <Text style={styles.detalhe}>Curso: {aluno.curso}</Text>
        {aluno.nota ? <Text style={styles.detalhe}>Nota: {aluno.nota}</Text> : null}
      </View>
      <View style={styles.acoes}>
        <TouchableOpacity style={[styles.btn, styles.btnEditar]} onPress={() => onEditar(aluno)}>
          <Text style={styles.btnTexto}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnExcluir]} onPress={() => onExcluir(aluno.id)}>
          <Text style={styles.btnTexto}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1 },
  nome: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 4 },
  detalhe: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  acoes: { gap: 8 },
  btn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginBottom: 4 },
  btnEditar: { backgroundColor: colors.edit },
  btnExcluir: { backgroundColor: colors.danger },
  btnTexto: { color: colors.white, fontSize: 12, fontWeight: '600', textAlign: 'center' },
});
