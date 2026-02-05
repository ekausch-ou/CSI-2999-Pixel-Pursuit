document.addEventListener('DOMContentLoaded', function() {
    const new_password1 = document.getElementById('id_new_password1');
    const new_password2 = document.getElementById('id_new_password2');
    
    function validatePasswords() {
        let validLength = new_password1.value.length >= 8; // check length
        let matching = new_password2.value === new_password1.value && new_password2.value.length > 0; // check matching

        new_password1.classList.toggle('is-invalid', !validLength);
        new_password1.classList.toggle('is-valid', validLength);
        
        if (new_password2.value.length === 0) { // only if field has characters
            new_password2.classList.remove('is-invalid');
            new_password2.classList.remove('is-valid');
        } else {
            new_password2.classList.toggle('is-invalid', !matching);
            new_password2.classList.toggle('is-valid', matching);
        }    
    }

    new_password1.addEventListener('input', validatePasswords);
    new_password2.addEventListener('input', validatePasswords);
});