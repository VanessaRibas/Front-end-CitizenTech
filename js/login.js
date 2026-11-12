document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('form-login');
  const passwordInput = document.getElementById('login-password');
  const btnTogglePassword = document.getElementById('btn-toggle-password');

  // 1. Alternar visualização da senha (SHOW / HIDE)
  if (btnTogglePassword && passwordInput) {
    btnTogglePassword.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        btnTogglePassword.textContent = 'HIDE';
      } else {
        passwordInput.type = 'password';
        btnTogglePassword.textContent = 'SHOW';
      }
    });
  }

  // 2. Redirecionamento direto ao clicar em Sign in / Conectar
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      window.location.href = '/../dashboard_usuario.html';
    });
  }
});