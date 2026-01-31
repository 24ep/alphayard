import { Response, NextFunction } from 'express';

export const appScopingMiddleware = (req: any, res: Response, next: NextFunction) => {
    const applicationId = req.headers['x-application-id'];
    
    if (applicationId) {
        req.applicationId = applicationId;
    }
    
    next();
};
