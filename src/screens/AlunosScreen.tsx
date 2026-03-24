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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Aluno } from '@/types';
import * as alunoRepo from '@/database/alunoRepository';
import { colors, commonStyles } from '@/theme/styles';
import AlunoCard from '@/components/AlunoCard';
import EmptyState from '@/components/EmptyState';

export default function AlunosScreen() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [curso, setCurso] = useState('');
  const [nota, setNota] = useState('');

  const carregarAlunos = useCallback(async () => {
    try {
      const lista = await alunoRepo.getAll();
      setAlunos(lista);
    } catch {
      Alert.alert('Erro', 'Falha ao carregar alunos.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarAlunos();
    }, [carregarAlunos])
  );

  const limparFormulario = () => {
    setNome('');
    setMatricula('');
    setCurso('');
    setNota('');
    setEditando(null);
  };

  const abrirModalNovo = () => {
    limparFormulario();
    setModalVisible(true);
  };

  const abrirModalEdicao = (aluno: Aluno) => {
    setEditando(aluno.id);
    setNome(aluno.nome);
    setMatricula(aluno.matricula);
    setCurso(aluno.curso);
    setNota(aluno.nota ?? '');
    setModalVisible(true);
  };

  const salvarAluno = async () => {
    if (!nome.trim() || !matricula.trim() || !curso.trim()) {
      Alert.alert('Atenção', 'Preencha nome, matrícula e curso.');
      return;
    }

    try {
      const input = { nome: nome.trim(), matricula: matricula.trim(), curso: curso.trim(), nota: nota.trim() || null };

      if (editando) {
        await alunoRepo.update(editando, input);
      } else {
        await alunoRepo.create(input);
      }

      setModalVisible(false);
      limparFormulario();
      await carregarAlunos();
    } catch (error: any) {
      Alert.alert('Erro', error?.message ?? 'Falha ao salvar aluno.');
    }
  };

  const excluirAluno = (id: number) => {
    Alert.alert('Confirmar', 'Deseja excluir este aluno?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await alunoRepo.remove(id);
            await carregarAlunos();
          } catch (error: any) {
            Alert.alert('Erro', error?.message ?? 'Falha ao excluir aluno.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surface} />

      <View style={commonStyles.header}>
        <Text style={commonStyles.headerTitulo}>Alunos</Text>
        <Text style={commonStyles.headerSubtitulo}>{alunos.length} aluno(s) cadastrado(s)</Text>
      </View>

      <FlatList<Aluno>
        data={alunos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AlunoCard aluno={item} onEditar={abrirModalEdicao} onExcluir={excluirAluno} />
        )}
        contentContainerStyle={commonStyles.lista}
        ListEmptyComponent={
          <EmptyState texto="Nenhum aluno cadastrado." subTexto='Toque no botão "+" para adicionar.' />
        }
      />

      <TouchableOpacity style={commonStyles.fab} onPress={abrirModalNovo}>
        <Text style={commonStyles.fabTexto}>+ Novo Aluno</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={commonStyles.modalOverlay}>
            <View style={commonStyles.modalContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={commonStyles.modalTitulo}>
                  {editando ? 'Editar Aluno' : 'Novo Aluno'}
                </Text>

                <TextInput
                  style={commonStyles.input}
                  placeholder="Nome completo *"
                  placeholderTextColor={colors.textMuted}
                  value={nome}
                  onChangeText={setNome}
                />
                <TextInput
                  style={commonStyles.input}
                  placeholder="Matrícula *"
                  placeholderTextColor={colors.textMuted}
                  value={matricula}
                  onChangeText={setMatricula}
                  keyboardType="numeric"
                />
                <TextInput
                  style={commonStyles.input}
                  placeholder="Curso *"
                  placeholderTextColor={colors.textMuted}
                  value={curso}
                  onChangeText={setCurso}
                />
                <TextInput
                  style={commonStyles.input}
                  placeholder="Nota (opcional)"
                  placeholderTextColor={colors.textMuted}
                  value={nota}
                  onChangeText={setNota}
                  keyboardType="decimal-pad"
                />

                <View style={commonStyles.modalBotoes}>
                  <TouchableOpacity
                    style={[commonStyles.btnModal, commonStyles.btnCancelar]}
                    onPress={() => {
                      setModalVisible(false);
                      limparFormulario();
                    }}
                  >
                    <Text style={commonStyles.btnModalTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[commonStyles.btnModal, commonStyles.btnSalvar]} onPress={salvarAluno}>
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
