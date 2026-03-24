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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Aluno, TrabalhoComDetalhes, AtividadeComAluno, SituacaoTrabalho, SituacaoAtividade } from '@/types';
import * as trabalhoRepo from '@/database/trabalhoRepository';
import * as atividadeRepo from '@/database/atividadeRepository';
import * as alunoRepo from '@/database/alunoRepository';
import { colors, commonStyles } from '@/theme/styles';
import TrabalhoCard from '@/components/TrabalhoCard';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';

export default function TrabalhosScreen() {
  const [trabalhos, setTrabalhos] = useState<TrabalhoComDetalhes[]>([]);
  const [todosAlunos, setTodosAlunos] = useState<Aluno[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // Form fields
  const [nome, setNome] = useState('');
  const [dataEntrega, setDataEntrega] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [estimativaHoras, setEstimativaHoras] = useState('');
  const [situacao, setSituacao] = useState<SituacaoTrabalho>('pendente');
  const [alunosSelecionados, setAlunosSelecionados] = useState<Set<number>>(new Set());

  // Atividades do trabalho em edição
  const [atividades, setAtividades] = useState<AtividadeComAluno[]>([]);
  const [modalAtividadeVisible, setModalAtividadeVisible] = useState(false);
  const [editandoAtividadeId, setEditandoAtividadeId] = useState<number | null>(null);
  const [atDescricao, setAtDescricao] = useState('');
  const [atAluno, setAtAluno] = useState<number>(0);
  const [atEstimativa, setAtEstimativa] = useState('');
  const [atSituacao, setAtSituacao] = useState<SituacaoAtividade>('pendente');

  const carregarDados = useCallback(async () => {
    try {
      const [t, a] = await Promise.all([trabalhoRepo.getAll(), alunoRepo.getAll()]);
      setTrabalhos(t);
      setTodosAlunos(a);
    } catch {
      Alert.alert('Erro', 'Falha ao carregar dados.');
    }
  }, []);

  useFocusEffect(useCallback(() => { carregarDados(); }, [carregarDados]));

  const limparFormulario = () => {
    setNome('');
    setDataEntrega(new Date());
    setEstimativaHoras('');
    setSituacao('pendente');
    setAlunosSelecionados(new Set());
    setAtividades([]);
    setEditandoId(null);
  };

  const abrirModalNovo = () => {
    limparFormulario();
    setModalVisible(true);
  };

  const abrirModalEdicao = async (trabalho: TrabalhoComDetalhes) => {
    setEditandoId(trabalho.id);
    setNome(trabalho.nome);
    setDataEntrega(new Date(trabalho.data_entrega + 'T12:00:00'));
    setEstimativaHoras(trabalho.estimativa_horas.toString());
    setSituacao(trabalho.situacao);
    setAlunosSelecionados(new Set(trabalho.alunos.map((a) => a.id)));
    try {
      const ats = await atividadeRepo.getByTrabalho(trabalho.id);
      setAtividades(ats);
    } catch {
      setAtividades([]);
    }
    setModalVisible(true);
  };

  const toggleAluno = (id: number) => {
    setAlunosSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const salvarTrabalho = async () => {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Preencha o nome do trabalho.');
      return;
    }
    if (alunosSelecionados.size === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um aluno.');
      return;
    }
    const horas = parseFloat(estimativaHoras) || 0;
    const dataStr = dataEntrega.toISOString().split('T')[0];
    const alunoIds = Array.from(alunosSelecionados);

    try {
      if (editandoId) {
        await trabalhoRepo.update(
          editandoId,
          { nome: nome.trim(), data_entrega: dataStr, estimativa_horas: horas, situacao },
          alunoIds
        );
      } else {
        await trabalhoRepo.create(
          { nome: nome.trim(), data_entrega: dataStr, estimativa_horas: horas, situacao },
          alunoIds
        );
      }
      setModalVisible(false);
      limparFormulario();
      await carregarDados();
    } catch (error: any) {
      Alert.alert('Erro', error?.message ?? 'Falha ao salvar trabalho.');
    }
  };

  const excluirTrabalho = (id: number) => {
    Alert.alert('Confirmar', 'Excluir este trabalho e todas as suas atividades?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await trabalhoRepo.remove(id);
            await carregarDados();
          } catch (error: any) {
            Alert.alert('Erro', error?.message ?? 'Falha ao excluir.');
          }
        },
      },
    ]);
  };

  // ── Atividades ─────────────────────────────────────────────────────────────

  const alunosDoTrabalho = todosAlunos.filter((a) => alunosSelecionados.has(a.id));

  const abrirModalNovaAtividade = () => {
    if (alunosDoTrabalho.length === 0) {
      Alert.alert('Atenção', 'Selecione alunos no trabalho antes de criar atividades.');
      return;
    }
    setEditandoAtividadeId(null);
    setAtDescricao('');
    setAtAluno(alunosDoTrabalho[0]?.id ?? 0);
    setAtEstimativa('');
    setAtSituacao('pendente');
    setModalAtividadeVisible(true);
  };

  const abrirModalEditarAtividade = (at: AtividadeComAluno) => {
    setEditandoAtividadeId(at.id);
    setAtDescricao(at.descricao);
    setAtAluno(at.aluno_responsavel);
    setAtEstimativa(at.estimativa_horas.toString());
    setAtSituacao(at.situacao);
    setModalAtividadeVisible(true);
  };

  const salvarAtividade = async () => {
    if (!atDescricao.trim()) {
      Alert.alert('Atenção', 'Preencha a descrição da atividade.');
      return;
    }
    if (!editandoId) {
      Alert.alert('Atenção', 'Salve o trabalho antes de adicionar atividades.');
      return;
    }

    try {
      const horas = parseFloat(atEstimativa) || 0;
      if (editandoAtividadeId) {
        await atividadeRepo.update(editandoAtividadeId, {
          descricao: atDescricao.trim(),
          aluno_responsavel: atAluno,
          estimativa_horas: horas,
          situacao: atSituacao,
        });
      } else {
        await atividadeRepo.create({
          trabalho_id: editandoId,
          descricao: atDescricao.trim(),
          aluno_responsavel: atAluno,
          situacao: atSituacao,
          estimativa_horas: horas,
          horas_trabalhadas: 0,
        });
      }
      const ats = await atividadeRepo.getByTrabalho(editandoId);
      setAtividades(ats);
      setModalAtividadeVisible(false);
    } catch (error: any) {
      Alert.alert('Erro', error?.message ?? 'Falha ao salvar atividade.');
    }
  };

  const excluirAtividade = (id: number) => {
    Alert.alert('Confirmar', 'Excluir esta atividade?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await atividadeRepo.remove(id);
            if (editandoId) {
              const ats = await atividadeRepo.getByTrabalho(editandoId);
              setAtividades(ats);
            }
          } catch (error: any) {
            Alert.alert('Erro', error?.message ?? 'Falha ao excluir.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surface} />

      <View style={commonStyles.header}>
        <Text style={commonStyles.headerTitulo}>Trabalhos</Text>
        <Text style={commonStyles.headerSubtitulo}>{trabalhos.length} trabalho(s)</Text>
      </View>

      <FlatList
        data={trabalhos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TrabalhoCard trabalho={item} onEditar={abrirModalEdicao} onExcluir={excluirTrabalho} />
        )}
        contentContainerStyle={commonStyles.lista}
        ListEmptyComponent={
          <EmptyState texto="Nenhum trabalho cadastrado." subTexto='Toque no botão "+" para adicionar.' />
        }
      />

      <TouchableOpacity style={commonStyles.fab} onPress={abrirModalNovo}>
        <Text style={commonStyles.fabTexto}>+ Novo Trabalho</Text>
      </TouchableOpacity>

      {/* ── Modal Trabalho ──────────────────────────────────────────────────── */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={commonStyles.modalOverlay}>
            <View style={[commonStyles.modalContainer, { maxHeight: '95%' }]}>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={commonStyles.modalTitulo}>
                  {editandoId ? 'Editar Trabalho' : 'Novo Trabalho'}
                </Text>

                <TextInput
                  style={commonStyles.input}
                  placeholder="Nome do trabalho *"
                  placeholderTextColor={colors.textMuted}
                  value={nome}
                  onChangeText={setNome}
                />

                {/* Data de entrega */}
                <TouchableOpacity style={commonStyles.input} onPress={() => setShowDatePicker(true)}>
                  <Text style={{ color: colors.textPrimary, fontSize: 14 }}>
                    Entrega: {dataEntrega.toLocaleDateString('pt-BR')}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={dataEntrega}
                    mode="date"
                    display="default"
                    onChange={(_, date) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (date) setDataEntrega(date);
                    }}
                  />
                )}

                <TextInput
                  style={commonStyles.input}
                  placeholder="Estimativa de horas *"
                  placeholderTextColor={colors.textMuted}
                  value={estimativaHoras}
                  onChangeText={setEstimativaHoras}
                  keyboardType="decimal-pad"
                />

                {/* Situação */}
                <Text style={styles.label}>Situação</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={situacao}
                    onValueChange={setSituacao}
                    style={styles.picker}
                    dropdownIconColor={colors.textPrimary}
                  >
                    <Picker.Item label="Pendente" value="pendente" />
                    <Picker.Item label="Concluído" value="concluido" />
                    <Picker.Item label="Cancelado" value="cancelado" />
                  </Picker>
                </View>

                {/* Alunos */}
                <Text style={styles.label}>Alunos *</Text>
                {todosAlunos.length === 0 ? (
                  <Text style={styles.aviso}>Cadastre alunos na aba "Alunos" primeiro.</Text>
                ) : (
                  todosAlunos.map((aluno) => (
                    <TouchableOpacity
                      key={aluno.id}
                      style={[
                        styles.checkboxRow,
                        alunosSelecionados.has(aluno.id) && styles.checkboxRowSelecionado,
                      ]}
                      onPress={() => toggleAluno(aluno.id)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          alunosSelecionados.has(aluno.id) && styles.checkboxMarcado,
                        ]}
                      >
                        {alunosSelecionados.has(aluno.id) && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                      <Text style={styles.checkboxTexto}>
                        {aluno.nome} ({aluno.matricula})
                      </Text>
                    </TouchableOpacity>
                  ))
                )}

                {/* Atividades (apenas em edição) */}
                {editandoId && (
                  <View style={styles.secaoAtividades}>
                    <View style={styles.secaoHeader}>
                      <Text style={styles.label}>Atividades ({atividades.length})</Text>
                      <TouchableOpacity style={styles.btnAddAtividade} onPress={abrirModalNovaAtividade}>
                        <Text style={styles.btnAddAtividadeTexto}>+ Atividade</Text>
                      </TouchableOpacity>
                    </View>

                    {atividades.map((at) => (
                      <View key={at.id} style={styles.atividadeItem}>
                        <View style={styles.atividadeInfo}>
                          <Text style={styles.atividadeDescricao} numberOfLines={1}>{at.descricao}</Text>
                          <Text style={styles.atividadeDetalhe}>
                            {at.aluno_nome} | {at.estimativa_horas}h
                          </Text>
                          <StatusBadge situacao={at.situacao} />
                        </View>
                        <View style={styles.atividadeAcoes}>
                          <TouchableOpacity onPress={() => abrirModalEditarAtividade(at)}>
                            <Text style={styles.atividadeBtnEditar}>Editar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => excluirAtividade(at.id)}>
                            <Text style={styles.atividadeBtnExcluir}>Excluir</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                <View style={commonStyles.modalBotoes}>
                  <TouchableOpacity
                    style={[commonStyles.btnModal, commonStyles.btnCancelar]}
                    onPress={() => { setModalVisible(false); limparFormulario(); }}
                  >
                    <Text style={commonStyles.btnModalTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[commonStyles.btnModal, commonStyles.btnSalvar]} onPress={salvarTrabalho}>
                    <Text style={commonStyles.btnModalTexto}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Modal Atividade ─────────────────────────────────────────────────── */}
      <Modal visible={modalAtividadeVisible} animationType="slide" transparent onRequestClose={() => setModalAtividadeVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={commonStyles.modalOverlay}>
            <View style={commonStyles.modalContainer}>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={commonStyles.modalTitulo}>
                  {editandoAtividadeId ? 'Editar Atividade' : 'Nova Atividade'}
                </Text>

                <TextInput
                  style={commonStyles.input}
                  placeholder="Descrição da atividade *"
                  placeholderTextColor={colors.textMuted}
                  value={atDescricao}
                  onChangeText={setAtDescricao}
                />

                <Text style={styles.label}>Aluno responsável</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={atAluno}
                    onValueChange={setAtAluno}
                    style={styles.picker}
                    dropdownIconColor={colors.textPrimary}
                  >
                    {alunosDoTrabalho.map((a) => (
                      <Picker.Item key={a.id} label={a.nome} value={a.id} />
                    ))}
                  </Picker>
                </View>

                <TextInput
                  style={commonStyles.input}
                  placeholder="Estimativa de horas"
                  placeholderTextColor={colors.textMuted}
                  value={atEstimativa}
                  onChangeText={setAtEstimativa}
                  keyboardType="decimal-pad"
                />

                <Text style={styles.label}>Situação</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={atSituacao}
                    onValueChange={setAtSituacao}
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
                    onPress={() => setModalAtividadeVisible(false)}
                  >
                    <Text style={commonStyles.btnModalTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[commonStyles.btnModal, commonStyles.btnSalvar]} onPress={salvarAtividade}>
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
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    color: colors.textPrimary,
    backgroundColor: 'transparent',
  },
  aviso: { color: colors.textMuted, fontSize: 13, marginBottom: 12, fontStyle: 'italic' },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: colors.background,
  },
  checkboxRowSelecionado: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxMarcado: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: { color: colors.white, fontSize: 14, fontWeight: 'bold' },
  checkboxTexto: { color: colors.textPrimary, fontSize: 14, flex: 1 },
  secaoAtividades: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  secaoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  btnAddAtividade: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnAddAtividadeTexto: { color: colors.white, fontSize: 12, fontWeight: '600' },
  atividadeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  atividadeInfo: { flex: 1 },
  atividadeDescricao: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  atividadeDetalhe: { color: colors.textSecondary, fontSize: 12, marginBottom: 4 },
  atividadeAcoes: { gap: 8 },
  atividadeBtnEditar: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  atividadeBtnExcluir: { color: colors.danger, fontSize: 12, fontWeight: '600' },
});
