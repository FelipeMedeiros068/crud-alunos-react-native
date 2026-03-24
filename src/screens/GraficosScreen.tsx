import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { BarChart } from 'react-native-gifted-charts';
import { Trabalho, AtividadeComAluno } from '@/types';
import * as trabalhoRepo from '@/database/trabalhoRepository';
import * as atividadeRepo from '@/database/atividadeRepository';
import { colors, commonStyles } from '@/theme/styles';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';

const screenWidth = Dimensions.get('window').width;

export default function GraficosScreen() {
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [trabalhoSelecionado, setTrabalhoSelecionado] = useState<number | null>(null);
  const [atividades, setAtividades] = useState<AtividadeComAluno[]>([]);

  const carregarTrabalhos = useCallback(async () => {
    try {
      const t = await trabalhoRepo.getAll();
      setTrabalhos(t);
    } catch {
      Alert.alert('Erro', 'Falha ao carregar trabalhos.');
    }
  }, []);

  useFocusEffect(useCallback(() => { carregarTrabalhos(); }, [carregarTrabalhos]));

  const selecionarTrabalho = async (id: number | null) => {
    setTrabalhoSelecionado(id);
    if (id) {
      try {
        const ats = await atividadeRepo.getByTrabalho(id);
        setAtividades(ats);
      } catch {
        setAtividades([]);
      }
    } else {
      setAtividades([]);
    }
  };

  // Cálculos
  const totalEstimado = atividades.reduce((sum, a) => sum + a.estimativa_horas, 0);
  const totalTrabalhado = atividades.reduce((sum, a) => sum + a.horas_trabalhadas, 0);
  const percentualGeral = totalEstimado > 0 ? Math.min(100, Math.round((totalTrabalhado / totalEstimado) * 100)) : 0;
  const atividadesConcluidas = atividades.filter((a) => a.situacao === 'concluida').length;

  // Dados para gráfico de barras agrupadas
  const barData = atividades.flatMap((at, index) => {
    const label = at.descricao.length > 8 ? at.descricao.substring(0, 8) + '...' : at.descricao;
    return [
      {
        value: at.estimativa_horas,
        label: index === 0 ? label : label,
        frontColor: colors.primary,
        spacing: 2,
        labelWidth: 60,
        labelTextStyle: { color: colors.textMuted, fontSize: 10 },
      },
      {
        value: at.horas_trabalhadas,
        frontColor: colors.concluido,
        spacing: 18,
      },
    ];
  });

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surface} />

      <View style={commonStyles.header}>
        <Text style={commonStyles.headerTitulo}>Gráficos</Text>
        <Text style={commonStyles.headerSubtitulo}>Visualize o progresso</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={styles.label}>Selecione um trabalho:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={trabalhoSelecionado}
            onValueChange={(value) => selecionarTrabalho(value)}
            style={styles.picker}
            dropdownIconColor={colors.textPrimary}
          >
            <Picker.Item label="-- Selecione --" value={null} />
            {trabalhos.map((t) => (
              <Picker.Item key={t.id} label={t.nome} value={t.id} />
            ))}
          </Picker>
        </View>

        {!trabalhoSelecionado && <EmptyState texto="Selecione um trabalho acima." />}

        {trabalhoSelecionado && atividades.length === 0 && (
          <EmptyState texto="Nenhuma atividade neste trabalho." subTexto="Adicione atividades na aba Trabalhos." />
        )}

        {trabalhoSelecionado && atividades.length > 0 && (
          <>
            {/* Resumo geral */}
            <View style={styles.resumoCard}>
              <Text style={styles.resumoTitulo}>Resumo do Trabalho</Text>

              <View style={styles.resumoRow}>
                <Text style={styles.resumoLabel}>Horas estimadas:</Text>
                <Text style={styles.resumoValor}>{totalEstimado}h</Text>
              </View>
              <View style={styles.resumoRow}>
                <Text style={styles.resumoLabel}>Horas trabalhadas:</Text>
                <Text style={styles.resumoValor}>{totalTrabalhado}h</Text>
              </View>
              <View style={styles.resumoRow}>
                <Text style={styles.resumoLabel}>Progresso geral:</Text>
                <Text style={[styles.resumoValor, { color: colors.primary }]}>{percentualGeral}%</Text>
              </View>
              <View style={styles.resumoRow}>
                <Text style={styles.resumoLabel}>Atividades concluídas:</Text>
                <Text style={styles.resumoValor}>
                  {atividadesConcluidas} de {atividades.length}
                </Text>
              </View>

              <View style={styles.barraContainer}>
                <View style={[styles.barraProgresso, { width: `${percentualGeral}%` }]} />
              </View>
            </View>

            {/* Gráfico de barras */}
            <View style={styles.graficoCard}>
              <Text style={styles.graficoTitulo}>Horas por Atividade</Text>

              <View style={styles.legenda}>
                <View style={styles.legendaItem}>
                  <View style={[styles.legendaCor, { backgroundColor: colors.primary }]} />
                  <Text style={styles.legendaTexto}>Estimada</Text>
                </View>
                <View style={styles.legendaItem}>
                  <View style={[styles.legendaCor, { backgroundColor: colors.concluido }]} />
                  <Text style={styles.legendaTexto}>Trabalhada</Text>
                </View>
              </View>

              <BarChart
                data={barData}
                barWidth={20}
                spacing={12}
                roundedTop
                xAxisThickness={1}
                yAxisThickness={1}
                xAxisColor={colors.border}
                yAxisColor={colors.border}
                yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
                noOfSections={4}
                width={screenWidth - 100}
                backgroundColor={colors.surface}
                rulesColor={colors.border}
                rulesType="solid"
                isAnimated
              />
            </View>

            {/* Detalhamento por atividade */}
            <View style={styles.detalheCard}>
              <Text style={styles.graficoTitulo}>Detalhamento</Text>
              {atividades.map((at) => {
                const pct =
                  at.estimativa_horas > 0
                    ? Math.min(100, Math.round((at.horas_trabalhadas / at.estimativa_horas) * 100))
                    : 0;
                return (
                  <View key={at.id} style={styles.detalheItem}>
                    <View style={styles.detalheHeader}>
                      <Text style={styles.detalheDescricao} numberOfLines={1}>
                        {at.descricao}
                      </Text>
                      <StatusBadge situacao={at.situacao} />
                    </View>
                    <Text style={styles.detalheTexto}>
                      {at.aluno_nome} | {at.horas_trabalhadas}h / {at.estimativa_horas}h ({pct}%)
                    </Text>
                    <View style={styles.miniBarraContainer}>
                      <View style={[styles.miniBarraProgresso, { width: `${pct}%` }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  pickerContainer: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },
  picker: { color: colors.textPrimary, backgroundColor: 'transparent' },
  resumoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resumoTitulo: { color: colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  resumoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  resumoLabel: { color: colors.textSecondary, fontSize: 14 },
  resumoValor: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  barraContainer: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 12,
  },
  barraProgresso: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  graficoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  graficoTitulo: { color: colors.textPrimary, fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  legenda: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendaCor: { width: 12, height: 12, borderRadius: 3 },
  legendaTexto: { color: colors.textSecondary, fontSize: 12 },
  detalheCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detalheItem: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detalheHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detalheDescricao: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
  detalheTexto: { color: colors.textSecondary, fontSize: 12, marginBottom: 6 },
  miniBarraContainer: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniBarraProgresso: {
    height: '100%',
    backgroundColor: colors.concluido,
    borderRadius: 3,
  },
});
