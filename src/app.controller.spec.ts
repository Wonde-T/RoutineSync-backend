import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('returns the API health payload', () => {
    const health = appController.getHealth();
    expect(health.name).toBe('RoutineSync API');
    expect(health.status).toBe('ok');
  });
});
