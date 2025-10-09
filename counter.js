// Simple Counter Component
export const Counter = (props, context) => {
    const { getState, setState } = context;
    
    return {
        render: () => ({
            div: {
                className: 'counter-app',
                children: [
                    {
                        h1: {
                            className: 'counter-title',
                            text: 'Simple Counter'
                        }
                    },
                    {
                        div: {
                            className: 'counter-display',
                            text: () => getState('count', 0).toString()
                        }
                    },
                    {
                        div: {
                            className: 'counter-buttons',
                            children: [
                                {
                                    button: {
                                        className: 'btn btn-primary',
                                        text: '−',
                                        onclick: () => {
                                            const current = getState('count', 0);
                                            setState('count', current - 1);
                                        }
                                    }
                                },
                                {
                                    button: {
                                        className: 'btn btn-secondary',
                                        text: 'Reset',
                                        onclick: () => setState('count', 0)
                                    }
                                },
                                {
                                    button: {
                                        className: 'btn btn-primary',
                                        text: '+',
                                        onclick: () => {
                                            const current = getState('count', 0);
                                            setState('count', current + 1);
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        div: {
                            className: 'counter-info',
                            children: [
                                {
                                    div: {
                                        className: 'info-row',
                                        children: [
                                            {
                                                span: { text: 'Status:' }
                                            },
                                            {
                                                span: {
                                                    className: () => {
                                                        const count = getState('count', 0);
                                                        if (count > 0) return 'status-positive';
                                                        if (count < 0) return 'status-negative';
                                                        return 'status-zero';
                                                    },
                                                    text: () => {
                                                        const count = getState('count', 0);
                                                        if (count > 0) return 'Positive';
                                                        if (count < 0) return 'Negative';
                                                        return 'Zero';
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    div: {
                                        className: 'info-row',
                                        children: [
                                            {
                                                span: { text: 'Even/Odd:' }
                                            },
                                            {
                                                span: {
                                                    text: () => {
                                                        const count = getState('count', 0);
                                                        return count % 2 === 0 ? 'Even' : 'Odd';
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    div: {
                                        className: 'info-row',
                                        children: [
                                            {
                                                span: { text: 'Squared:' }
                                            },
                                            {
                                                span: {
                                                    text: () => {
                                                        const count = getState('count', 0);
                                                        return (count * count).toString();
                                                    }
                                                }
                                            }
                                        ]
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