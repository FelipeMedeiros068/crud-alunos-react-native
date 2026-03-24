import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { Trabalho, AtividadeComAluno, SituacaoAtividade } from '@/types';
import * as trabalhoRepo from '@/database/trabalhoRepository';
import * as atividadeRepo from '@/database/atividadeRepository';
import { colors, commonStyles } from '@/theme/styles';
import AtividadeItem from '@/components/AtividadeItem';
import EmptyState from '@/components/EmptyState';

export default function ProgressoScreen() {
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [trabalhoSelecionado, setTrabalhoSelecionado] = useState<number | null>(null);
  const [atividades, setAtividades] = useState<AtividadeComAluno[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Form para edição de progresso
  const [editandoAtividade, setEditandoAtividade] = useState<AtividadeComAluno | null>(null);
  const [horasTrabalhadas, setHorasTrabalhadas] = useState('');
  const [situacao, setSituacao] = useState<SituacaoAtividade>('pendente');

  const carregarTrabalhos = useCallback(async () => {
    try {
      const t = await trabalhoRepo.getAll();
      setTrabalhos(t);
    } catch {
      Alert.alert('Erro', 'Falha ao carregar trabalhos.');
    }
  }, []);

  useFocusEffect(useCallback(() => { carregarTrabalhos(); }, [carregarTrabalhos]));

  const carregarAtividades = async (trabalhoId: number) => {
    try {
      const ats = await atividadeRepo.getByTrabalho(trabalhoId);
      setAtividades(ats);
    } catch {
      Alert.alert('Erro', 'Falha ao carregar atividades.');
    }
  };

  const selecionarTrabalho = (id: number | null) => {
    setTrabalhoSelecionado(id);
    if (id) carregarAtividades(id);
    else setAtividades([]);
  };

  const abrirModalEdicao = (atividade: AtividadeComAluno) => {
    setEditandoAtividade(atividade);
    setHorasTrabalhadas(atividade.horas_trabalhadas.toString());
    setSituacao(atividade.situacao);
    setModalVisible(true);
  };

  const salvarProgresso = async () => {
    if (!editandoAtividade) return;

    const horas = parseFloat(horasTrabalhadas) || 0;
    if (horas < 0) {
      Alert.alert('Atenção', 'As horas não podem ser negativas.');
      return;
    }

    try {
      await atividadeRepo.updateProgress(editandoAtividade.id, horas, situacao);
      setModalVisible(false);
      if (trabalhoSelecionado) await carregarAtividades(trabalhoSelecionado);
    } catch (error: any) {
      Alert.alert('Erro', error?.message ?? 'Falha ao salvar.');
    }
  };

  // Resumo do trabalho
  const totalEstimado = atividades.reduce((sum, a) => sum + a.estimativa_horas, 0);
  const totalTrabalhado = atividades.reduce((sum, a) => sum + a.horas_trabalhadas, 0);
  const percentualGeral = totalEstimado > 0 ? Math.round((totalTrabalhado / totalEstimado) * 100) : 0;

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surface} />

      <View style={commonStyles.header}>
        <Text style={commonStyles.headerTitulo}>Progresso</Text>
        <Text style={commonStyles.headerSubtitulo}>Acompanhe as atividades</Text>
      </View>

      <View style={styles.seletorContainer}>
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
      </View>

      {trabalhoSelecionado && atividades.length > 0 && (
        <View style={styles.resumo}>
          <Text style={styles.resumoTexto}>
            {totalTrabalhado}h / {totalEstimado}h ({percentualGeral}%)
          </Text>
          <View style={styles.barraContainer}>
            <View style={[styles.barraProgresso, { width: `${Math.min(100, percentualGeral)}%` }]} />
          </View>
        </View>
      )}

      <FlatList
        data={atividades}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AtividadeItem atividade={item} onEditar={abrirModalEdicao} />
        )}
        contentContainerStyle={commonStyles.lista}
        ListEmptyComponent={
          trabalhoSelecionado ? (
            <EmptyState texto="Nenhuma atividade neste trabalho." subTexto="Adicione atividades na aba Trabalhos." />
          ) : (
            <EmptyState texto="Selecione um trabalho acima." />
          )
        }
      />

      {/* Modal edição de progresso */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={commonStyles.modalOverlay}>
            <View style={commonStyles.modalContainer}>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={commonStyles.modalTitulo}>Editar Progresso</Text>

                {editandoAtividade && (
                  <View style={styles.atividadeInfo}>
                    <Text style={styles.atividadeNome}>{editandoAtividade.descricao}</Text>
                    <Text style={styles.atividadeDetalhe}>
                      Responsável: {editandoAtividade.aluno_nome}
                    </Text>
                    <Text style={styles.atividadeDetalhe}>
                      Estimativa: {editandoAtividade.estimativa_horas}h
                    </Text>
                  </View>
                )}

                <TextInput
                  style={commonStyles.input}
                  placeholder="Horas trabalhadas"
                  placeholderTextColor={colors.textMuted}
                  value={horasTrabalhadas}
                  onChangeText={setHorasTrabalhadas}
                  keyboardType="decimal-pad"
                />

                <Text style={styles.label}>Situação</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={situacao}
                    onValueChange={setSituacao}
                    style={styles.picker}
                    dropdownIconColor={colors.textPrimary}
                  >
                    <Picker.Item label="Pendente" value="pendente" />
                    <Picker.Item label="Concluída" value="concluida" />
                    <Picker.Item label="Cancelada" value="cancelada" />
                  </Picker>
                </View>

                <View style={commonStyles.modalBotoes}>
                  <TouchableOpacity
                    style={[commonStyles.btnModal, commonStyles.btnCancelar]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={commonStyles.btnModalTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[commonStyles.btnModal, commonStyles.btnSalvar]}
                    onPress={salvarProgresso}
                  >
                    <Text style={commonStyles.btnModalTexto}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  seletorContainer: { padding: 16, paddingBottom: 0 },
  label: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  pickerContainer: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  picker: { color: colors.textPrimary, backgroundColor: 'transparent' },
  resumo: {
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resumoTexto: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  barraContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barraProgresso: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  atividadeInfo: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  atividadeNome: { color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  atividadeDetalhe: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
});
