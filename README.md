# 📱 Meu Produto - Frontend

A interface vibrante e amigável do **Meu Produto**, o app que transforma a organização da sua casa em uma experiência leve com a ajuda do Gatinho Organizador.

## 🚀 Sobre o Projeto

O **Meu Produto** é o assistente essencial para a gestão do seu espaço. Desenvolvido para mobile e web, o app foca em usabilidade real: você registra as dimensões precisas de cada item, guarda fotos de etiquetas técnicas para consulta rápida e compartilha tudo com sua família — para que você nunca mais tenha dúvidas se aquele novo móvel ou eletrodoméstico caberá no seu lar.

### 💡 Por que ele foi feito?

Para resolver o dilema do "será que cabe?". Quantas vezes você esteve em uma loja e não lembrou se um novo eletrodoméstico caberia no nicho da cozinha, ou se um tapete serviria na sala? O **Meu Produto** elimina o "acho que sim" da equação, fornecendo dados técnicos reais na palma da sua mão, facilitando decisões de compra e reformas.

## ✨ Funcionalidades Principais

- **Dashboard Visual:** Grid adaptativo com cards contendo foto, nome e dimensões principais sempre visíveis.
- **Cadastro Técnico de Medidas:** Fluxo otimizado com teclado numérico para registrar Altura, Largura e Profundidade com precisão.
- **Registro de Etiquetas:** Capture fotos de etiquetas técnicas para ter acesso rápido a modelos e especificações sem precisar mover móveis pesados.
- **Colaboração Familiar:** Uma "Casa" compartilhada onde todos têm acesso às medidas do lar, evitando compras duplicadas ou incompatíveis.
- **Multi-plataforma:** Experiência consistente em Android, iOS e Web (PWA).

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
*Gerencie seu lar com o Gatinho Organizador 🐾 🐱*
