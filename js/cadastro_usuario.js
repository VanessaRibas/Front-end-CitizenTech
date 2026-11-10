document.addEventListener('DOMContentLoaded', () => {
  const placesList = document.getElementById('places-list');
  const btnAddPlace = document.getElementById('btn-add-place');
  const formPCD = document.getElementById('form-pcd');

  const safePlaces = [];

  // Lógica do botão "+ Cadastrar Mais Locais"
  btnAddPlace.addEventListener('click', () => {
    const nameInput = document.getElementById('place-name');
    const addressInput = document.getElementById('place-address');

    const name = nameInput.value.trim();
    const address = addressInput.value.trim();

    if (name && address) {
      const place = { id: Date.now(), name, address };
      safePlaces.push(place);

      // Renderizar na lista da tela
      const li = document.createElement('li');
      li.className = 'dynamic-item';
      li.innerHTML = `
        <span><strong>${name}</strong>: ${address}</span>
        <button type="button" onclick="removePlace(${place.id})" style="background:red; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">X</button>
      `;
      placesList.appendChild(li);

      // Limpar os campos
      nameInput.value = '';
      addressInput.value = '';
    } else {
      alert('Preencha o nome e o endereço do local antes de adicionar.');
    }
  });

  // Salvar formulário
  formPCD.addEventListener('submit', (e) => {
    e.preventDefault();

    const userData = {
      role: 'PCD',
      name: document.getElementById('pcd-name').value,
      disability: document.getElementById('pcd-disability').value,
      homeAddress: document.getElementById('pcd-address').value,
      emergencyContactPhone: document.getElementById('contact-phone').value,
      safePlaces: safePlaces
    };

    // Salva no localStorage para simular o banco de dados temporariamente
    localStorage.setItem('userPCDData', JSON.stringify(userData));
    alert('Cadastro realizado com sucesso!');
    window.location.href = 'dashboard-pcd.html'; // Próxima tela
  });
});

// Função global para remover local cadastrado
function removePlace(id) {
  const item = document.querySelector(`[onclick="removePlace(${id})"]`).parentElement;
  item.remove();
}