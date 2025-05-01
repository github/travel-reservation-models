const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            rooms: [],
            reservations: [],
            selectedRoom: null,
            reservation: {
                guestName: '',
                checkIn: '',
                checkOut: '',
                roomId: null
            }
        }
    },
    methods: {
        async loadRooms() {
            try {
                const response = await fetch('/api/functions/get_rooms');
                if (!response.ok) throw new Error('Failed to load rooms');
                this.rooms = await response.json();
            } catch (error) {
                console.error('Error loading rooms:', error);
            }
        },
        async loadReservations() {
            try {
                const response = await fetch('/api/functions/manage_reservations');
                if (!response.ok) throw new Error('Failed to load reservations');
                this.reservations = await response.json();
            } catch (error) {
                console.error('Error loading reservations:', error);
            }
        },
        selectRoom(room) {
            this.selectedRoom = room;
            this.reservation.roomId = room.id;
        },
        cancelReservationForm() {
            this.selectedRoom = null;
            this.reservation = {
                guestName: '',
                checkIn: '',
                checkOut: '',
                roomId: null
            };
        },
        async makeReservation() {
            try {
                const response = await fetch('/api/functions/manage_reservations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.reservation)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to make reservation');
                }

                await this.loadRooms();
                await this.loadReservations();
                this.cancelReservationForm();
            } catch (error) {
                console.error('Error making reservation:', error);
                alert(error.message);
            }
        },
        async cancelReservation(reservationId) {
            if (!confirm('Are you sure you want to cancel this reservation?')) return;

            try {
                const response = await fetch(`/api/functions/manage_reservations/${reservationId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to cancel reservation');
                }

                await this.loadRooms();
                await this.loadReservations();
            } catch (error) {
                console.error('Error canceling reservation:', error);
                alert(error.message);
            }
        },
        getRoomName(roomId) {
            const room = this.rooms.find(r => r.id === roomId);
            return room ? room.name : 'Unknown Room';
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString();
        }
    },
    mounted() {
        this.loadRooms();
        this.loadReservations();
    }
});

app.mount('#app');