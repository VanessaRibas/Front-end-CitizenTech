# 🛡️ CitizenTech — SOS Rota

Um projeto desenvolvido em **React Native (Expo + TypeScript)** focado em **mobilidade urbana inclusiva e proteção preventiva** para Pessoas com Deficiência (PCD) diante de eventos climáticos extremos e riscos urbanos (alagamentos, obstruções de calçadas/rampas, quedas de árvores e granizo).

> Projeto desenvolvido para o segundo semestre da Global Solution da faculdade FIAP, integrado à API RESTful em Java Spring Boot (`Backend-CitizenTech`).

---

## 🎯 Problema & Proposta de Valor

Durante tempestades e emergências urbanas, pessoas com mobilidade reduzida ou deficiência visual enfrentam barreiras críticas de locomoção e falta de informação acessível. O **CitizenTech** atua como uma plataforma de inteligência preventiva e resposta rápida:

1. **Prevenção Proativa:** Recalcula trajetos em tempo real antes que o usuário entre em áreas de risco.
2. **Acessibilidade Personalizada:** Adapta rotas, legendas e alertas conforme a necessidade específica do usuário (**Cadeirante / Mobilidade Reduzida** ou **Deficiência Visual**).
3. **Rede de Apoio & Resposta Integrada:** Conecta o usuário PCD aos seus contatos de confiança e ao Centro de Controle Operacional (CCO) da Defesa Civil / Bombeiros.
4. **Confiabilidade e Auditoria de Dados:** Diferencia relatos comunitários (confiança inicial de 40%) de alertas oficiais/sensores IoT (confiança de 100%).

---

## 👥 Controle de Acesso Baseado em Papéis (RBAC)

O aplicativo conta com autenticação e fluxos exclusivos para **3 perfis operacionais**:

### 1. ♿ Usuário PCD (`DashboardUserScreen.tsx`)
* **4 Rotas Seguras Dinâmicas:** *Retorno à Casa*, *Abrigo Público Acessível*, *Rede Pessoal de Apoio* e *Desvio Proativo de Risco* — cada uma com traçado vetorial SVG próprio.
* **Adaptação de Perfil:** Alternância instantânea entre modo **Cadeirante** (rotas planas, sem degraus/escadas) e **Deficiência Visual** (rotas com piso tátil e sinalização sonora).
* **Colaboração Comunitária (`+ Reportar`):** Envio rápido de ocorrências na via com publicação imediata (40% de confiança inicial) para validação posterior.
* **Botão SOS de Emergência:** Envio instantâneo de coordenadas GPS e ficha de acessibilidade para a Defesa Civil (193) e Rede de Apoio.

### 2. 🤝 Contato de Emergência / Rede de Apoio (`DashboardContactScreen.tsx`)
* **Monitoramento em Tempo Real:** Mapa vetorial de aproximação exibindo distância, nível de bateria, rota ativa e status do usuário PCD vinculado.
* **Check-in Preventivo:** Solicitação de confirmação de segurança com alerta sonoro/vibratório e escalonamento direto para resgate (193).
* **Reportar Risco & Histórico:** Registro de bloqueios próximos ao trajeto do familiar e linha do tempo completa de notificações.

### 3. 🚒 Agente Operacional / Defesa Civil (`DashboardAdminScreen.tsx`)
* **Fila de Resgate Prioritário (SOS):** Visualização de chamados críticos com ficha de acessibilidade PCD e despacho de viaturas adaptadas.
* **Gestão de Abrigos Públicos:** Controle interativo de disponibilidade e recursos (*Aberto*, *Lotado*, *Inacessível*).
* **Auditoria & Emissão de Alertas Oficiais:** Validação de relatos comunitários (elevando confiança para 100%) e disparo de alertas oficiais de nível *Crítico*, *Alto* ou *Médio*.

---

## 🛠️ Tecnologias Utilizadas

* **Framework:** React Native com Expo SDK
* **Linguagem:** TypeScript
* **Gráficos & Mapas Vetoriais:** `react-native-svg`
* **Comunicação HTTP:** Fetch API / REST JSON (com fallback automático para modo de contingência offline)
* **Backend Integrado:** Java 17+ / Spring Boot / Banco H2 (`Backend-CitizenTech`)

---

## 📂 Estrutura de Pastas

```text
Front-end-CitizenTech/
├── App.tsx                                # Gerenciador central de rotas e autenticação RBAC
├── src/
│   ├── interfaces/
│   │   └── evento.ts                      # Tipagem TypeScript dos eventos de risco
│   ├── services/
│   │   └── eventoService.ts               # Camada de integração com a API Spring Boot
│   └── screens/
│       ├── LoginScreen.tsx                # Tela de login com acesso rápido por perfil
│       ├── SelectRoleScreen.tsx           # Seleção de perfil para novo cadastro
│       ├── RegisterScreen.tsx             # Cadastro dinâmico adaptado por papel (PCD, Apoio, Admin)
│       ├── DashboardUserScreen.tsx        # Painel do Usuário PCD (Mapas, Rotas, SOS, Reporte)
│       ├── DashboardContactScreen.tsx     # Painel da Rede de Apoio (Monitoramento, Check-in, Reporte)
│       └── DashboardAdminScreen.tsx       # Painel CCO Defesa Civil (SOS, Abrigos, Auditoria, Perfil)
├── package.json
└── README.md
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* [Node.js](https://nodejs.org/) (v18 ou superior)
* Gerenciador de pacotes `npm` ou `yarn`
* Aplicativo **Expo Go** no smartphone (Android/iOS) ou emulador configurado

### Passo a passo

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/SEU-USUARIO/Front-end-CitizenTech.git](https://github.com/SEU-USUARIO/Front-end-CitizenTech.git)
   cd Front-end-CitizenTech
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   npx expo install react-native-svg
   ```

3. **Configure o endereço do Backend (opcional):**
   No arquivo `src/services/eventoService.ts`, verifique a constante `API_URL` apontando para o servidor Spring Boot (`http://localhost:8080` para Web/Emulador ou o IP local da sua máquina `http://192.168.X.X:8080` para dispositivo físico).

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npx expo start
   ```
   * Pressione **`w`** para abrir no navegador Web.
   * Pressione **`a`** para abrir no emulador Android.
   * Ou escaneie o **QR Code** com o aplicativo **Expo Go**.

---

## 🔑 Credenciais de Demonstração

Na tela de login, utilize os botões de preenchimento rápido ou insira as credenciais abaixo (qualquer senha é aceita no modo de demonstração):

| Perfil | E-mail de Acesso | Funcionalidades Principais |
| :--- | :--- | :--- |
| **Usuário PCD** | `usuario@urbanrisk.com` | 4 rotas acessíveis, mapa SVG dinâmico, SOS, reportar risco |
| **Rede de Apoio** | `apoio@urbanrisk.com` | Telemetria do familiar, mapa de distância, check-in, reportar risco |
| **Defesa Civil (Admin)** | `admin@defesacivil.gov.br` | Despacho de viaturas, gestão de abrigos, auditoria e alertas oficiais |

---

## 🔒 Qualidade de Software & LGPD

* **Resiliência (ISO/IEC 25010):** Caso a API Spring Boot esteja indisponível, o aplicativo ativa automaticamente o **Modo de Contingência Offline**, mantendo mapas, rotas e acionamentos operacionais.
* **Privacidade (LGPD):** Dados sensíveis de deficiência e geolocalização são compartilhados estritamente com contatos autorizados e órgãos de resgate em situações de emergência.
