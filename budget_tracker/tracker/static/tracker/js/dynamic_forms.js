document.addEventListener('DOMContentLoaded', function() {
    const usingCreditCardCheckbox = document.querySelector('#id_using_credit_card');
    const creditCardFields = ['id_credit_card', 'id_installments', 'id_surcharge'];

    function toggleCreditCardFields(display) {
        creditCardFields.forEach(fieldId => {
            const fieldElement = document.querySelector(`#${fieldId}`);
            const fieldParentNode = fieldElement.closest('div'); // Get the parent <div>

            if(display) {
                fieldElement.required = true;
                fieldElement.removeAttribute('disabled');
                fieldParentNode.style.display = ''; // Show the field
            } else {
                fieldElement.required = false;
                fieldElement.setAttribute('disabled', 'disabled');
                fieldParentNode.style.display = 'none'; // Hide the field
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
