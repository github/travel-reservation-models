const { createApp, ref, onMounted, computed } = Vue;

createApp({
    setup() {
        // Reactive state
        const rooms = ref([]);
        const reservations = ref([]);
        const loadingRooms = ref(true);
        const loadingReservations = ref(true);
        const newReservation = ref({
            roomId: '',
            guestName: '',
            checkIn: '',
            checkOut: ''
        });
        const formError = ref('');
        const cancelError = ref('');

        // API base URL (can be configured)
        const API_URL = '/api'; // Assuming Flask runs on the same origin

        // Fetch rooms from API
        const fetchRooms = async () => {
            loadingRooms.value = true;
            try {
                const response = await fetch(`${API_URL}/rooms`);
                if (!response.ok) throw new Error('Failed to fetch rooms');
                rooms.value = await response.json();
            } catch (error) {
                console.error("Error fetching rooms:", error);
                // Handle error display if needed
            } finally {
                loadingRooms.value = false;
            }
        };

        // Fetch reservations from API
        const fetchReservations = async () => {
            loadingReservations.value = true;
            try {
                const response = await fetch(`${API_URL}/reservations`);
                if (!response.ok) throw new Error('Failed to fetch reservations');
                reservations.value = await response.json();
            } catch (error) {
                console.error("Error fetching reservations:", error);
                // Handle error display if needed
            } finally {
                loadingReservations.value = false;
            }
        };

        // Submit new reservation
        const submitReservation = async () => {
            formError.value = '';
            if (!newReservation.value.roomId || !newReservation.value.guestName || !newReservation.value.checkIn || !newReservation.value.checkOut) {
                formError.value = 'Please fill in all fields.';
                return;
            }
            // Basic date validation
            if (newReservation.value.checkOut <= newReservation.value.checkIn) {
                formError.value = 'Check-out date must be after check-in date.';
                return;
            }

            try {
                const response = await fetch(`${API_URL}/reservations`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newReservation.value),
                });
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.error || 'Failed to create reservation');
                }
                // Clear form
                newReservation.value = { roomId: '', guestName: '', checkIn: '', checkOut: '' };
                // Refresh data
                await fetchRooms(); // Refresh rooms to update availability potentially
                await fetchReservations();
            } catch (error) {
                console.error("Error creating reservation:", error);
                formError.value = error.message;
            }
        };

        // Cancel reservation
        const cancelReservation = async (reservationId) => {
            cancelError.value = '';
            if (!confirm('Are you sure you want to cancel this reservation?')) {
                return;
            }
            try {
                const response = await fetch(`${API_URL}/reservations/${reservationId}`, {
                    method: 'DELETE',
                });
                const result = await response.json(); // Expecting { message: '...' } or { error: '...' }
                if (!response.ok) {
                    throw new Error(result.error || 'Failed to cancel reservation');
                }
                // Refresh reservations list
                await fetchReservations();
                // Optionally refresh rooms if cancellation affects availability
                // await fetchRooms();
            } catch (error) {
                console.error("Error cancelling reservation:", error);
                cancelError.value = error.message;
            }
        };

        // Computed property for available rooms in dropdown
        const availableRooms = computed(() => {
            return rooms.value.filter(room => room.availability > 0);
        });

        // Helper to get room name by ID
        const getRoomName = (roomId) => {
            const room = rooms.value.find(r => r.id === roomId);
            return room ? room.name : 'Unknown Room';
        };

        // Fetch initial data on component mount
        onMounted(() => {
            fetchRooms();
            fetchReservations();
        });

        // Return reactive state and methods
        return {
            rooms,
            reservations,
            loadingRooms,
            loadingReservations,
            newReservation,
            formError,
            cancelError,
            submitReservation,
            cancelReservation,
            availableRooms,
            getRoomName
        };
    }
}).mount('#app');
