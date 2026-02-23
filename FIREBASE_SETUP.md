# 🔥 Configuração do Firebase

## ✅ Firebase Configurado!

As credenciais já foram inseridas no arquivo `src/lib/firebaseconfig.ts`.

---

## 📋 Próximos Passos no Console do Firebase

### 1️⃣ Ativar Autenticação

1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Selecione o projeto **fernando-c64ea**
3. No menu lateral, clique em **Authentication**
4. Clique em **Get Started** (ou **Começar**)
5. Na aba **Sign-in method**, clique em **Email/Password**
6. **Ative** o provedor Email/Password
7. Clique em **Salvar**

---

### 2️⃣ Criar Database Firestore

1. No menu lateral, clique em **Firestore Database**
2. Clique em **Create database** (ou **Criar banco de dados**)
3. Escolha **Start in test mode** (modo de teste) - TEMPORÁRIO
4. Selecione a localização: **southamerica-east1** (São Paulo) ou mais próxima
5. Clique em **Enable**

---

### 3️⃣ Configurar Regras de Segurança

**IMPORTANTE**: As regras de teste expiram em 30 dias!

#### Aplicar regras de produção:

1. No Firestore Database, clique na aba **Rules** (Regras)
2. Copie e cole o conteúdo do arquivo `firestore.rules` (na raiz do projeto)
3. Clique em **Publish** (Publicar)

**Ou copie e cole isto:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Isso permite leitura/escrita apenas para usuários autenticados.

---

### 4️⃣ Criar Primeiro Usuário

#### Opção A: Pelo Console

1. Em **Authentication** → aba **Users**
2. Clique em **Add user** (Adicionar usuário)
3. Digite:
   - **Email**: seu@email.com
   - **Password**: sua-senha-segura
4. Clique em **Add user**

#### Opção B: Pela aplicação

1. Inicie o projeto: `npm run dev`
2. Acesse `/register`
3. Preencha o formulário de registro
4. Faça login

---

### 5️⃣ (Opcional) Criar Índices

Se aparecer erros de índice ao usar filtros complexos, o Firebase mostrará um link automático para criar o índice necessário.

---

## 🧪 Testar Conexão

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Abra o navegador em `http://localhost:5173`

3. Vá para `/register` e crie uma conta

4. Faça login

5. Se tudo funcionar, está conectado! 🎉

---

## ⚠️ Verificações

### ✅ Checklist:

- [ ] Authentication está ativo
- [ ] Firestore Database está criado
- [ ] Regras de segurança foram configuradas
- [ ] Primeiro usuário foi criado
- [ ] Login funciona na aplicação
- [ ] Dados são salvos no Firestore

---

## 🔒 Segurança

### Regras Atuais:

As regras configuradas permitem:
- ✅ Leitura/escrita apenas para usuários autenticados
- ❌ Acesso negado para usuários não autenticados
- ✅ Cada usuário só pode editar seu próprio perfil

### Para produção:

Considere adicionar regras mais específicas baseadas em roles (admin, user, etc).

---

## 📊 Estrutura das Collections

O sistema criará automaticamente estas collections:

```
fernando-c64ea (Firestore)
├── users/               # Usuários do sistema
├── clients/             # Clientes cadastrados
├── sales/               # Vendas realizadas
├── installations/       # Instalações agendadas/concluídas
├── occurrences/         # Ocorrências/suporte
├── stock/               # Controle de estoque
├── logistics/           # Logística e entregas
├── technicians/         # Técnicos cadastrados
└── reports/             # Relatórios gerados
```

Não precisa criar nada manualmente, elas serão criadas automaticamente quando você cadastrar o primeiro item de cada tipo.

---

## 🐛 Problemas Comuns

### Erro: "Missing or insufficient permissions"

**Solução**: Configure as regras de segurança no Firestore (Passo 3)

### Erro: "Firebase: Error (auth/email-already-in-use)"

**Solução**: O email já está cadastrado. Use outro ou faça login.

### Erro: "Firebase: Error (auth/wrong-password)"

**Solução**: Senha incorreta. Tente novamente ou redefina a senha.

### Erro: "Firebase: Error (auth/user-not-found)"

**Solução**: Usuário não existe. Crie uma conta primeiro em `/register`.

---

## 📞 Suporte

Se tiver problemas:
1. Verifique o console do navegador (F12)
2. Verifique o console do Firebase
3. Confirme que seguiu todos os passos acima
4. Verifique se as regras estão corretas

---

## 🎉 Pronto!

Agora seu sistema está conectado ao Firebase real e pronto para usar em produção!

**Próximo passo**: Comece a usar o sistema e os dados serão salvos automaticamente no Firebase.
