import React from 'react';
import { View, Text } from 'react-native';
import { commonStyles } from '@/theme/styles';

interface Props {
  texto: string;
  subTexto?: string;
}

export default function EmptyState({ texto, subTexto }: Props) {
  return (
    <View style={commonStyles.vazio}>
      <Text style={commonStyles.vazioTexto}>{texto}</Text>
      {subTexto && <Text style={commonStyles.vazioSubTexto}>{subTexto}</Text>}
    </View>
  );
}
