import HttpError from './http.error';

export default class GameError extends HttpError {
    constructor(status: number, errors: Record<string, string[]>) {
        super(status, errors);
    }
}
