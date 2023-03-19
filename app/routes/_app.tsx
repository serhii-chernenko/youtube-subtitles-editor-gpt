import { Configuration, OpenAIApi } from 'openai';
import { format as dateFormat } from 'datetime';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import getChunks from '../helpers/get-chunks.ts';
import Key from '../components/Key.tsx';
import Task from '../components/Task.tsx';
import Result from '../components/Result.tsx';
import { Chunk, OpenAiResponse } from '../global.d.ts';
import {
    DEFAULT_TASK,
    INFO_SHOW_SEC,
    OPEANAI_REQUESTS_PER_MINUTE_LIMITATION,
    REQUESTS_TIMEOUT_SEC,
} from '../const.ts';

export default function App() {
    const [apiKey, setApiKey] = useState<string>(
        localStorage.getItem('api_key') ?? '',
    );
    const [text, setText] = useState<string>('');
    const [chunks, setChunks] = useState<string[]>(
        JSON.parse(localStorage.getItem('original') ?? '[]'),
    );
    const [result, setResult] = useState<Chunk[]>(
        JSON.parse(localStorage.getItem('edited') ?? '[]'),
    );
    const [apiKeyConfirmed, confirmedApiKey] = useState<boolean>(false);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [info, setInfo] = useState<string>('');
    const [task, setTask] = useState<string>(
        localStorage.getItem('task') ?? DEFAULT_TASK,
    );

    useEffect(() => {
        if (apiKey && chunks.length && result.length) {
            confirmedApiKey(true);
        }

        save();
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

    const sendRequest = (text: string) => {
        return openai.createChatCompletion(
            {
                model: 'gpt-3.5-turbo',
                temperature: 0,
                messages: [
                    {
                        role: 'user',
                        content: task,
                    },
                    {
                        role: 'user',
                        content: text,
                    },
                ],
            },
            {
                headers: {
                    'User-Agent': null,
                },
            },
        );
    };

    const onResponse = (chunk: Chunk) => {
        let res: Chunk[] = [];

        setResult((prev: Chunk[]) => {
            res = [
                ...prev,
                chunk,
            ].sort((a, b) => a.order > b.order ? 1 : -1);

            return res;
        });

        setTimeout(() => {
            const chunks = JSON.parse(localStorage.getItem('original') ?? '[]');

            if (res.length === chunks.length) {
                setInfo('');
                setLoading(false);
            }
        }, 0);
    };

    const promiseWithTimeout = (
        promise: Promise<OpenAiResponse>,
        timeout: number = 1000 * REQUESTS_TIMEOUT_SEC,
    ) => {
        return Promise.race([
            promise,
            new Promise((resolve, reject) => {
                setTimeout(
                    () => reject(new Error('The request is timed out')),
                    timeout,
                );
            }),
        ]);
    };

    const runJob = (chunk: Chunk) => {
        promiseWithTimeout(
            sendRequest(chunk.text).then(
                (response: OpenAiResponse) => {
                    onResponse({
                        ...chunk,
                        text: response?.data?.choices[0]?.message
                            ?.content ??
                            '',
                    });
                },
            ).catch(() => runJob(chunk)),
        ).catch(() => runJob(chunk));
    };

    const run: React.MouseEventHandler<HTMLButtonElement> = useCallback(
        () => {
            const chunks: Chunk[] = getChunks(text);

            setLoading(true);
            setResult([]);
            setChunks(chunks);

            // Fix OpenAI restriction of requests per minute
            if (chunks.length > OPEANAI_REQUESTS_PER_MINUTE_LIMITATION) {
                const jobs = [];

                for (
                    let index = 0;
                    index < chunks.length;
                    index += OPEANAI_REQUESTS_PER_MINUTE_LIMITATION
                ) {
                    jobs.push(
                        chunks.slice(
                            index,
                            index + OPEANAI_REQUESTS_PER_MINUTE_LIMITATION,
                        ),
                    );
                }

                for (const [idx, job] of jobs.entries()) {
                    if (idx === 0) {
                        job.map(runJob);

                        continue;
                    }

                    setTimeout(
                        () => job.map(runJob),
                        REQUESTS_TIMEOUT_SEC * 1000,
                    );
                }
            } else {
                chunks.map(runJob);
            }

            setTimeout(() => {
                setInfo(
                    `Processing ${chunks.length} chunk${
                        chunks.length > 1 ? 's' : ''
                    }...`,
                );
            }, 0);
        },
        [text],
    );

    const save = useCallback(() => {
        localStorage.setItem('original', JSON.stringify(chunks));
        localStorage.setItem('edited', JSON.stringify(result));
        localStorage.setItem('task', task);
        setInfo('');
    }, [result, chunks]);

    const reset: React.MouseEventHandler<HTMLButtonElement> = useCallback(
        () => {
            localStorage.removeItem('original');
            localStorage.removeItem('edited');
            localStorage.removeItem('task');
            setChunks([]);
            setResult([]);
            setTask(DEFAULT_TASK);
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

    const resend = ({ id, order }: Chunk) => {
        const chunk = chunks.find((item: Chunk) => item.id === id);

        if (!chunk) {
            setInfo(`Chunk ${order} isn't found`);

            return setTimeout(() => setInfo(''), INFO_SHOW_SEC * 1000);
        }

        setLoading(true);
        setResult((
            prev: Chunk[],
        ) => [...prev.filter((item) => item.id !== id)]);
        setTimeout(() => setInfo(`Chunk ${order} is processing...`), 0);

        sendRequest(chunk.text).then((response: OpenAiResponse) => {
            setResult((prev: Chunk[]) => {
                prev.push({
                    id,
                    order,
                    text: response?.data?.choices[0]?.message?.content ?? '',
                    done: false,
                });

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
                        <header
                            className={!isLoading || info ? 'is-sticky' : ''}
                        >
                            {info ? <div className='info'>{info}</div> : null}
                            {!isLoading && result.length
                                ? (
                                    <div className='panel'>
                                        <button
                                            onClick={reset}
                                            className='reset'
                                        >
                                            Reset
                                        </button>
                                        <button onClick={copy}>
                                            Copy all
                                        </button>
                                    </div>
                                )
                                : ''}
                        </header>
                        <main>
                            <Task
                                setText={setText}
                                run={run}
                                task={task}
                                setTask={setTask}
                                chunks={chunks}
                            />
                            <Result
                                chunks={chunks}
                                result={result}
                                setResult={setResult}
                                save={save}
                                resend={resend}
                                isLoading={isLoading}
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
