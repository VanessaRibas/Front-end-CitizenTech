document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('form-login');
  const passwordInput = document.getElementById('login-password');
  const btnTogglePassword = document.getElementById('btn-toggle-password');

  // Funcionalidade do botão SHOW / HIDE na palavra-passe
  btnTogglePassword.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      btnTogglePassword.textContent = 'HIDE';
    } else {
      passwordInput.type = 'password';
      btnTogglePassword.textContent = 'SHOW';
    }
  });

  // Submissão do Formulário
  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();

    const pcdData = JSON.parse(localStorage.getItem('userPCDData'));
    const contactData = JSON.parse(localStorage.getItem('userContactData'));
    const adminData = JSON.parse(localStorage.getItem('userAdminData'));

    if (adminData && adminData.role === 'ADMIN') {
      alert(`Bem-vindo, Agente ${adminData.name}!`);
      window.location.href = 'dashboard-admin.html';
    } else if (contactData && contactData.role === 'EMERGENCY_CONTACT') {
      alert(`Bem-vindo, ${contactData.name}!`);
      window.location.href = 'dashboard-contact.html';
    } else if (pcdData && pcdData.role === 'PCD') {
      alert(`Bem-vindo, ${pcdData.name}!`);
      window.location.href = 'dashboard-pcd.html';
    } else {
      alert('Login efetuado com sucesso!');
      window.location.href = 'dashboard-pcd.html';
    }
  });
});