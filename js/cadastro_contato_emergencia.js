document.addEventListener('DOMContentLoaded', () => {
  const formContact = document.getElementById('form-contact');

  formContact.addEventListener('submit', (e) => {
    e.preventDefault();

    const contactData = {
      role: 'EMERGENCY_CONTACT',
      name: document.getElementById('contact-name').value,
      phone: document.getElementById('contact-phone-reg').value,
      linkedPCD: document.getElementById('pcd-linked').value
    };

    localStorage.setItem('userContactData', JSON.stringify(contactData));
    alert('Cadastro da Rede de Apoio realizado com sucesso!');
    window.location.href = 'dashboard-contact.html';
  });
});