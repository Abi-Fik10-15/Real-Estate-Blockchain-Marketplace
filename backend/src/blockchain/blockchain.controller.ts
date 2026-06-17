import {
  Body,
  Controller,
  Get,
  Param,
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
      network: 'sepolia',
      chainId: 11155111,
      explorerUrl: 'https://sepolia.etherscan.io',
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

  @Get('token/:tokenId')
  @UseGuards(AuthGuard('jwt'))
  getToken(@Param('tokenId') tokenId: string) {
    return this.blockchainService.getTokenProperty(tokenId);
  }

  @Get('records')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'owner', 'agent')
  getRecords(@Query('tokenIds') tokenIds?: string) {
    const ids = tokenIds ? tokenIds.split(',').map((s) => s.trim()) : [];
    return this.blockchainService.getRecordsForTokenIds(ids);
  }
}
