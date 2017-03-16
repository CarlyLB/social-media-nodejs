// @flow

const middleware = {
    requireAuthentication: function(req: express$Request, res: express$Response, next: express$NextFunction): void {
        console.log('Middleware');
        next();
    }
};

export default middleware;