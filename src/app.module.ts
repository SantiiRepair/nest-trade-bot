import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { Control } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
})

@Module({
  imports: [],
  controllers: [AppController],
  providers: [Control],
})
export class AppModule {}
