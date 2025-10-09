// Login Component
export const Login = (props, context) => {
    const { getState, setState } = context;

    // Handle form submission
    const handleLogin = (e) => {
        e.preventDefault(); // Prevent the form from reloading the page
        const email = getState('email', '');
        const password = getState('password', '');

        // Simple validation: email must contain '@' and password must not be empty.
        if (email.includes('@') && password.length > 0) {
            console.log('Login successful:', { email });
            // Set isLoggedIn state to true to trigger the view switch in index.html
            setState('isLoggedIn', true);
            // Optional: Clear the form fields from the state after login
            setState('email', '');
            setState('password', '');
        } else {
            alert('Login Failed: Please enter a valid email and a password.');
        }
    };

    return {
        render: () => ({
            div: {
                // Reusing 'counter-app' class for styling from your style.css
                className: 'counter-app',
                children: [
                    {
                        h1: {
                            className: 'counter-title',
                            text: 'Login'
                        }
                    },
                    {
                        form: {
                            onsubmit: handleLogin,
                            children: [
                                {
                                    // Email Input
                                    input: {
                                        type: 'email',
                                        placeholder: 'Email',
                                        // Using a new class, but it will need styling
                                        className: 'form-input',
                                        value: () => getState('email', ''),
                                        oninput: (e) => setState('email', e.target.value)
                                    }
                                },
                                {
                                    // Password Input
                                    input: {
                                        type: 'password',
                                        placeholder: 'Password',
                                        className: 'form-input',
                                        value: () => getState('password', ''),
                                        oninput: (e) => setState('password', e.target.value)
                                    }
                                },
                                {
                                    // Submit Button
                                    button: {
                                        type: 'submit',
                                        className: 'btn btn-primary',
                                        text: 'Login'
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        })
    };
};