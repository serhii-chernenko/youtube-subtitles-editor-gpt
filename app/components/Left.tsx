import React, { useCallback, useState } from 'react';

export default function Left({
    setText,
    run,
    chunks,
    resend,
    task,
    setTask,
}: {
    setText: (text: string) => void;
    run: React.MouseEventHandler<HTMLButtonElement>;
    chunks: string[];
    resend: (index: number) => void;
    task: string;
    setTask: React.SetStateAction<string>;
}) {
    const [symbols, setSymbols] = useState<number>(0);

    const updateOriginalText: React.ChangeEventHandler<HTMLTextAreaElement> =
        useCallback((event) => {
            const text = event.target.value;

            setSymbols(text.length);
            setText(text);
        }, []);

    const updateTask: React.ChangeEventHandler<HTMLTextAreaElement> =
        useCallback((event) => {
            let text = event.target.value;

            if (text.length > 80) {
                text = text.substring(0, 80);
            }

            setTask(text);
        }, []);

    return (
        <div>
            {chunks.length
                ? (
                    <div className='result'>
                        {chunks.map((item: string, index: number) => (
                            <div key={index}>
                                {chunks.length > 1
                                    ? <h4>Chunk: {index + 1}</h4>
                                    : ''}
                                <p>{item}</p>
                                <button
                                    onClick={() =>
                                        resend(index)}
                                >
                                    Re-generate current chunk
                                </button>
                                {index < chunks.length - 1 ? <hr /> : ''}
                            </div>
                        ))}
                    </div>
                )
                : (
                    <>
                        <div>
                            <label className='label' htmlFor='task'>
                                Task (<strong>{task.length}</strong>/80):
                            </label>
                            <textarea
                                className='task'
                                onChange={updateTask}
                                value={task}
                            />
                            <label className='label' htmlFor='task'>
                                Text:
                            </label>
                            <textarea
                                className='input'
                                onChange={updateOriginalText}
                            />
                        </div>
                        <p>
                            Symbols: <strong>{symbols}</strong>
                        </p>
                        <button onClick={run} disabled={symbols < 1}>
                            Edit
                        </button>
                    </>
                )}
        </div>
    );
}
