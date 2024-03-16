document.addEventListener('DOMContentLoaded', function() {
    var forms = document.querySelectorAll('form');
    forms.forEach(function(form) {
      form.setAttribute('novalidate', '');
    });
  });
  