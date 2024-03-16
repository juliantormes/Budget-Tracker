document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const submitButton = form.querySelector('button[type="submit"]');

    submitButton.addEventListener('click', function(event) {
        // Clear out any old messages
        form.querySelectorAll('.error').forEach(function(errorDiv) {
            errorDiv.textContent = ''; // Clear the content
            errorDiv.style.display = 'none'; // Hide the error div
        });

        // Find all invalid fields within the form
        form.querySelectorAll(':invalid').forEach(function(field) {
            // Prevent default bubble tooltip
            event.preventDefault();

            // Find the field's error display div and set the message
            const errorDiv = field.parentNode.querySelector('.error');
            errorDiv.textContent = field.validationMessage;
            errorDiv.style.display = 'block'; // Show the error div
        });
    });

    // Optional: Clear the error message if the user corrects the field
    form.querySelectorAll('input, select, textarea').forEach(function(input) {
        input.addEventListener('input', function() {
            const errorDiv = input.parentNode.querySelector('.error');
            if (errorDiv) {
                errorDiv.textContent = '';
                errorDiv.style.display = 'none';
            }
        });
    });
});
