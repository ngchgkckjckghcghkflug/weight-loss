// Wait for the DOM to be ready
window.addEventListener('DOMContentLoaded', () => {
    // Get references to UI elements
    const titleInput = document.getElementById('titleInput');
    const bodyInput = document.getElementById('bodyInput');
    const delayInput = document.getElementById('delayInput');
    const scheduleButton = document.getElementById('scheduleButton');
    const statusArea = document.getElementById('statusArea');

    // Check if the button exists
    if (!scheduleButton) {
        updateStatus('Error: Schedule button not found!', true);
        return;
    }

    // Add click listener to the button
    scheduleButton.addEventListener('click', handleScheduleClick);

    // --- Function Definitions ---

    // Updates the status message area
    function updateStatus(message, isError = false) {
        console.log(message); // Also log to console for debugging
        statusArea.textContent = message;
        statusArea.className = isError ? 'error' : 'success'; // Use CSS classes for styling
        if (!isError && message.includes('scheduled')) {
             // Use 'success' styling for schedule confirmation
        } else if (!isError) {
            statusArea.className = ''; // Default styling
        }
    }

    // Main function to handle scheduling logic
    async function handleScheduleClick() {
        updateStatus('Processing...');

        // Check if Capacitor and the plugin are available
        if (!window.Capacitor?.Plugins?.LocalNotifications) {
            updateStatus('Error: LocalNotifications plugin not available. Run on native platform.', true);
            return;
        }
        const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;

        // Get values from input fields
        const title = titleInput.value || 'Default Title';
        const body = bodyInput.value || 'Default notification body.';
        const delaySeconds = parseInt(delayInput.value, 10);

        // Basic validation
        if (isNaN(delaySeconds) || delaySeconds < 0) {
            updateStatus('Error: Invalid delay. Please enter 0 or more seconds.', true);
            return;
        }

        try {
            // 1. Check/Request Permissions
            updateStatus('Checking permissions...');
            let permStatus = await LocalNotifications.checkPermissions();
            if (permStatus.display !== 'granted') {
                updateStatus('Requesting permissions...');
                permStatus = await LocalNotifications.requestPermissions();
            }

            if (permStatus.display !== 'granted') {
                updateStatus('Error: Notification permissions denied.', true);
                return;
            }

            // 2. Calculate schedule time
            const scheduleTime = new Date(Date.now() + delaySeconds * 1000);
            const notificationId = Date.now()% 2147483647; // Simple unique ID

            updateStatus(`Scheduling notification (ID: ${notificationId}) for ${scheduleTime.toLocaleTimeString()}`);

            // 3. Schedule the notification
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: title,
                        body: body,
                        id: notificationId,
                        schedule: { at: scheduleTime },
                        // Add other options if needed (sound, icon etc.)
                    }
                ]
            });

            updateStatus(`Notification (ID: ${notificationId}) successfully scheduled for ${scheduleTime.toLocaleTimeString()}`);

        } catch (error) {
            console.error('Scheduling error:', error);
            updateStatus(`Error: ${error.message || 'Could not schedule notification.'}`, true);
        }
    }
});