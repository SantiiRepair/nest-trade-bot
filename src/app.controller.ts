import { Controller, Get } from '@nestjs/common';
import { Control } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: Control) {}

  @Get()
  Bot(): any {
    return this.appService.Mandalor();
  }
}
