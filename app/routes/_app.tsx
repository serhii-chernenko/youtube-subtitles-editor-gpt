import { Configuration, OpenAIApi } from 'openai';
import { format as dateFormat } from 'datetime';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import Key from '../components/Key.tsx';
import Left from '../components/Left.tsx';
import Right from '../components/Right.tsx';
import { OpenAiResponse, Result } from '../global.d.ts';

const getChunks = (text: string, chunkSize: number = 2000): string[] => {
    const chunks: string[] = [];
    let startIndex = 0;
    let endIndex = chunkSize;

    while (endIndex < text.length) {
        let lastSpaceIndex = text.lastIndexOf(' ', endIndex);

        if (lastSpaceIndex === -1 || lastSpaceIndex <= startIndex) {
            lastSpaceIndex = endIndex - 1;
        }

        chunks.push(text.substring(startIndex, lastSpaceIndex));
        startIndex = lastSpaceIndex + 1;
        endIndex = startIndex + chunkSize;
    }

    chunks.push(text.substring(startIndex));

    return chunks;
};

const defaultTask =
    'Виправ помилки та пунктуацію в тексті. Відправ мені тільки результат';

export default function App() {
    const [apiKey, setApiKey] = useState<string>(
        localStorage.getItem('api_key') ?? '',
    );
    const [text, setText] = useState<string>('');
    const [chunks, setChunks] = useState<string[]>(
        JSON.parse(localStorage.getItem('original') ?? '[]'),
    );
    const [result, setResult] = useState<Result[]>(
        JSON.parse(localStorage.getItem('edited') ?? '[]'),
    );
    const [apiKeyConfirmed, confirmedApiKey] = useState<boolean>(false);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [info, setInfo] = useState<string>('');
    const [task, setTask] = useState<string>(
        localStorage.getItem('task') ?? defaultTask,
    );

    useEffect(() => {
        if (apiKey && chunks.length && result.length) {
            confirmedApiKey(true);
        }
    }, [apiKey, chunks, result]);

    const apiKeyHandler: React.ChangeEventHandler<HTMLInputElement> =
        useCallback(
            (event) => setApiKey(event.target.value),
            [],
        );

    const confirmHandler: React.MouseEventHandler<HTMLButtonElement> =
        useCallback(
            () => {
                localStorage.setItem('api_key', apiKey);
                confirmedApiKey(true);
            },
            [apiKey],
        );

    const configuration = new Configuration({
        apiKey,
    });
    const openai = new OpenAIApi(configuration);
    let responsesCollection: OpenAiResponse[] = [];

    const sendRequest = (chunk: string) => {
        return openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            temperature: 0,
            messages: [
                {
                    role: 'user',
                    content: task,
                },
                {
                    role: 'user',
                    content: chunk,
                },
            ],
        });
    };

    const run: React.MouseEventHandler<HTMLButtonElement> = useCallback(
        async () => {
            setLoading(true);
            setResult([]);

            const chunks = getChunks(text);

            setChunks(chunks);

            const onResponses = (responses: OpenAiResponse[]) => {
                responsesCollection = [...responsesCollection, ...responses];

                for (const response of responses) {
                    setResult((prev: Result[]) => [
                        ...prev,
                        {
                            id: crypto.randomUUID(),
                            text:
                                response?.data?.choices[0]?.message?.content ??
                                    '',
                        },
                    ]);
                }

                if (responsesCollection.length === chunks.length) {
                    setInfo('');
                    setLoading(false);
                }
            };

            // Fix OpenAI restriction 20 requests per minute
            if (chunks.length > 20) {
                const jobs = [];

                for (let index = 0; index < chunks.length; index += 20) {
                    jobs.push(chunks.slice(index, index + 20));
                }

                for await (const [index, job] of jobs.entries()) {
                    if (index === 0) {
                        Promise.all(job.map(sendRequest)).then(onResponses);

                        continue;
                    }

                    setTimeout(
                        () =>
                            Promise.all(job.map(sendRequest)).then(onResponses),
                        1000 * 70,
                    );
                }
            } else {
                Promise.all(chunks.map(sendRequest)).then(onResponses);
            }

            setInfo(
                `Processing ${chunks.length} chunk${
                    chunks.length > 1 ? 's' : ''
                }...`,
            );
        },
        [text],
    );

    const save: React.MouseEventHandler<HTMLButtonElement> = useCallback(() => {
        localStorage.setItem('original', JSON.stringify(chunks));
        localStorage.setItem('edited', JSON.stringify(result));
        localStorage.setItem('task', task);
        setAutoSaving(true);
        setInfo('Saved!');
        setTimeout(() => setInfo(''), 2000);
    });

    const reset: React.MouseEventHandler<HTMLButtonElement> = useCallback(
        () => {
            localStorage.removeItem('original');
            localStorage.removeItem('edited');
            localStorage.removeItem('task');
            setChunks([]);
            setResult([]);
            setAutoSaving(false);
            setTask(defaultTask);
        },
    );

    const copy: React.MouseEventHandler<HTMLButtonElement> = useCallback(
        () => {
            const temp = [];

            for (const { text } of result) {
                temp.push(text);
            }

            navigator.clipboard.writeText(temp.join('\n\n'));
        },
        [result],
    );

    const resend = (index: number) => {
        setInfo(`Chunk ${index + 1} is processing...`);

        sendRequest(chunks[index]).then((response) => {
            setResult((prev: Result[]) => {
                prev[index] = {
                    id: crypto.randomUUID(),
                    text: response?.data?.choices[0]?.message?.content ?? '',
                };

                return [...prev];
            });

            setLoading(false);
            save();
        });
    };

    const currentYear = dateFormat(new Date(), 'yyyy');
    const copyright = currentYear === '2023'
        ? currentYear
        : `2023-${currentYear}`;

    return (
        <>
            {apiKeyConfirmed
                ? (
                    <>
                        <header>
                            {info ? <div className='info'>{info}</div> : null}
                            {!isLoading && result.length
                                ? (
                                    <div className='panel'>
                                        <button onClick={save}>Save</button>
                                        <button onClick={reset}>Reset</button>
                                        <button onClick={copy}>
                                            Copy all edited chunks
                                        </button>
                                    </div>
                                )
                                : ''}
                        </header>
                        <main>
                            <Left
                                setText={setText}
                                run={run}
                                task={task}
                                setTask={setTask}
                                chunks={chunks}
                                resend={resend}
                            />
                            <Right
                                result={result}
                                setResult={setResult}
                                save={save}
                            />
                        </main>
                    </>
                )
                : (
                    <Key
                        apiKey={apiKey}
                        apiKeyHandler={apiKeyHandler}
                        confirmHandler={confirmHandler}
                    />
                )}
            <footer>
                &copy; {copyright}{' '}
                <a href='https://chernenko.digital' target='_blank'>
                    Serhii Chernenko
                </a>{' '}
                |{' '}
                <a
                    href='https://github.com/Inevix/youtube-subtitles-editor-gpt'
                    target='_blank'
                >
                    GitHub repo
                </a>
            </footer>
        </>
    );
}
