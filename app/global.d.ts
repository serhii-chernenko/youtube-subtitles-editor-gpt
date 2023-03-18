export interface Result {
    id: string;
    text: string;
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
