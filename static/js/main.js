const { createApp } = Vue

const app = createApp({
  data() {
    return {
      rooms: [],
      reservations: [],
      newReservation: {
        roomId: '',
        guestName: '',
        checkIn: '',
        checkOut: ''
      },
      roomsData: []
    }
  },
  
  mounted() {
    this.loadRooms()
    this.loadReservations()

    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
      reservationForm.addEventListener('submit', (event) => {
        event.preventDefault();
        this.makeReservation();
      });
    }
  },
  
  methods: {
    async loadRooms() {
      try {
        const response = await fetch('/api/rooms')
        if (!response.ok) throw new Error('Shiver me timbers! Failed to fetch rooms');
        this.rooms = await response.json();
        this.roomsData = this.rooms;
        this.renderRooms();
      } catch (error) {
        console.error('Error loading rooms:', error);
        const roomsContainer = document.getElementById('rooms-container');
        if (roomsContainer) {
          roomsContainer.innerHTML = '<p class="text-danger">Failed to load rooms. Check the console, ye scallywag!</p>';
        }
      }
    },
    
    renderRooms() {
      const roomsContainer = document.getElementById('rooms-container');
      const roomSelect = document.getElementById('room-select');
      if (!roomsContainer || !roomSelect) return;

      roomsContainer.innerHTML = '';
      roomSelect.innerHTML = '<option value="" selected disabled>Please select a room</option>';

      this.rooms.forEach(room => {
        const roomCard = document.createElement('div');
        roomCard.className = 'col-md-6 mb-3';
        roomCard.innerHTML = `
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">${room.name}</h5>
              <p class="card-text">Availability: ${room.availability}</p>
              <p class="card-text">Price: $${room.price}</p>
            </div>
          </div>
        `;
        roomsContainer.appendChild(roomCard);

        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = `${room.name} ($${room.price})`;
        option.disabled = room.availability <= 0;
        roomSelect.appendChild(option);
      });
    },
    
    async loadReservations() {
      try {
        const response = await fetch('/api/reservations')
        if (!response.ok) throw new Error('Blimey! Failed to fetch reservations');
        this.reservations = await response.json();
        this.renderReservations();
      } catch (error) {
        console.error('Error loading reservations:', error);
        const reservationsContainer = document.getElementById('reservations-container');
        if (reservationsContainer) {
          reservationsContainer.innerHTML = '<p class="text-danger">Failed to load reservations. Check the logs!</p>';
        }
      }
    },
    
    renderReservations() {
      const reservationsContainer = document.getElementById('reservations-container');
      if (!reservationsContainer) return;

      reservationsContainer.innerHTML = '';

      if (this.reservations.length === 0) {
        reservationsContainer.innerHTML = '<p>No current reservations, the deck is clear!</p>';
        return;
      }

      this.reservations.forEach(res => {
        const room = this.roomsData.find(r => r.id === res.roomId);
        const roomName = room ? room.name : 'Unknown Room';

        const resCard = document.createElement('div');
        resCard.className = 'card mb-3';
        resCard.innerHTML = `
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <p class="mb-1"><strong>${res.guestName}</strong> - Room: ${roomName}</p>
              <small>Check-in: ${res.checkIn}, Check-out: ${res.checkOut}</small>
            </div>
            <button class="btn btn-danger btn-sm cancel-btn" data-id="${res.id}">Cancel</button>
          </div>
        `;
        const cancelButton = resCard.querySelector('.cancel-btn');
        if (cancelButton) {
          cancelButton.addEventListener('click', () => this.cancelReservation(res.id));
        }
        reservationsContainer.appendChild(resCard);
      });
    },
    
    async makeReservation() {
      const roomSelect = document.getElementById('room-select');
      const guestNameInput = document.getElementById('guest-name');
      const checkinDateInput = document.getElementById('checkin-date');
      const checkoutDateInput = document.getElementById('checkout-date');

      if (!roomSelect.value || !guestNameInput.value.trim() || !checkinDateInput.value || !checkoutDateInput.value) {
        alert('Avast ye! Fill out all fields before settin\' sail!');
        return;
      }
      if (new Date(checkoutDateInput.value) <= new Date(checkinDateInput.value)) {
        alert('Landlubber! Check-out date must be after check-in date.');
        return;
      }

      const reservationData = {
        roomId: parseInt(roomSelect.value),
        guestName: guestNameInput.value.trim(),
        checkIn: checkinDateInput.value,
        checkOut: checkoutDateInput.value
      };

      try {
        const response = await fetch('/api/reservations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reservationData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Blast! Failed to make reservation');
        }

        alert('Reservation successful, anchors aweigh!');
        document.getElementById('reservation-form').reset();
        await this.loadRooms();
        await this.loadReservations();
      } catch (error) {
        console.error('Error making reservation:', error);
        alert(`Error: ${error.message}`);
      }
    },
    
    async cancelReservation(id) {
      if (!confirm('Are ye sure ye want to abandon this booking?')) {
        return;
      }
      try {
        const response = await fetch(`/api/reservations/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Drat! Failed to cancel reservation');
        }
        alert('Reservation cancelled, back to the hold!');
        await this.loadRooms();
        await this.loadReservations();
      } catch (error) {
        console.error('Error cancelling reservation:', error);
        alert(`Error: ${error.message}`);
      }
    }
  }
})

app.mount('#app-container')