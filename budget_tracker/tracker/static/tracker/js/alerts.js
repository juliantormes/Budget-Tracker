window.addEventListener('DOMContentLoaded', (event) => {
    const alertBox = document.querySelector('.alert.success');
    if(alertBox){
        alertBox.style.display = 'block'; // Show the alert box
        setTimeout(() => {
            alertBox.style.display = 'none'; // Hide the alert after 4 seconds
        }, 4000);
    }
});
