// Header Component
export const Header = (props, context) => {
    const { setState, getState } = context;

    // Function to toggle the theme
    const toggleTheme = () => {
        const currentTheme = getState('theme', 'light');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Update the state
        setState('theme', newTheme);
        
        // Apply to the DOM
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Persist the choice
        localStorage.setItem('theme', newTheme);
    };

    return {
        render: () => ({
            header: {
                className: 'app-header',
                children: [
                    {
                        div: {
                            className: 'app-title',
                            text: 'Juris App'
                        }
                    },
                    {
                        button: {
                            className: 'theme-toggle',
                            onclick: toggleTheme,
                            // Dynamically change the icon based on the theme state
                            text: () => getState('theme', 'light') === 'light' ? '🌙' : '☀️',
                            title: () => getState('theme', 'light') === 'light' ? "Click for dark." : 'Click for light.'

                        }
                    }
                ]
            }
        })
    };
};