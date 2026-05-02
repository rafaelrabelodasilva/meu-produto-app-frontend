# 📱 Meu Produto - Frontend

A interface vibrante e amigável do **Meu Produto**, o app que transforma a organização da sua casa em uma experiência leve com a ajuda do Gatinho Organizador.

## 🚀 Sobre o Projeto

O **Meu Produto** é mais que um inventário; é o assistente pessoal da sua casa. Desenvolvido para mobile e web, o app foca em usabilidade real: você cadastra um item, tira foto da etiqueta (pra nunca mais perder o manual) e compartilha tudo com quem mora com você.

### 💡 Por que ele foi feito?

Para resolver o problema de "onde está aquele manual?" ou "será que essa airfryer cabe no nicho da cozinha?". Ele traz transparência para o que a família possui, evitando compras duplicadas e facilitando a manutenção do lar.

## ✨ Funcionalidades Principais

- **Dashboard Visual:** Grid adaptativo com cards contendo foto, nome e dimensões.
- **Cadastro Técnico:** Fluxo guiado para capturar medidas e fotos de etiquetas.
- **Colaboração Familiar:** Crie uma "Casa", convide membros e veja quem cadastrou cada item.
- **Multi-plataforma:** Experiência consistente em Android, iOS e Web (PWA).
- **Tema Customizado:** Identidade visual baseada no mascote "Gatinho Organizador".

## 🛠️ Tecnologias Utilizadas

- **React Native & Expo:** Desenvolvimento nativo multiplataforma.
- **Expo Router:** Navegação baseada em arquivos de última geração.
- **TypeScript:** Segurança e tipagem em todo o projeto.
- **AsyncStorage:** Persistência de sessão e preferências locais.
- **Context API:** Gestão de estado global (Auth, Theme, Toast).
- **Expo Image Picker:** Integração profunda com a câmera e galeria.

## 🏁 Como Iniciar (Setup do Zero)

Siga os passos abaixo para rodar o app no seu ambiente:

### 1. Requisitos
- Node.js (v18 ou superior)
- Aplicativo **Expo Go** instalado no seu celular (para teste físico)

### 2. Instalação
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/meu-produto-app-frontend.git

# Acesse a pasta
cd meu-produto-app-frontend

# Instale as dependências
npm install
```

### 3. Configuração
Certifique-se de que o backend está rodando. O app detecta automaticamente o IP da sua máquina se você estiver na mesma rede Wi-Fi. Se precisar forçar a URL:
```bash
# Crie um arquivo .env
EXPO_PUBLIC_API_URL=https://sua-api.com
```

### 4. Iniciar o App
```bash
# Inicia o servidor de desenvolvimento do Expo
npm start
```

Escaneie o QR Code que aparecer no terminal com a câmera do celular (iOS) ou pelo app Expo Go (Android).

## 📜 Comandos Úteis

| Comando | Descrição |
| :--- | :--- |
| `npm start` | Inicia o Metro Bundler do Expo |
| `npm run android` | Abre o app no emulador Android |
| `npm run ios` | Abre o app no simulador iOS (necessita macOS) |
| `npm run web` | Abre a versão web no navegador |
| `npm run lint` | Verifica erros de estilo no código |

## 👨‍💻 Autor

**Rafael Rabelo da Silva**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rafaelrabelodasilva/)

---
*Gerencie seu lar com a patinha do Gatinho Organizador 🐾*
