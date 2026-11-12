document.addEventListener('DOMContentLoaded', () => {
  // 1. Carrega os dados do usuário PCD salvos no cadastro (localStorage)
  const pcdData = JSON.parse(localStorage.getItem('userPCDData'));
  const greetingEl = document.getElementById('user-greeting');
  const homeAddrEl = document.getElementById('home-address-display');
  const safePlaceEl = document.getElementById('safe-place-display');

  if (pcdData) {
    greetingEl.textContent = `Olá, ${pcdData.name} • Perfil: Acessibilidade (${pcdData.disability.toUpperCase()})`;
    homeAddrEl.textContent = pcdData.homeAddress || 'Endereço Residencial Cadastrado';
    
    if (pcdData.safePlaces && pcdData.safePlaces.length > 0) {
      safePlaceEl.textContent = `Destino: ${pcdData.safePlaces[0].name}`;
    }
  } else {
    greetingEl.textContent = 'Modo Demonstração • Perfil: Acessibilidade Motora';
    homeAddrEl.textContent = 'Rua Exemplo, 123 - Centro';
  }

  // 2. Alternar entre os 4 Tipos de Rotas Acessíveis
  const routeButtons = document.querySelectorAll('.route-btn');
  const activeRouteLabel = document.getElementById('active-route-label');
  const routePath = document.getElementById('route-path');

  const routeConfigs = {
    casa: {
      label: 'Retorno à Residência (Sem degraus / Rampa)',
      path: 'M 30 55 Q 20 35, 15 20'
    },
    abrigo: {
      label: 'Abrigo Público Acessível (Metrô / Elevador)',
      path: 'M 30 55 Q 35 25, 75 25'
    },
    rede: {
      label: 'Rede Pessoal de Apoio (Casa de Familiar)',
      path: 'M 30 55 Q 50 80, 80 75'
    },
    desvio: {
      label: 'Desvio Proativo (Contornando Av. Paulista Alagada)',
      path: 'M 30 55 C 10 60, 40 15, 75 25'
    }
  };

  routeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      routeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const type = btn.getAttribute('data-route');
      if (activeRouteLabel && routeConfigs[type]) {
        activeRouteLabel.innerHTML = `Rota Ativa: <strong>${routeConfigs[type].label}</strong>`;
      }
      if (routePath && routeConfigs[type]) {
        routePath.setAttribute('d', routeConfigs[type].path);
      }
    });
  });

  // 3. Acessibilidade: Modo Alto Contraste (WCAG 2.1)
  const btnContrast = document.getElementById('btn-contrast');
  if (btnContrast) {
    btnContrast.addEventListener('click', () => {
      document.body.classList.toggle('high-contrast');
    });
  }

  // 4. Controle dos Modais (Reportar, Notificações, SOS)
  const btnOpenReport = document.getElementById('btn-open-report');
  if (btnOpenReport) {
    btnOpenReport.addEventListener('click', () => {
      document.getElementById('modal-report').classList.remove('hidden');
    });
  }

  const btnNotifications = document.getElementById('btn-notifications');
  if (btnNotifications) {
    btnNotifications.addEventListener('click', () => {
      document.getElementById('modal-notifications').classList.remove('hidden');
      const notifCount = document.getElementById('notif-count');
      if (notifCount) notifCount.textContent = '0';
    });
  }

  const btnSos = document.getElementById('btn-sos');
  if (btnSos) {
    btnSos.addEventListener('click', () => {
      document.getElementById('modal-sos').classList.remove('hidden');
    });
  }

  // 5. Envio de Novo Relato Comunitário (Adiciona na lista com Confiança 40%)
  const formReport = document.getElementById('form-community-report');
  const alertsList = document.getElementById('alerts-list');

  if (formReport && alertsList) {
    formReport.addEventListener('submit', (e) => {
      e.preventDefault();

      const type = document.getElementById('report-type').value;
      const location = document.getElementById('report-location').value;
      const desc = document.getElementById('report-desc').value || 'Relato enviado pela comunidade local.';

      const newAlert = document.createElement('article');
      newAlert.className = 'alert-item info';
      newAlert.innerHTML = `
        <div class="alert-top">
          <span class="risk-tag info">RECÉM REPORTADO</span>
          <span class="distance-tag">Agora mesmo</span>
        </div>
        <h3>${type} - ${location}</h3>
        <p>${desc}</p>
        <div class="trust-box">
          <div><strong>Origem:</strong> Registro Comunitário (Você)</div>
          <div class="trust-meter">
            <span>Confiança: <strong>40%</strong> (Aguardando validação)</span>
            <div class="bar"><div class="fill low" style="width: 40%;"></div></div>
          </div>
        </div>
      `;

      alertsList.prepend(newAlert);
      formReport.reset();
      closeModals();
      alert('Ocorrência registrada! Nível de confiança inicial: 40%.');
    });
  }
});

// Funções Globais (chamadas pelos atributos onclick do HTML)
function closeModals() {
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

function triggerSOS(level) {
  if (level === 'REDE') {
    alert('📲 SMS/Push enviado para sua Rede de Apoio com sua localização em tempo real!');
  } else {
    alert('🚨 CHAMADO CRÍTICO ENVIADO! Defesa Civil e Corpo de Bombeiros (193) receberam seu GPS e sua Ficha de Acessibilidade PCD.');
  }
  closeModals();
}

function showAlertDetails(tipo) {
  if (tipo === 'alagamento') {
    alert('Detalhes do Alerta:\n• Evento: Alagamento Severo\n• Origem: Sensor IoT #402 / Defesa Civil\n• Nível de Confiança: 98%\n• Ação: Rota desviada automaticamente.');
  } else {
    alert('Detalhes do Alerta:\n• Evento: Risco de Granizo\n• Origem: Comunidade (4 relatos confirmados)\n• Nível de Confiança: 75%');
  }
}