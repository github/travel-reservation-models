const { createApp } = Vue

createApp({
    data() {
        return {
            rooms: [],
            reservations: [],
            selectedRoom: null,
            newReservation: {
                guestName: '',
                checkIn: '',
                checkOut: ''
            }
        }
    },
    mounted() {
        this.fetchRooms()
        this.fetchReservations()
    },
    methods: {
        async fetchRooms() {
            try {
                const response = await fetch('/api/rooms')
                this.rooms = await response.json()
            } catch (error) {
                console.error('Error fetching rooms:', error)
            }
        },
        async fetchReservations() {
            try {
                const response = await fetch('/api/reservations')
                this.reservations = await response.json()
            } catch (error) {
                console.error('Error fetching reservations:', error)
            }
        },
        selectRoom(room) {
            this.selectedRoom = room
            this.newReservation = {
                roomId: room.id,
                guestName: '',
                checkIn: '',
                checkOut: ''
            }
        },
        cancelReservationForm() {
            this.selectedRoom = null
            this.newReservation = {
                guestName: '',
                checkIn: '',
                checkOut: ''
            }
        },
        async createReservation() {
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
                    alert(error.error || 'Failed to create reservation')
                    return
                }

                await this.fetchRooms()
                await this.fetchReservations()
                this.cancelReservationForm()
            } catch (error) {
                console.error('Error creating reservation:', error)
                alert('Failed to create reservation')
            }
        },
        async deleteReservation(reservationId) {
            if (!confirm('Are you sure you want to cancel this reservation?')) {
                return
            }

            try {
                const response = await fetch(`/api/reservations/${reservationId}`, {
                    method: 'DELETE'
                })

                if (!response.ok) {
                    const error = await response.json()
                    alert(error.error || 'Failed to cancel reservation')
                    return
                }

                await this.fetchRooms()
                await this.fetchReservations()
            } catch (error) {
                console.error('Error canceling reservation:', error)
                alert('Failed to cancel reservation')
            }
        },
        getRoomName(roomId) {
            const room = this.rooms.find(r => r.id === roomId)
            return room ? room.name : 'Unknown Room'
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString()
        }
    }
}).mount('#app')