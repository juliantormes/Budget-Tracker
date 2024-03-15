document.addEventListener('DOMContentLoaded', function() {
    const usingCreditCardCheckbox = document.querySelector('#id_using_credit_card');
    const creditCardFields = ['id_credit_card', 'id_installments', 'id_surcharge'];

    function toggleCreditCardFields(display) {
        creditCardFields.forEach(fieldId => {
            const fieldElement = document.querySelector(`#${fieldId}`);
            if(display) {
                fieldElement.required = true; // Make the field required
                fieldElement.removeAttribute('disabled'); // Ensure the field is not disabled
            } else {
                fieldElement.required = false; // No longer required
                fieldElement.setAttribute('disabled', 'disabled'); // Disable the field to not validate on submit
            }
        });
    }

    if (usingCreditCardCheckbox) {
        toggleCreditCardFields(usingCreditCardCheckbox.checked);
        
        usingCreditCardCheckbox.addEventListener('change', function() {
            toggleCreditCardFields(this.checked);
        });
    }
});
