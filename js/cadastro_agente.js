document.addEventListener('DOMContentLoaded', () => {
  const formAdmin = document.getElementById('form-admin');

  formAdmin.addEventListener('submit', (e) => {
    e.preventDefault();

    const adminData = {
      role: 'ADMIN',
      name: document.getElementById('admin-name').value,
      badge: document.getElementById('admin-badge').value,
      organization: document.getElementById('admin-org').value
    };

    localStorage.setItem('userAdminData', JSON.stringify(adminData));
    alert('Cadastro operacional realizado com sucesso!');
    window.location.href = 'dashboard-admin.html';
  });
});