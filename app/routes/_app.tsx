import { Configuration, OpenAIApi } from 'openai';
import { format as dateFormat } from 'datetime';
import React, { useCallback, useState } from 'react';
import Key from '../components/Key.tsx';
import Left from '../components/Left.tsx';
import Right from '../components/Right.tsx';

const getChunks = (text: string, chunkSize: number = 2000): string[] => {
	const chunks: string[] = [];

	for (let index = 0; index < text.length; index += chunkSize) {
		chunks.push(text.substring(index, index + chunkSize));
	}

	return chunks;
};
export default function App() {
	const [apiKey, setApiKey] = useState<string>(
		localStorage.getItem('api_key') ?? '',
	);
	const [apiKeyConfirmed, confirmedApiKey] = useState<boolean>(false);
	const [text, setText] = useState<string>('');
	const [result, setResult] = useState<string[]>([]);
	const [isLoading, setLoading] = useState<boolean>(false);
	const [info, setInfo] = useState<string>('');

	const apiKeyHandler = useCallback<
		React.ChangeEventHandler<HTMLInputElement>
	>(
		(event) => setApiKey(event.target.value),
		[],
	);

	const confirmHandler = useCallback<
		React.MouseEventHandler<HTMLButtonElement>
	>(
		() => {
			localStorage.setItem('api_key', apiKey);
			confirmedApiKey(true);
		},
		[apiKey],
	);

	const run = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
		async () => {
			setLoading(true);
			setResult([]);

			const chunks: string[] = getChunks(text);

			const configuration = new Configuration({
				apiKey,
			});
			const openai = new OpenAIApi(configuration);

			try {
				for await (const [index, chunk] of chunks.entries()) {
					setInfo(
						`Processing ${index + 1} of ${chunks.length} chunks...`,
					);

					const response = await openai.createChatCompletion({
						model: 'gpt-3.5-turbo',
						temperature: 0,
						messages: [
							{
								role: 'user',
								content:
									'Виправ помилки та пунктуацію в тексті. Відправ мені результат без зайвих слів',
							},
							{
								role: 'user',
								content: chunk,
							},
						],
					});

					setResult((prev) => [
						...prev,
						response?.data?.choices[0]?.message?.content ?? '',
					]);
					setInfo('');
				}
			} catch (error) {
				setInfo(
					error?.error?.message ?? 'Oops, something went wrong...',
				);
				console.error(error);
			} finally {
				setLoading(false);
			}
		},
		[text],
	);

	return (
		<>
			{apiKeyConfirmed
				? (
					<>
						{info ? <div className='info'>{info}</div> : null}
						<main>
							<Left
								setText={setText}
								run={run}
								isLoading={isLoading}
							/>
							<Right result={result} />
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
				&copy; {dateFormat(new Date(), 'yyyy')}{' '}
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
