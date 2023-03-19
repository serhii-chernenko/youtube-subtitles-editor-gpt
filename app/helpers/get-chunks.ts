import { CHUNK_SIZE } from '../const.ts';
import { Chunk } from '../global.d.ts';
export default function getChunks(
    text: string,
    chunkSize: number = CHUNK_SIZE,
): Chunk[] {
    const chunks: Chunk[] = [];
    let startIndex = 0;
    let counter = 1;
    let endIndex = chunkSize;

    while (endIndex < text.length) {
        let lastSpaceIndex = text.lastIndexOf(' ', endIndex);

        if (lastSpaceIndex === -1 || lastSpaceIndex <= startIndex) {
            lastSpaceIndex = endIndex - 1;
        }

        chunks.push({
            id: crypto.randomUUID(),
            order: counter,
            text: text.substring(startIndex, lastSpaceIndex),
        });
        startIndex = lastSpaceIndex + 1;
        endIndex = startIndex + chunkSize;
        counter++;
    }

    chunks.push({
        id: crypto.randomUUID(),
        order: counter,
        text: text.substring(startIndex),
        done: false,
    });

    return chunks;
}
