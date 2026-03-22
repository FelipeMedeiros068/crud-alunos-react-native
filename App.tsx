import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  SafeAreaView,
  StatusBar,
  ListRenderItemInfo,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  curso: string;
  nota: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = '@alunos_list';

// ─── Component ────────────────────────────────────────────────────────────────

export default function App(): React.JSX.Element {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [nome, setNome] = useState<string>('');
  const [matricula, setMatricula] = useState<string>('');
  const [curso, setCurso] = useState<string>('');
  const [nota, setNota] = useState<string>('');

  useEffect(() => {
    carregarAlunos();
  }, []);

  // ── Storage ──────────────────────────────────────────────────────────────────

  const carregarAlunos = async (): Promise<void> => {
    try {
      const dados = await AsyncStorage.getItem(STORAGE_KEY);
      if (dados) setAlunos(JSON.parse(dados) as Aluno[]);
    } catch {
      Alert.alert('Erro', 'Falha ao carregar alunos.');
    }
  };

  const salvarAlunos = async (lista: Aluno[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch {
      Alert.alert('Erro', 'Falha ao salvar alunos.');
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const limparFormulario = (): void => {
    setNome('');
    setMatricula('');
    setCurso('');
    setNota('');
    setEditando(null);
  };

  const abrirModalNovo = (): void => {
    limparFormulario();
    setModalVisible(true);
  };

  const abrirModalEdicao = (aluno: Aluno): void => {
    setEditando(aluno.id);
    setNome(aluno.nome);
    setMatricula(aluno.matricula);
    setCurso(aluno.curso);
    setNota(aluno.nota);
    setModalVisible(true);
  };

  // ── CRUD ─────────────────────────────────────────────────────────────────────

  const salvarAluno = (): void => {
    if (!nome.trim() || !matricula.trim() || !curso.trim()) {
      Alert.alert('Atenção', 'Preencha nome, matrícula e curso.');
      return;
    }

    let novaLista: Aluno[];

    if (editando) {
      novaLista = alunos.map((a) =>
        a.id === editando ? { id: editando, nome, matricula, curso, nota } : a
      );
    } else {
      const novoAluno: Aluno = {
        id: Date.now().toString(),
        nome,
        matricula,
        curso,
        nota,
      };
      novaLista = [...alunos, novoAluno];
    }

    setAlunos(novaLista);
    salvarAlunos(novaLista);
    setModalVisible(false);
    limparFormulario();
  };

  const excluirAluno = (id: string): void => {
    Alert.alert('Confirmar', 'Deseja excluir este aluno?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          const novaLista = alunos.filter((a) => a.id !== id);
          setAlunos(novaLista);
          salvarAlunos(novaLista);
        },
      },
    ]);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  const renderAluno = ({ item }: ListRenderItemInfo<Aluno>): React.JSX.Element => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardNome}>{item.nome}</Text>
        <Text style={styles.cardDetalhe}>Matrícula: {item.matricula}</Text>
        <Text style={styles.cardDetalhe}>Curso: {item.curso}</Text>
        {item.nota ? (
          <Text style={styles.cardDetalhe}>Nota: {item.nota}</Text>
        ) : null}
      </View>
      <View style={styles.cardAcoes}>
        <TouchableOpacity
          style={[styles.btnAcao, styles.btnEditar]}
          onPress={() => abrirModalEdicao(item)}
        >
          <Text style={styles.btnAcaoTexto}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnAcao, styles.btnExcluir]}
          onPress={() => excluirAluno(item.id)}
        >
          <Text style={styles.btnAcaoTexto}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>📚 CRUD de Alunos</Text>
        <Text style={styles.headerSubtitulo}>{alunos.length} aluno(s) cadastrado(s)</Text>
      </View>

      {/* Lista */}
      <FlatList<Aluno>
        data={alunos}
        keyExtractor={(item) => item.id}
        renderItem={renderAluno}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Text style={styles.vazioTexto}>Nenhum aluno cadastrado.</Text>
            <Text style={styles.vazioSubTexto}>Toque no botão "+" para adicionar.</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.btnAdicionar} onPress={abrirModalNovo}>
        <Text style={styles.btnAdicionarTexto}>＋ Novo Aluno</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>
              {editando ? '✏️ Editar Aluno' : '➕ Novo Aluno'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nome completo *"
              placeholderTextColor="#888"
              value={nome}
              onChangeText={setNome}
            />
            <TextInput
              style={styles.input}
              placeholder="Matrícula *"
              placeholderTextColor="#888"
              value={matricula}
              onChangeText={setMatricula}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Curso *"
              placeholderTextColor="#888"
              value={curso}
              onChangeText={setCurso}
            />
            <TextInput
              style={styles.input}
              placeholder="Nota (opcional)"
              placeholderTextColor="#888"
              value={nota}
              onChangeText={setNota}
              keyboardType="decimal-pad"
            />

            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={[styles.btnModal, styles.btnCancelar]}
                onPress={() => {
                  setModalVisible(false);
                  limparFormulario();
                }}
              >
                <Text style={styles.btnModalTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnModal, styles.btnSalvar]}
                onPress={salvarAluno}
              >
                <Text style={styles.btnModalTexto}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  header: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  headerTitulo: { fontSize: 24, fontWeight: 'bold', color: '#e0e0ff' },
  headerSubtitulo: { fontSize: 13, color: '#888', marginTop: 4 },
  lista: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d44',
  },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: 16, fontWeight: 'bold', color: '#e0e0ff', marginBottom: 4 },
  cardDetalhe: { fontSize: 13, color: '#aaa', marginTop: 2 },
  cardAcoes: { gap: 8 },
  btnAcao: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginBottom: 4 },
  btnEditar: { backgroundColor: '#4a4a8a' },
  btnExcluir: { backgroundColor: '#8a2a2a' },
  btnAcaoTexto: { color: '#fff', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  vazio: { alignItems: 'center', marginTop: 80 },
  vazioTexto: { color: '#888', fontSize: 16 },
  vazioSubTexto: { color: '#555', fontSize: 13, marginTop: 6 },
  btnAdicionar: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#4a4aff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#4a4aff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  btnAdicionarTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2d2d44',
  },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: '#e0e0ff', marginBottom: 20 },
  input: {
    backgroundColor: '#0f0f1a',
    borderWidth: 1,
    borderColor: '#2d2d44',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#e0e0ff',
    fontSize: 14,
    marginBottom: 12,
  },
  modalBotoes: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btnModal: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  btnCancelar: { backgroundColor: '#2d2d44' },
  btnSalvar: { backgroundColor: '#4a4aff' },
  btnModalTexto: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
