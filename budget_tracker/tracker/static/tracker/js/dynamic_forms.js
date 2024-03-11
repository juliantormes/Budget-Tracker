document.addEventListener('DOMContentLoaded', function() {
    const usingCreditCardCheckbox = document.querySelector('#id_using_credit_card');
    const creditCardFields = ['id_credit_card', 'id_installments', 'id_interest_rate'];

    function toggleCreditCardFields(display) {
        creditCardFields.forEach(fieldId => {
            const field = document.querySelector(`#${fieldId}`).parentNode;
            field.style.display = display ? '' : 'none';
        });
    }
    if (usingCreditCardCheckbox) {
        toggleCreditCardFields(usingCreditCardCheckbox.checked);

        usingCreditCardCheckbox.addEventListener('change', function() {
            toggleCreditCardFields(this.checked);
        })
    }
    else if(display){
        if(field.tagName === 'INPUT' || field.tagName === 'SELECT') {
            field.disabled = false;
        }
    }
});
