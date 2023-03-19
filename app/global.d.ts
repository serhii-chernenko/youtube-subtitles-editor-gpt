export interface Chunk {
    order: number;
    text: string;
    id: string;
    done?: boolean;
}

export interface OpenAiResponse {
    data: {
        choices: [{
            finish_reason: string;
            index: number;
            message: {
                role: string;
                content: string;
            };
        }];
    };
}
