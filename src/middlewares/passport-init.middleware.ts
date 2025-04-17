import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as passport from 'passport';

@Injectable()
export class PassportInitMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    passport.initialize()(req, res, next);
  }
}
