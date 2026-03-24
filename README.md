# Controle de Trabalhos Escolares — React Native

Aplicacao mobile desenvolvida em **React Native + TypeScript + Expo** para controlar o desenvolvimento de trabalhos escolares. Permite gerenciar alunos, trabalhos, atividades, acompanhar progresso e visualizar graficos de andamento.

Todos os dados sao persistidos localmente no dispositivo usando **SQLite**.

---

## Como Rodar

### Pre-requisitos

| Ferramenta | Versao minima | Link |
|---|---|---|
| Node.js | 18.x+ | https://nodejs.org |
| npm | 9+ | Vem com o Node |
| Expo Go (celular) | Ultima versao | App Store / Google Play |
| Watchman (macOS) | Ultima | `brew install watchman` |

### Instalacao

```bash
git clone <url-do-repositorio>
cd crud-alunos-react-native
npm install
npx expo start
```

### Executando no dispositivo

Apos `npx expo start`, um QR Code aparece no terminal:

- **Android**: Abra o Expo Go e escaneie o QR Code
- **iOS**: Use a camera do iPhone para escanear
- **Emulador Android**: Pressione `a` no terminal
- **Simulador iOS (macOS)**: Pressione `i` no terminal

---

## Tecnologias e Dependencias

### Core

| Tecnologia | Versao | Finalidade |
|---|---|---|
| React Native | 0.73.x | Framework mobile multiplataforma |
| React | 18.2.0 | Biblioteca de UI baseada em componentes |
| TypeScript | ^5.3.0 | Tipagem estatica em todo o projeto |
| Expo | ~50.0.0 | Toolchain de desenvolvimento (build, hot reload, bundling) |

### Banco de Dados

| Tecnologia | Versao | Finalidade |
|---|---|---|
| expo-sqlite | ~13.4.0 | Banco SQLite embarcado no dispositivo. Nao precisa de servidor |

### Navegacao

| Tecnologia | Versao | Finalidade |
|---|---|---|
| @react-navigation/native | ^6.1.18 | Container de navegacao |
| @react-navigation/bottom-tabs | ^6.6.1 | Navegacao por abas inferiores |
| react-native-screens | ~3.29.0 | Otimizacao de telas nativas |
| react-native-safe-area-context | 4.8.2 | Respeita areas seguras (notch, barra) |

### UI e Formularios

| Tecnologia | Versao | Finalidade |
|---|---|---|
| @react-native-picker/picker | 2.6.1 | Componente Picker (selects/dropdowns) |
| @react-native-community/datetimepicker | 7.7.0 | Seletor de data nativo |
| @expo/vector-icons | (incluso) | Icones Ionicons nas abas |

### Graficos

| Tecnologia | Versao | Finalidade |
|---|---|---|
| react-native-gifted-charts | ^1.4.76 | Graficos de barras agrupadas |
| react-native-svg | 14.1.0 | Renderizacao SVG (dep. do gifted-charts) |
| react-native-linear-gradient | ^2.8.3 | Gradientes (dep. do gifted-charts) |

---

## Estrutura do Projeto

```
crud-alunos-react-native/
├── App.tsx                         # Ponto de entrada: inicializa banco + navegacao
├── app.json                        # Configuracao do Expo
├── package.json                    # Dependencias e scripts
├── tsconfig.json                   # Configuracao TypeScript (paths @/* -> ./src/*)
├── .gitignore                      # Arquivos ignorados pelo Git
├── README.md                       # Esta documentacao
└── src/
    ├── types/
    │   └── index.ts                # Todas as interfaces TypeScript
    ├── database/
    │   ├── connection.ts           # Conexao SQLite singleton + helpers
    │   ├── schema.ts               # Criacao das tabelas (DDL)
    │   ├── alunoRepository.ts      # CRUD da tabela alunos
    │   ├── trabalhoRepository.ts   # CRUD da tabela trabalhos + juncao N:N
    │   └── atividadeRepository.ts  # CRUD da tabela atividades
    ├── theme/
    │   └── styles.ts               # Cores e estilos compartilhados
    ├── components/
    │   ├── AlunoCard.tsx           # Card de aluno na listagem
    │   ├── TrabalhoCard.tsx        # Card de trabalho na listagem
    │   ├── AtividadeItem.tsx       # Item de atividade com barra de progresso
    │   ├── StatusBadge.tsx         # Badge colorido de situacao
    │   └── EmptyState.tsx          # Componente de lista vazia
    ├── screens/
    │   ├── AlunosScreen.tsx        # Tela CRUD de alunos
    │   ├── TrabalhosScreen.tsx     # Tela CRUD de trabalhos + atividades
    │   ├── ProgressoScreen.tsx     # Tela de andamento das atividades
    │   └── GraficosScreen.tsx      # Tela de graficos e estatisticas
    └── navigation/
        └── TabNavigator.tsx        # Configuracao das 4 abas inferiores
```

---

## Arquitetura e Organizacao do Codigo

### Padrao de Camadas

O projeto segue uma separacao em camadas:

```
Screens (UI) → Repositories (dados) → SQLite (persistencia)
```

- **Screens**: Componentes de tela que gerenciam estado local e interacao do usuario
- **Repositories**: Funcoes puras que encapsulam queries SQL. Nenhuma tela executa SQL diretamente
- **Database**: Camada de conexao e schema. Inicializada uma unica vez no App.tsx

### Path Aliases

O `tsconfig.json` configura `@/*` para apontar a `./src/*`, permitindo imports limpos:

```typescript
import { Aluno } from '@/types';
import * as alunoRepo from '@/database/alunoRepository';
import { colors } from '@/theme/styles';
```

---

## Banco de Dados SQLite

### Diagrama de Tabelas

```
┌────────────┐       ┌──────────────────┐       ┌────────────┐
│   alunos   │       │  trabalho_alunos │       │  trabalhos  │
├────────────┤       ├──────────────────┤       ├────────────┤
│ id (PK)    │◄──────│ aluno_id (FK)    │       │ id (PK)    │
│ nome       │       │ trabalho_id (FK) │──────►│ nome       │
│ matricula  │       └──────────────────┘       │ data_entrega│
│ curso      │                                   │ estimativa_horas│
│ nota       │       ┌──────────────────┐       │ situacao   │
│            │       │   atividades     │       └────────────┘
│            │       ├──────────────────┤            ▲
│            │◄──────│ aluno_responsavel│            │
│            │       │ trabalho_id (FK) │────────────┘
│            │       │ descricao        │
│            │       │ situacao         │
│            │       │ estimativa_horas │
│            │       │ horas_trabalhadas│
└────────────┘       └──────────────────┘
```

### Tabelas

**alunos** — Cadastro de estudantes
| Coluna | Tipo | Restricao |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| nome | TEXT | NOT NULL |
| matricula | TEXT | NOT NULL, UNIQUE |
| curso | TEXT | NOT NULL |
| nota | TEXT | Opcional |

**trabalhos** — Trabalhos/atividades escolares
| Coluna | Tipo | Restricao |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| nome | TEXT | NOT NULL |
| data_entrega | TEXT | NOT NULL (formato YYYY-MM-DD) |
| estimativa_horas | REAL | NOT NULL, DEFAULT 0 |
| situacao | TEXT | CHECK ('pendente', 'concluido', 'cancelado') |

**trabalho_alunos** — Relacao N:N entre trabalhos e alunos
| Coluna | Tipo | Restricao |
|---|---|---|
| trabalho_id | INTEGER | FK → trabalhos(id), ON DELETE CASCADE |
| aluno_id | INTEGER | FK → alunos(id), ON DELETE CASCADE |
| | | PRIMARY KEY (trabalho_id, aluno_id) |

**atividades** — Tarefas dentro de um trabalho
| Coluna | Tipo | Restricao |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| trabalho_id | INTEGER | FK → trabalhos(id), ON DELETE CASCADE |
| descricao | TEXT | NOT NULL |
| aluno_responsavel | INTEGER | FK → alunos(id), ON DELETE RESTRICT |
| situacao | TEXT | CHECK ('pendente', 'concluida', 'cancelada') |
| estimativa_horas | REAL | NOT NULL, DEFAULT 0 |
| horas_trabalhadas | REAL | NOT NULL, DEFAULT 0 |

### Regras de Integridade

- **CASCADE**: Deletar um trabalho remove automaticamente seus vinculos em `trabalho_alunos` e suas atividades
- **RESTRICT**: Nao e possivel deletar um aluno que e responsavel por uma atividade. E necessario remover ou reatribuir a atividade primeiro
- **PRAGMA foreign_keys = ON**: Executado a cada abertura de conexao para garantir que as foreign keys sejam respeitadas

---

## Descricao Detalhada de Cada Arquivo

### `App.tsx` — Ponto de Entrada

Responsabilidades:
- Inicializa o banco SQLite chamando `initializeDatabase()` no `useEffect`
- Exibe tela de carregamento (ActivityIndicator) enquanto o banco nao esta pronto
- Exibe mensagem de erro se a inicializacao falhar
- Renderiza o `NavigationContainer` com o `TabNavigator` quando o banco esta pronto

### `src/types/index.ts` — Interfaces TypeScript

Define todas as interfaces do projeto:
- `Aluno`: campos id, nome, matricula, curso, nota
- `Trabalho`: campos id, nome, data_entrega, estimativa_horas, situacao
- `TrabalhoComDetalhes`: estende Trabalho com lista de alunos e contagem de atividades
- `Atividade`: campos id, trabalho_id, descricao, aluno_responsavel, situacao, estimativa_horas, horas_trabalhadas
- `AtividadeComAluno`: estende Atividade com o nome do aluno (resultado de JOIN)
- Types utilitarios: `SituacaoTrabalho`, `SituacaoAtividade`, `AlunoInput`, `TrabalhoInput`, `AtividadeInput`

### `src/database/connection.ts` — Conexao SQLite

- Abre o banco `escola.db` usando `SQLite.openDatabase()`
- Exporta `executeSql()`: wrapper que transforma a API de callback do SQLite em Promise
- Exporta `executeSqlBatch()`: executa multiplos statements em uma unica transacao
- O banco e um singleton — a mesma instancia e usada em toda a aplicacao

### `src/database/schema.ts` — Schema e Inicializacao

- `initializeDatabase()`: executa `PRAGMA foreign_keys = ON` e cria as 4 tabelas com `CREATE TABLE IF NOT EXISTS`
- Todas as tabelas sao criadas em uma unica transacao via `executeSqlBatch()`
- Idempotente — pode ser chamado multiplas vezes sem efeito colateral

### `src/database/alunoRepository.ts` — Repository de Alunos

Funcoes:
- `getAll()`: retorna todos os alunos ordenados por nome
- `getById(id)`: retorna um aluno pelo ID ou null
- `create(input)`: insere novo aluno e retorna o ID gerado
- `update(id, input)`: atualiza todos os campos do aluno
- `remove(id)`: verifica dependencias (atividades e trabalhos) antes de excluir. Se o aluno e responsavel por alguma atividade, lanca erro com mensagem descritiva

### `src/database/trabalhoRepository.ts` — Repository de Trabalhos

Funcoes:
- `getAll()`: retorna todos os trabalhos com contagem de alunos e atividades (subqueries)
- `getById(id)`: retorna trabalho com detalhes
- `getAlunos(trabalhoId)`: retorna alunos vinculados via tabela de juncao
- `create(input, alunoIds)`: insere trabalho + vinculos na tabela `trabalho_alunos`
- `update(id, input, alunoIds)`: atualiza trabalho e recria vinculos (delete + insert)
- `remove(id)`: deleta trabalho (CASCADE cuida das dependencias)

### `src/database/atividadeRepository.ts` — Repository de Atividades

Funcoes:
- `getByTrabalho(trabalhoId)`: retorna atividades com JOIN no nome do aluno responsavel
- `create(input)`: insere nova atividade
- `update(id, input)`: atualiza campos parciais (aceita Partial, monta query dinamicamente)
- `updateProgress(id, horas, situacao)`: atualiza apenas horas_trabalhadas e situacao (usado na tela Progresso)
- `remove(id)`: exclui atividade

### `src/theme/styles.ts` — Tema e Estilos

Define o tema visual do app inteiro:
- `colors`: paleta de cores (background, surface, border, primary, danger, status colors)
- `commonStyles`: StyleSheet compartilhado com estilos reutilizaveis (container, header, card, input, modal, fab, empty state)
- Todas as telas importam daqui para manter consistencia visual

Paleta de cores:
| Cor | Hex | Uso |
|---|---|---|
| background | #0f0f1a | Fundo geral |
| surface | #1a1a2e | Cards e headers |
| border | #2d2d44 | Bordas |
| primary | #4a4aff | Botoes e destaques |
| pendente | #e6a817 | Badge pendente (amarelo) |
| concluido | #2da84f | Badge concluido (verde) |
| cancelado | #8a2a2a | Badge cancelado (vermelho) |

### `src/navigation/TabNavigator.tsx` — Navegacao por Abas

Configura 4 abas usando `createBottomTabNavigator()`:
1. **Alunos** (icone: `people`) → AlunosScreen
2. **Trabalhos** (icone: `clipboard`) → TrabalhosScreen
3. **Progresso** (icone: `checkmark-circle`) → ProgressoScreen
4. **Graficos** (icone: `bar-chart`) → GraficosScreen

Estilizacao da tab bar: fundo escuro, borda superior, icones Ionicons, cor ativa azul.

### `src/screens/AlunosScreen.tsx` — Tela CRUD de Alunos

Funcionalidades:
- Lista de alunos em `FlatList` com `AlunoCard`
- Botao FAB "Novo Aluno" abre modal de criacao
- Modal com campos: nome*, matricula*, curso*, nota (opcional)
- Edicao via botao "Editar" no card
- Exclusao com confirmacao via Alert e verificacao de dependencias
- `useFocusEffect` recarrega dados ao voltar para a aba
- `KeyboardAvoidingView` para formulario nao ficar atras do teclado

### `src/screens/TrabalhosScreen.tsx` — Tela CRUD de Trabalhos

Funcionalidades:
- Lista de trabalhos em `FlatList` com `TrabalhoCard`
- Modal de criacao/edicao com `ScrollView` (formulario grande):
  - Nome do trabalho
  - Data de entrega (DateTimePicker nativo)
  - Estimativa de horas
  - Situacao (Picker: pendente/concluido/cancelado)
  - Multi-select de alunos (checkboxes visuais)
- **Gestao de atividades** (apenas em edicao):
  - Secao expansivel listando atividades do trabalho
  - Botao "+ Atividade" abre segundo modal
  - Modal de atividade: descricao, aluno responsavel (Picker filtrado aos alunos do trabalho), estimativa horas, situacao
  - Editar e excluir atividades inline
- Exclusao de trabalho com confirmacao (CASCADE remove atividades)

### `src/screens/ProgressoScreen.tsx` — Tela de Andamento

Funcionalidades:
- Picker no topo para selecionar um trabalho
- Resumo do trabalho: total de horas estimadas vs trabalhadas com barra de progresso e percentual
- Lista de atividades como `AtividadeItem` (tocavel)
- Ao tocar, abre modal de edicao de progresso:
  - Campo de horas trabalhadas (numerico)
  - Picker de situacao (pendente/concluida/cancelada)
- Atualizacao salva direto no SQLite

### `src/screens/GraficosScreen.tsx` — Tela de Graficos

Funcionalidades:
- Picker para selecionar trabalho
- **Card Resumo**:
  - Horas estimadas vs trabalhadas
  - Progresso geral em percentual com barra
  - Contagem de atividades concluidas
- **Grafico de barras agrupadas** (react-native-gifted-charts):
  - Barras azuis = horas estimadas por atividade
  - Barras verdes = horas trabalhadas por atividade
  - Legenda visual
  - Labels truncados para caber no grafico
- **Card Detalhamento**:
  - Lista cada atividade com nome, responsavel, horas, percentual e mini barra de progresso
  - Badge de situacao por atividade

### `src/components/AlunoCard.tsx`

Card visual para exibir um aluno na listagem. Props: aluno, onEditar, onExcluir. Mostra nome, matricula, curso, nota (se houver), botoes Editar/Excluir.

### `src/components/TrabalhoCard.tsx`

Card visual para exibir um trabalho. Mostra nome, data formatada (DD/MM/AAAA), StatusBadge da situacao, contagem de alunos e atividades, botoes Editar/Excluir.

### `src/components/AtividadeItem.tsx`

Item tocavel que mostra uma atividade. Exibe descricao, nome do aluno responsavel, StatusBadge, horas (trabalhadas/estimadas), percentual e barra de progresso visual.

### `src/components/StatusBadge.tsx`

Badge reutilizavel que renderiza a situacao com cor correspondente:
- Pendente → amarelo (#e6a817)
- Concluido/Concluida → verde (#2da84f)
- Cancelado/Cancelada → vermelho (#8a2a2a)

Aceita tanto genero masculino quanto feminino (concluido/concluida).

### `src/components/EmptyState.tsx`

Componente simples para estados de lista vazia. Recebe texto principal e subtexto opcional. Usado em todas as telas quando nao ha dados.

---

## Logica e Fluxos Principais

### Inicializacao do App

```
App.tsx monta → useEffect dispara → initializeDatabase()
  → PRAGMA foreign_keys = ON
  → CREATE TABLE IF NOT EXISTS (4 tabelas)
  → setDbReady(true) → renderiza NavigationContainer + TabNavigator
```

### CRUD de Alunos

```
AlunosScreen monta → useFocusEffect → alunoRepo.getAll() → setAlunos()
Criar: FAB → Modal → preencher campos → salvarAluno() → alunoRepo.create() → recarregar lista
Editar: Card "Editar" → Modal pre-preenchido → salvarAluno() → alunoRepo.update() → recarregar
Excluir: Card "Excluir" → Alert confirma → alunoRepo.remove() → verifica deps → deleta → recarregar
```

### CRUD de Trabalhos

```
TrabalhosScreen monta → useFocusEffect → trabalhoRepo.getAll() + alunoRepo.getAll()
Criar: FAB → Modal → nome, data, horas, situacao, selecionar alunos → salvarTrabalho() → trabalhoRepo.create(input, alunoIds)
Editar: Card "Editar" → Modal pre-preenchido + carrega atividades → editar campos / adicionar atividades → salvarTrabalho()
Atividades: Botao "+ Atividade" dentro do modal → segundo modal → atividadeRepo.create() → recarregar lista de atividades
```

### Atualizacao de Progresso

```
ProgressoScreen → Picker seleciona trabalho → atividadeRepo.getByTrabalho() → lista atividades
Tocar atividade → Modal mostra info + campos editaveis (horas, situacao)
Salvar → atividadeRepo.updateProgress() → recarregar atividades
```

### Visualizacao de Graficos

```
GraficosScreen → Picker seleciona trabalho → atividadeRepo.getByTrabalho()
Calcula: totalEstimado, totalTrabalhado, percentualGeral, atividadesConcluidas
Renderiza: Card resumo + BarChart agrupado + Card detalhamento por atividade
```

### Sincronizacao entre Telas

Todas as telas usam `useFocusEffect` do React Navigation. Quando o usuario troca de aba, os dados sao recarregados do SQLite. Isso garante que:
- Criar um aluno na aba "Alunos" faz ele aparecer imediatamente na selecao da aba "Trabalhos"
- Atualizar progresso na aba "Progresso" reflete nos graficos da aba "Graficos"

---

## Funcionalidades Completas

- CRUD de alunos (nome, matricula, curso, nota)
- CRUD de trabalhos (nome, data entrega, estimativa horas, situacao)
- Relacao N:N entre trabalhos e alunos (multi-select com checkboxes)
- CRUD de atividades dentro de cada trabalho (descricao, aluno responsavel, estimativa, situacao)
- Aluno responsavel filtrado apenas aos alunos vinculados ao trabalho
- Tela de progresso com edicao de horas trabalhadas e situacao por atividade
- Graficos de barras agrupadas (estimativa vs trabalhado) por atividade
- Resumo percentual do trabalho (horas e atividades concluidas)
- Verificacao de dependencias ao excluir aluno (impede exclusao se responsavel por atividade)
- Exclusao em cascata de trabalhos (remove atividades e vinculos automaticamente)
- Persistencia local com SQLite (dados sobrevivem ao fechar o app)
- Interface dark theme consistente em todas as telas
- Navegacao por abas com icones
- Formularios com ScrollView e KeyboardAvoidingView
- Tipagem estatica completa com TypeScript
