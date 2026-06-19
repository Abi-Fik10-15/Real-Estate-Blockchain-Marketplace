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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { BlockchainService } from './blockchain.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('blockchain')
@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('status')
  @ApiOperation({ summary: 'Blockchain connection status (public)' })
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
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Mint property NFT on Sepolia' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['ownerAddress', 'tokenURI'],
      properties: {
        ownerAddress: { type: 'string', example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
        tokenURI: { type: 'string', example: 'ipfs://...' },
      },
    },
  })
  mint(
    @Body('ownerAddress') ownerAddress: string,
    @Body('tokenURI') tokenURI: string,
  ) {
    return this.blockchainService.mintPropertyToken(ownerAddress, tokenURI);
  }

  @Get('verify-ownership')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Check if wallet owns ERC-721 token on Sepolia' })
  @ApiQuery({ name: 'walletAddress', example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' })
  @ApiQuery({ name: 'tokenId', example: '1' })
  verifyOwnership(
    @Query('walletAddress') walletAddress: string,
    @Query('tokenId') tokenId: string,
  ) {
    return this.blockchainService.verifyOwnership(walletAddress, tokenId);
  }

  @Get('token/:tokenId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Read on-chain property deed by token id' })
  @ApiParam({ name: 'tokenId', example: '1' })
  getToken(@Param('tokenId') tokenId: string) {
    return this.blockchainService.getTokenProperty(tokenId);
  }

  @Get('records')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'owner', 'agent')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Batch read on-chain records for token ids' })
  @ApiQuery({ name: 'tokenIds', required: false, example: '1,2,3' })
  getRecords(@Query('tokenIds') tokenIds?: string) {
    const ids = tokenIds ? tokenIds.split(',').map((s) => s.trim()) : [];
    return this.blockchainService.getRecordsForTokenIds(ids);
  }
}
