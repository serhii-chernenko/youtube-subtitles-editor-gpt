import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Chunk } from '../global.d.ts';
export default function EditedChunk(
    { chunk, setResult, save }: {
        chunk: Chunk;
        setResult: React.SetStateAction<Chunk[]>;
        save: React.MouseEventHandler<HTMLButtonElement>;
    },
) {
    const [isEditable, setEditable] = useState<boolean>(false);
    const [text, setText] = useState<string>(chunk.text);
    const [height, setHeight] = useState<string>('');
    const p = useRef();

    useEffect(() => {
        if (p.current) {
            setHeight(p.current.getBoundingClientRect().height + 10);
        }
    }, [p]);

    const changeHandler: React.ChangeEventHandler<HTMLTextAreaElement> =
        useCallback((event) => {
            setText(event.target.value);
        });

    const onBlur: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(
        () => {
            setEditable(false);

            if (!text) {
                return setText(chunk.text);
            }

            if (chunk.text && chunk.text !== text) {
                setResult((prev: Chunk[]) => {
                    const idx = prev.findIndex(({ order }) =>
                        order === chunk.order
                    );

                    prev[idx] = {
                        ...prev[idx],
                        text,
                    };

                    return [...prev];
                });
            }
        },
    );

    const edit: React.MouseEventHandler<HTMLParagraphElement> = useCallback(
        () => {
            if (!chunk.done) {
                setEditable(true);
            }
        },
    );

    const toggleStatus: React.MouseEventHandler<HTMLButtonElement> =
        useCallback(() => {
            setResult((prev: Chunk[]) => {
                const idx = prev.findIndex(({ order }) =>
                    order === chunk.order
                );

                prev[idx] = {
                    ...prev[idx],
                    done: !prev[idx].done,
                };

                return [...prev];
            });
        });

    const copy: React.MouseEventHandler<HTMLButtonElement> = useCallback(() => {
        navigator.clipboard.writeText(text);
    });

    return (
        <>
            {isEditable
                ? (
                    <textarea
                        onChange={changeHandler}
                        onBlur={onBlur}
                        value={text}
                        autoFocus={true}
                        style={{ height }}
                        className='editable'
                    />
                )
                : (
                    <>
                        <p
                            ref={p}
                            onClick={edit}
                            className={chunk.done
                                ? 'edited ready-text'
                                : 'edited'}
                        >
                            {text}
                        </p>
                    </>
                )}
            <div className='chunk-panel'>
                <button
                    onClick={toggleStatus}
                    className={chunk.done ? 'undone' : 'done'}
                >
                    {chunk.done ? 'Undone' : 'Done'}
                </button>
                <button onClick={copy}>Copy</button>
            </div>
        </>
    );
}
