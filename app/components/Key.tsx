import React from 'react';

export default function Key(
    { apiKey, apiKeyHandler, confirmHandler }: {
        apiKey: string;
        apiKeyHandler: React.ChangeEventHandler<HTMLInputElement>;
        confirmHandler: React.MouseEventHandler<HTMLButtonElement>;
    },
) {
    return (
        <div className='api'>
            <h1>Set the OpenAI API key</h1>
            <p>
                Get the key{' '}
                <a
                    href='https://platform.openai.com/account/api-keys'
                    target='_blank'
                >
                    here
                </a>.
            </p>
            <input
                type='password'
                value={apiKey}
                onChange={apiKeyHandler}
                className='key'
            />
            <button onClick={confirmHandler}>Confirm</button>
        </div>
    );
}
