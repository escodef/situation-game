export default class HttpError extends Error {
    constructor(
        public readonly status: number,
        public readonly errors: Record<string, string[]>
    ) {
        super(JSON.stringify(errors));
        this.name = 'HttpError';
    }
}
