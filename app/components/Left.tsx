import React, { useCallback, useState } from 'react';

export default function Left({
	setText,
	run,
	isLoading,
}: {
	setText: (text: string) => void;
	run: React.MouseEventHandler<HTMLButtonElement>;
	isLoading: boolean;
}) {
	const [symbols, setSymbols] = useState<number>(0);

	const changeHandler = useCallback<
		React.ChangeEventHandler<HTMLTextAreaElement>
	>((event) => {
		const text = event.target.value;

		setSymbols(text.length);
		setText(text);
	}, []);

	return (
		<div>
			<div>
				<label>
					<textarea onChange={changeHandler} disabled={isLoading} />
				</label>
			</div>
			<p>
				Symbols: <strong>{symbols}</strong>
			</p>
			<button onClick={run}>Edit</button>
		</div>
	);
}
