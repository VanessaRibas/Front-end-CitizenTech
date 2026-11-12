document.addEventListener('DOMContentLoaded', () => {
  const placesList = document.getElementById('places-list');
  const btnAddPlace = document.getElementById('btn-add-place');
  const formPCD = document.getElementById('form-pcd');

  const safePlaces = [];

  // Adicionar locais seguros dinamicamente (+ Cadastrar Mais Locais)
  if (btnAddPlace) {
    btnAddPlace.addEventListener('click', () => {
      const nameInput = document.getElementById('place-name');
      const addressInput = document.getElementById('place-address');

      const name = nameInput.value.trim();
      const address = addressInput.value.trim();

      if (name && address) {
        const place = { id: Date.now(), name, address };
        safePlaces.push(place);

        const li = document.createElement('li');
        li.className = 'dynamic-item';
        li.setAttribute('data-id', place.id);
        li.innerHTML = `
          <span><strong>${name}</strong>: ${address}</span>
          <button type="button" class="btn-remove" onclick="removePlace(${place.id})">X</button>
        `;
        placesList.appendChild(li);

        nameInput.value = '';
        addressInput.value = '';
      } else {
        alert('Preencha o nome e o endereço do local antes de adicionar.');
      }
    });
  }

  // Finalizar Cadastro
  if (formPCD) {
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

      localStorage.setItem('userPCDData', JSON.stringify(userData));
      alert('Cadastro realizado com sucesso!');
      window.location.href = 'dashboard_usuario.html';
    });
  }
});

function removePlace(id) {
  const item = document.querySelector(`li[data-id="${id}"]`);
  if (item) item.remove();
}