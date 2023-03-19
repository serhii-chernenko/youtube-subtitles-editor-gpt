let dev = false;

// uncomment for the development
// dev = true;
export const {
    DEFAULT_TASK,
    OPEANAI_REQUESTS_PER_MINUTE_LIMITATION,
    REQUESTS_TIMEOUT_SEC,
    CHUNK_SIZE,
    INFO_SHOW_SEC,
} = {
    DEFAULT_TASK: 'Виправ помилки та пунктуацію в тексті',
    OPEANAI_REQUESTS_PER_MINUTE_LIMITATION: dev ? 3 : 20,
    REQUESTS_TIMEOUT_SEC: dev ? 2 : 70,
    CHUNK_SIZE: dev ? 250 : 2000,
    INFO_SHOW_SEC: 2,
};
