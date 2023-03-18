import React from 'react';
import EditedChunk from './EditedChunk.tsx';
import { Result } from '../global.d.ts';

export default function Right(
    { result, setResult, save }: {
        result: Result[];
        setResult: React.SetStateAction<Result[]>;
        save: React.MouseEventHandler<HTMLButtonElement>;
    },
) {
    return (
        <>
            {result.length
                ? (
                    <div>
                        <div className='result'>
                            {result.map((item: Result, index) => (
                                <div key={item.id}>
                                    {result.length > 1
                                        ? <h4>Chunk: {index + 1}</h4>
                                        : ''}
                                    <EditedChunk
                                        item={item}
                                        index={index}
                                        setResult={setResult}
                                        save={save}
                                    />
                                    {index < result.length - 1 ? <hr /> : ''}
                                </div>
                            ))}
                        </div>
                    </div>
                )
                : null}
        </>
    );
}
