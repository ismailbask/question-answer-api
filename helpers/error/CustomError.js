class CustomError extends Error{//*Error fonksiyonuna message ve status parametrelerini kalıtım yoluyla verdik. mesajı super ile direkt olarak verdik.statusu ise this ile.
    constructor(message,status){
        super(message);
        this.status = status;
    }
}
module.exports = CustomError;