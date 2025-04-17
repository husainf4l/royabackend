import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PassportInitMiddleware } from './middlewares/passport-init.middleware';
import { LivekitModule } from './livekit/livekit.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    LivekitModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PassportInitMiddleware).forRoutes('*');
  }
}
