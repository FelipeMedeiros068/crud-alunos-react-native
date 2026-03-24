import { StyleSheet } from 'react-native';

// ─── Cores ───────────────────────────────────────────────────────────────────

export const colors = {
  background: '#0f0f1a',
  surface: '#1a1a2e',
  border: '#2d2d44',
  primary: '#4a4aff',
  edit: '#4a4a8a',
  danger: '#8a2a2a',
  textPrimary: '#e0e0ff',
  textSecondary: '#aaa',
  textMuted: '#888',
  textDim: '#555',
  white: '#fff',
  overlay: 'rgba(0,0,0,0.7)',
  // Status
  pendente: '#e6a817',
  concluido: '#2da84f',
  cancelado: '#8a2a2a',
};

// ─── Estilos comuns ──────────────────────────────────────────────────────────

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerSubtitulo: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  lista: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '90%',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  modalBotoes: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  btnModal: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnCancelar: {
    backgroundColor: colors.border,
  },
  btnSalvar: {
    backgroundColor: colors.primary,
  },
  btnModalTexto: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabTexto: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  vazio: {
    alignItems: 'center',
    marginTop: 80,
  },
  vazioTexto: {
    color: colors.textMuted,
    fontSize: 16,
  },
  vazioSubTexto: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: 6,
  },
});
