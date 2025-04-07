import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { MatchModule } from './modules/match/match.module';
import { LivePlayersModule } from './modules/live-players/live-players.module';

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule, MatchModule, LivePlayersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
