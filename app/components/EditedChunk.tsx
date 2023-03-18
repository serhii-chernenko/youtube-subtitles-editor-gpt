import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Result } from '../global.d.ts';
export default function EditedChunk(
    { item, index, isAutoSavingEnabled, setResult, save }: {
        item: Result;
        index: number;
        isAutoSavingEnabled: boolean;
        setResult: React.SetStateAction<Result[]>;
        save: React.MouseEventHandler<HTMLButtonElement>;
    },
) {
    const [isEditable, setEditable] = useState<boolean>(false);
    const [text, setText] = useState<string>(item.text);
    const [height, setHeight] = useState<string>('');
    const p = useRef();

    useEffect(() => {
        if (p.current) {
            setHeight(p.current.getBoundingClientRect().height);
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
                return setText(item.text);
            }

            if (isAutoSavingEnabled && item.text && item.text !== text) {
                setResult((prev: Result[]) => {
                    prev[index] = {
                        id: crypto.randomUUID(),
                        text,
                    };

                    return prev;
                });

                save();
            }
        },
    );

    const edit: React.MouseEventHandler<HTMLParagraphElement> = useCallback(
        () => {
            setEditable(true);
        },
    );

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
                        <p ref={p} onClick={edit}>{text}</p>
                        <button onClick={copy}>Copy only this chunk</button>
                    </>
                )}
        </>
    );
}
