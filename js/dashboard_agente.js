document.addEventListener('DOMContentLoaded', () => {
  // 1. Carrega dados do Agente salvos no cadastro (register-admin.html)
  const adminData = JSON.parse(localStorage.getItem('userAdminData'));
  const greetingEl = document.getElementById('agent-greeting');

  if (adminData && greetingEl) {
    const orgName = adminData.organization ? adminData.organization.toUpperCase() : 'DEFESA CIVIL';
    greetingEl.textContent = `Agente ${adminData.name} (Matrícula: ${adminData.badge}) • ${orgName}`;
  }

  // 2. Controle do Modal de Emissão de Alerta Oficial
  const btnEmitAlert = document.getElementById('btn-emit-alert');
  const modalAlert = document.getElementById('modal-official-alert');
  const formOfficialAlert = document.getElementById('form-official-alert');

  if (btnEmitAlert && modalAlert) {
    btnEmitAlert.addEventListener('click', () => {
      modalAlert.classList.remove('hidden');
    });
  }

  if (formOfficialAlert) {
    formOfficialAlert.addEventListener('submit', (e) => {
      e.preventDefault();

      const level = document.getElementById('alert-risk-level').value;
      const region = document.getElementById('alert-region').value;
      const instruction = document.getElementById('alert-instruction').value;

      alert(`📢 ALERTA OFICIAL DISPARADO!\n\n• Nível: ${level}\n• Região: ${region}\n• Confiança: 100% (Fonte Oficial)\n• Instrução: ${instruction}\n\nTodos os usuários PCD na área foram notificados.`);
      
      formOfficialAlert.reset();
      closeAdminModal();
    });
  }
});

// Despachar equipe de resgate para chamado SOS
function dispatchRescue(ticketId, userName) {
  const ticket = document.getElementById(ticketId);
  if (ticket) {
    ticket.classList.add('dispatched');
    const btn = ticket.querySelector('.btn-dispatch');
    btn.textContent = '✅ Viatura Adaptada a Caminho';
    btn.disabled = true;

    // Atualiza contador KPI
    const kpiSos = document.getElementById('kpi-sos');
    if (kpiSos) {
      const current = parseInt(kpiSos.textContent, 10);
      if (current > 0) kpiSos.textContent = current - 1;
    }

    alert(`🚒 Equipe de resgate adaptada despachada para atender ${userName}!`);
  }
}

// Validar ou Descartar Ocorrência Comunitária (Ciclo de Vida UML)
function validateEvent(cardId, isApproved) {
  const card = document.getElementById(cardId);
  if (!card) return;

  const kpiPending = document.getElementById('kpi-pending');
  if (kpiPending) {
    const current = parseInt(kpiPending.textContent, 10);
    if (current > 0) kpiPending.textContent = current - 1;
  }

  if (isApproved) {
    const stateBadge = card.querySelector('.state-badge');
    const confBadge = card.querySelector('.conf-badge');
    const buttonsDiv = card.querySelector('.val-buttons');

    stateBadge.className = 'state-badge confirmed';
    stateBadge.textContent = 'ESTADO: CONFIRMADO (ALERTA EMITIDO)';
    confBadge.innerHTML = 'Confiança Atual: <strong>100% (Validado)</strong>';
    buttonsDiv.innerHTML = '<small style="color: #4ade80; font-weight: bold;">✔ Publicado no mapa público com confiança máxima.</small>';
  } else {
    card.remove();
    alert('Ocorrência marcada como DESCARTADA (Falso Alarme) e removida da fila.');
  }
}

// Alterar status de abrigo público
function changeShelterStatus(selectEl) {
  const statusText = selectEl.options[selectEl.selectedIndex].text;
  alert(`Status do abrigo atualizado para: ${statusText}`);
}

function closeAdminModal() {
  document.getElementById('modal-official-alert').classList.add('hidden');
}