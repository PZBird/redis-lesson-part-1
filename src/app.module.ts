import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BenchMarkService } from './benchmark.service';

@Module({
  imports: [
    RedisModule.forRoot({
      config: {
        url: 'redis://127.0.0.1:6379/0',
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, BenchMarkService],
})
export class AppModule {}
