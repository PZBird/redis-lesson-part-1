import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { BenchMarkService } from './benchmark.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly benchService: BenchMarkService,
  ) {}

  @Get('generate')
  async generateStrings() {
    return this.appService.generateStrings();
  }

  @Get('read')
  async readStrings() {
    return this.appService.readStrings();
  }

  @Get('hgenerate')
  async generateHashes() {
    return this.appService.generateHashes();
  }

  @Get('hread')
  async readHashes() {
    return this.appService.readHashes();
  }

  @Get('setRealSessionHash')
  async setSessionAsHash() {
    return this.appService.setSessionAsHash();
  }

  @Get('setRealSessionString')
  async setSessionAsString() {
    return this.appService.setSessionAsString();
  }

  @Get('readRealSessionString')
  async readSessionAsStringThousandTimes() {
    return this.appService.readSessionAsStringThousandTimes();
  }

  @Get('readRealSessionHash')
  async readSessionAsHashThousandTimes() {
    return this.appService.readSessionAsHashThousandTimes();
  }

  @Get('flush')
  async flushDB() {
    return this.appService.flushDB();
  }

  @Get('benchmark')
  async benchmark() {
    return this.benchService.testForSet();
  }

  @Get('testForRead')
  async testForRead() {
    return this.benchService.testForRead();
  }

  @Get('runOptimizationTest')
  async runOptimizationTest() {
    return this.benchService.runOptimizationTest();
  }
}
