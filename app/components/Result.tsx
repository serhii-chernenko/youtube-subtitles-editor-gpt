import React from 'react';
import EditedChunk from './EditedChunk.tsx';
import { Chunk } from '../global.d.ts';

export default function Result(
    { result, chunks, setResult, save, resend, isLoading }: {
        chunks: Chunk[];
        result: Chunk[];
        setResult: React.SetStateAction<Chunk[]>;
        save: React.MouseEventHandler<HTMLButtonElement>;
        resend: (chunk: Chunk) => void;
        isLoading: boolean;
    },
) {
    return (
        <>
            {chunks.map((chunk: Chunk, index: number) => (
                <div key={chunk.id} className='row'>
                    <div>
                        {chunks.length > 1 ? <h4>Chunk: {chunk.order}</h4> : ''}
                        <p className={chunk.done ? 'ready-text' : 'test'}>
                            {chunk.text}
                        </p>
                        <button
                            disabled={isLoading}
                            onClick={() =>
                                resend(chunk)}
                        >
                            Re-generate
                        </button>
                    </div>
                    <div>
                        {chunks.length > 1 ? <h4>Chunk: {chunk.order}</h4> : ''}
                        {result.find((item) =>
                                item.id === chunk.id
                            )
                            ? (
                                <EditedChunk
                                    chunk={result.find((item) =>
                                        item.id === chunk.id
                                    )}
                                    setResult={setResult}
                                    save={save}
                                />
                            )
                            : ''}
                    </div>
                </div>
            ))}
        </>
    );
}
