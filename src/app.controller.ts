import { Controller, Get } from '@nestjs/common';
import { Control } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: Control) {}

  @Get()
  Bot(): any {
    console.log('✅  Bot Running...');
    return this.appService.Mandalor();
  }
}
