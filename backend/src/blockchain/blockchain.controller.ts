import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BlockchainService } from './blockchain.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('status')
  status() {
    return {
      enabled: this.blockchainService.isEnabled(),
      contractAddress: this.blockchainService.getContractAddress(),
    };
  }

  @Post('mint')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('owner', 'admin')
  mint(
    @Body('ownerAddress') ownerAddress: string,
    @Body('tokenURI') tokenURI: string,
  ) {
    return this.blockchainService.mintPropertyToken(ownerAddress, tokenURI);
  }

  @Get('verify-ownership')
  @UseGuards(AuthGuard('jwt'))
  verifyOwnership(
    @Query('walletAddress') walletAddress: string,
    @Query('tokenId') tokenId: string,
  ) {
    return this.blockchainService.verifyOwnership(walletAddress, tokenId);
  }
}
