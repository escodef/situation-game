class SocketService {
    private static instance: SocketService;
    private users: Map<number, { id: 'asdnaskjdnasjd' }> = new Map();

    private constructor() {}

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    // тут нужно сделать систему подключения/отключения от рум, также сделать вериф пользователя по токену
    // брать инфу из токена и помимо socket id сохранять еще данные пользователя
    // нужно еще сделать методы чтобы определенному пользователю отправлять, отправлять всем пользователям в руме и другие методы
    // я заебался придумывать эту поебенньбььььь
}

export const socketService = SocketService.getInstance();
