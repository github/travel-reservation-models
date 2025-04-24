const { createApp } = Vue

const app = createApp({
  data() {
    return {
      rooms: [],
      reservations: [],
      newReservation: {
        roomId: null,
        guestName: '',
        checkIn: '',
        checkOut: ''
      },
      message: '',
      messageType: 'success'
    }
  },
  
  mounted() {
    this.loadRooms()
    this.loadReservations()
  },
  
  methods: {
    async loadRooms() {
      try {
        const response = await fetch('/api/rooms')
        this.rooms = await response.json()
      } catch (error) {
        this.showError('Failed to load rooms')
      }
    },
    
    async loadReservations() {
      try {
        const response = await fetch('/api/reservations')
        this.reservations = await response.json()
      } catch (error) {
        this.showError('Failed to load reservations')
      }
    },
    
    async makeReservation() {
      try {
        const response = await fetch('/api/reservations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.newReservation)
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error)
        }
        
        await response.json()
        this.showSuccess('Reservation created successfully')
        this.resetForm()
        this.loadRooms()
        this.loadReservations()
      } catch (error) {
        this.showError(error.message || 'Failed to create reservation')
      }
    },
    
    async cancelReservation(id) {
      try {
        const response = await fetch(`/api/reservations/${id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          throw new Error('Failed to cancel reservation')
        }
        
        this.showSuccess('Reservation cancelled successfully')
        this.loadRooms()
        this.loadReservations()
      } catch (error) {
        this.showError(error.message || 'Failed to cancel reservation')
      }
    },
    
    resetForm() {
      this.newReservation = {
        roomId: null,
        guestName: '',
        checkIn: '',
        checkOut: ''
      }
    },
    
    showSuccess(message) {
      this.message = message
      this.messageType = 'success'
      setTimeout(() => this.message = '', 3000)
    },
    
    showError(message) {
      this.message = message
      this.messageType = 'error'
      setTimeout(() => this.message = '', 3000)
    },

    getRoomName(roomId) {
      const room = this.rooms.find(r => r.id === roomId)
      return room ? room.name : 'Unknown Room'
    },

    formatPrice(price) {
      return `$${Number(price).toFixed(2)}`;
    }
  },
  
  template: `
    <div>
      <h1 class="text-3xl font-bold mb-8">Hotel Reservations</h1>
      
      <!-- Message Display -->
      <div v-if="message" :class="['p-4 mb-4 rounded', 
        messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
        {{ message }}
      </div>
      
      <!-- Available Rooms -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Available Rooms</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="room in rooms" :key="room.id" 
               class="bg-white p-4 rounded shadow">
            <h3 class="font-bold">{{ room.name }}</h3>
            <p>Available: {{ room.availability }}</p>
            <p>Price: {{ formatPrice(room.price) }}/night</p>
          </div>
        </div>
      </div>
      
      <!-- Reservation Form -->
      <div class="mb-8 bg-white p-6 rounded shadow">
        <h2 class="text-2xl font-bold mb-4">Make a Reservation</h2>
        <form @submit.prevent="makeReservation" class="space-y-4">
          <div>
            <label class="block mb-1">Room</label>
            <select v-model="newReservation.roomId" class="w-full p-2 border rounded" required>
              <option value="">Select a room</option>
              <option v-for="room in rooms" :key="room.id" :value="room.id"
                      :disabled="room.availability <= 0">
                {{ room.name }} ({{ room.availability }} available)
              </option>
            </select>
          </div>
          
          <div>
            <label class="block mb-1">Guest Name</label>
            <input type="text" v-model="newReservation.guestName" 
                   class="w-full p-2 border rounded" required>
          </div>
          
          <div>
            <label class="block mb-1">Check-in Date</label>
            <input type="date" v-model="newReservation.checkIn" 
                   class="w-full p-2 border rounded" required>
          </div>
          
          <div>
            <label class="block mb-1">Check-out Date</label>
            <input type="date" v-model="newReservation.checkOut" 
                   class="w-full p-2 border rounded" required>
          </div>
          
          <button type="submit" 
                  class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Make Reservation
          </button>
        </form>
      </div>
      
      <!-- Current Reservations -->
      <div>
        <h2 class="text-2xl font-bold mb-4">Current Reservations</h2>
        <div class="space-y-4">
          <div v-for="reservation in reservations" :key="reservation.id" 
               class="bg-white p-4 rounded shadow">
            <p><strong>Guest:</strong> {{ reservation.guestName }}</p>
            <p><strong>Room:</strong> {{ getRoomName(reservation.roomId) }}</p>
            <p><strong>Check-in:</strong> {{ reservation.checkIn }}</p>
            <p><strong>Check-out:</strong> {{ reservation.checkOut }}</p>
            <button @click="cancelReservation(reservation.id)" 
                    class="mt-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})

app.mount('#app')