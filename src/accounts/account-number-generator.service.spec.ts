import { Test, TestingModule } from '@nestjs/testing';
import { AccountNumberGeneratorService } from './account-number-generator.service.js';

describe('AccountNumberGeneratorService', () => {
  let service: AccountNumberGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountNumberGeneratorService],
    }).compile();

    service = module.get<AccountNumberGeneratorService>(
      AccountNumberGeneratorService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
