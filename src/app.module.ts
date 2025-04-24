import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PassportInitMiddleware } from './middlewares/passport-init.middleware';
import { LivekitModule } from './livekit/livekit.module';
import { AIAgentModule } from './ai-agent/ai-agent.module';
import { ConfigModule } from '@nestjs/config';
import { PlayersModule } from './players/players.module';
import { WiddPostModule } from './widdpost/widdpost.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    LivekitModule,
    AIAgentModule,
    PlayersModule,
    WiddPostModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PassportInitMiddleware).forRoutes('*');
  }
}
