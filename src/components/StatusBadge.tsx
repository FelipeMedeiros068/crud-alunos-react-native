import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/styles';

interface Props {
  situacao: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: colors.pendente },
  concluido: { label: 'Concluído', color: colors.concluido },
  concluida: { label: 'Concluída', color: colors.concluido },
  cancelado: { label: 'Cancelado', color: colors.cancelado },
  cancelada: { label: 'Cancelada', color: colors.cancelado },
};

export default function StatusBadge({ situacao }: Props) {
  const config = statusConfig[situacao] ?? { label: situacao, color: colors.textMuted };

  return (
    <View style={[styles.badge, { backgroundColor: config.color + '30' }]}>
      <Text style={[styles.texto, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  texto: {
    fontSize: 12,
    fontWeight: '600',
  },
});
