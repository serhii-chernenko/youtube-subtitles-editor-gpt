import React, { useCallback } from 'react';

export default function Left({ result }: { result: string[] }) {
	const copy = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
		() => navigator.clipboard.writeText(result.join(' ')),
		[result],
	);

	return (
		<>
			{result.length
				? (
					<div>
						<div className='result'>
							{result.map((item: string, index: number) => (
								<p key={index}>{item}</p>
							))}
						</div>
						<hr />
						<button onClick={copy}>Copy to clipboard</button>
					</div>
				)
				: null}
		</>
	);
}
