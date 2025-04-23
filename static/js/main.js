const { createApp, ref, onMounted, computed } = Vue;

createApp({
  setup() {
    // Refs for reactive data
    const rooms = ref([]);
    const reservations = ref([]);
    const loadingRooms = ref(false);
    const loadingReservations = ref(false);
    const errorRooms = ref(null);
    const errorReservations = ref(null);
    const newReservation = ref({
      guestName: '',
      roomId: '',
      checkIn: '',
      checkOut: ''
    });
    const submittingReservation = ref(false);
    const reservationMessage = ref('');
    const reservationError = ref(false);
    const cancellingReservation = ref(null); // Store the ID of the reservation being cancelled

    // --- API Fetching Functions ---
    const fetchRooms = async () => {
      loadingRooms.value = true;
      errorRooms.value = null;
      try {
        const response = await fetch('/api/rooms');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        rooms.value = await response.json();
      } catch (e) {
        console.error("Failed to fetch rooms:", e);
        errorRooms.value = 'Failed to load rooms. Please try again later.';
      } finally {
        loadingRooms.value = false;
      }
    };

    const fetchReservations = async () => {
      loadingReservations.value = true;
      errorReservations.value = null;
      try {
        const response = await fetch('/api/reservations');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        reservations.value = await response.json();
      } catch (e) {
        console.error("Failed to fetch reservations:", e);
        errorReservations.value = 'Failed to load reservations. Please try again later.';
      } finally {
        loadingReservations.value = false;
      }
    };

    // --- Actions ---
    const makeReservation = async () => {
        // Basic validation
        if (!newReservation.value.guestName || !newReservation.value.roomId || !newReservation.value.checkIn || !newReservation.value.checkOut) {
            reservationMessage.value = 'Please fill in all fields.';
            reservationError.value = true;
            return;
        }
        if (newReservation.value.checkOut <= newReservation.value.checkIn) {
            reservationMessage.value = 'Check-out date must be after check-in date.';
            reservationError.value = true;
            return;
        }

        submittingReservation.value = true;
        reservationMessage.value = '';
        reservationError.value = false;

        try {
            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newReservation.value),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP error! status: ${response.status}`);
            }

            // Success
            reservationMessage.value = 'Reservation successful!';
            reservationError.value = false;
            // Clear form
            newReservation.value = { guestName: '', roomId: '', checkIn: '', checkOut: '' };
            // Refresh reservations list
            await fetchReservations();
            // Optionally refresh rooms if availability changes (not implemented in basic backend)
            // await fetchRooms();

        } catch (e) {
            console.error("Failed to make reservation:", e);
            reservationMessage.value = `Failed to make reservation: ${e.message}`;
            reservationError.value = true;
        } finally {
            submittingReservation.value = false;
            // Clear message after a few seconds
            setTimeout(() => {
                reservationMessage.value = '';
            }, 5000);
        }
    };

    const cancelReservation = async (reservationId) => {
        if (!confirm('Are you sure you want to cancel this reservation?')) {
            return;
        }

        cancellingReservation.value = reservationId; // Indicate which one is being cancelled
        errorReservations.value = null; // Clear previous errors

        try {
            const response = await fetch(`/api/reservations/${reservationId}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP error! status: ${response.status}`);
            }

            // Success - refresh the list
            await fetchReservations();
             // Optionally refresh rooms if availability changes
            // await fetchRooms();

        } catch (e) {
            console.error("Failed to cancel reservation:", e);
            errorReservations.value = `Failed to cancel reservation: ${e.message}`;
        } finally {
            cancellingReservation.value = null; // Reset cancelling state
        }
    };


    // --- Lifecycle Hook ---
    onMounted(() => {
      fetchRooms();
      fetchReservations();
    });

    // --- Return values for template ---
    return {
      rooms,
      reservations,
      loadingRooms,
      loadingReservations,
      errorRooms,
      errorReservations,
      newReservation,
      submittingReservation,
      reservationMessage,
      reservationError,
      cancellingReservation,
      makeReservation,
      cancelReservation
    };
  }
}).mount('#app');
