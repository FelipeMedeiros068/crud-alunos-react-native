# 📚 CRUD de Alunos — React Native

Aplicação mobile desenvolvida em React Native com Expo para gerenciamento completo de alunos, permitindo **Criar**, **Listar**, **Editar** e **Excluir** registros com persistência local via AsyncStorage.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

Certifique-se de ter instalado na sua máquina:

| Ferramenta | Versão mínima | Link |
|---|---|---|
| Node.js | 18.x ou superior | https://nodejs.org |
| npm ou yarn | npm 9+ / yarn 1.22+ | Vem com o Node |
| Expo CLI | Global | `npm install -g expo-cli` |
| Expo Go (celular) | Última versão | App Store / Google Play |

> **Alternativa ao celular físico:** Use um emulador Android (Android Studio) ou simulador iOS (Xcode — somente macOS).

---

### Instalação

**1. Clone o repositório:**
```bash
git clone https://github.com/FelipeMedeiros068/crud-alunos-react-native.git
cd crud-alunos-react-native
```

**2. Instale as dependências:**
```bash
npm install
```

**3. Instale a biblioteca de AsyncStorage (caso necessário):**
```bash
npx expo install @react-native-async-storage/async-storage
```

**4. Inicie o servidor de desenvolvimento:**
```bash
npx expo start
```

---

### Executando no dispositivo

Após rodar `npx expo start`, um QR Code será exibido no terminal.

- **Android:** Abra o app **Expo Go** e escaneie o QR Code.
- **iOS:** Use a câmera do iPhone para escanear o QR Code.
- **Emulador Android:** Pressione `a` no terminal.
- **Simulador iOS (macOS):** Pressione `i` no terminal.
- **Navegador Web:** Pressione `w` no terminal.

---

### Bibliotecas Necessárias

```bash
# Instaladas via npm install
expo                                         # Framework base
react                                        # Biblioteca React
react-native                                 # Framework mobile
expo-status-bar                              # Controle da status bar

# Instalar via npx expo install
@react-native-async-storage/async-storage   # Persistência local de dados
```

> ⚠️ **Importante:** Use sempre `npx expo install` para instalar pacotes compatíveis com a versão do Expo, evitando conflitos de versão.

---

## 🛠️ Tecnologias Utilizadas

### Core

| Tecnologia | Versão | Descrição |
|---|---|---|
| **React Native** | 0.73.x | Framework multiplataforma (Android e iOS) usando JavaScript/JSX |
| **React** | 18.2.0 | Biblioteca para construção de interfaces baseada em componentes e hooks |
| **Expo** | ~50.0.0 | Plataforma que facilita o desenvolvimento com toolchain integrada (build, hot reload) |

### Armazenamento

| Tecnologia | Versão | Descrição |
|---|---|---|
| **AsyncStorage** | 1.21.0 | Persistência local assíncrona, equivalente ao localStorage do browser |

### Componentes React Native

| Componente | Finalidade |
|---|---|
| `FlatList` | Renderização performática da lista de alunos |
| `Modal` | Formulário de cadastro/edição em overlay |
| `TextInput` | Campos de entrada do formulário |
| `TouchableOpacity` | Botões interativos com feedback visual |
| `SafeAreaView` | Respeita as áreas seguras do dispositivo (notch, etc.) |
| `Alert` | Diálogos de confirmação (ex: exclusão) |
| `StyleSheet` | API nativa de estilização |

### Hooks

| Hook | Finalidade |
|---|---|
| `useState` | Estado local: lista de alunos, campos do formulário, modal |
| `useEffect` | Carrega dados do AsyncStorage ao iniciar o app |

---

## 📱 Funcionalidades

- ✅ **Criar** novo aluno (nome, matrícula, curso, nota)
- ✅ **Listar** todos os alunos cadastrados
- ✅ **Editar** dados de um aluno existente
- ✅ **Excluir** aluno com confirmação via Alert
- ✅ **Persistência** de dados com AsyncStorage
- ✅ **Interface dark** com design moderno

---

## 📂 Estrutura do Projeto

```
crud-alunos-react-native/
├── App.js          # Componente principal com toda a lógica CRUD
├── app.json        # Configurações do Expo (nome, ícone, splash, etc.)
├── package.json    # Dependências e scripts do projeto
└── README.md       # Documentação
```

---

## 👤 Autor

**Felipe Medeiros**  
GitHub: [@FelipeMedeiros068](https://github.com/FelipeMedeiros068)
