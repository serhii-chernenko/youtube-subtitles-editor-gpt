import React, { useCallback, useState } from 'react';
import { Chunk } from '../global.d.ts';

export default function Task({
    setText,
    run,
    chunks,
    task,
    setTask,
}: {
    setText: (text: string) => void;
    run: React.MouseEventHandler<HTMLButtonElement>;
    chunks: Chunk[];
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
        <>
            {chunks.length ? '' : (
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
                    <div className='bottom-panel'>
                        <p>
                            Symbols: <strong>{symbols}</strong>
                        </p>
                        <button onClick={run} disabled={symbols < 1}>
                            Edit
                        </button>
                    </div>
                </>
            )}
        </>
    );
}
