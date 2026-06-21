import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Contract, JsonRpcProvider, Wallet, ethers } from 'ethers';
import { AppConfigService } from '../config/app-config.service';
import RealEstateMarketplaceAbi from './abi/real-estate-marketplace.abi.json';

export interface OnChainProperty {
  tokenId: string;
  owner: string;
  tokenURI: string;
  inEscrow: boolean;
  escrowBuyer: string;
  escrowAmount: string;
}

export interface OnChainRecord extends OnChainProperty {
  propertyTitle?: string;
  dbPropertyId?: string;
}

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider?: JsonRpcProvider;
  private wallet?: Wallet;
  private contract?: Contract;

  constructor(private readonly config: AppConfigService) {
    if (this.config.blockchainEnabled) {
      try {
        this.init();
      } catch (error) {
        this.logger.warn(
          `Blockchain init failed — running without on-chain features: ${error instanceof Error ? error.message : error}`,
        );
      }
    } else {
      this.logger.warn(
        'Blockchain not configured — set valid SEPOLIA_RPC_URL, PRIVATE_KEY, and CONTRACT_ADDRESS to enable',
      );
    }
  }

  getContractAddress(): string {
    return this.config.contractAddress ?? '';
  }

  isEnabled(): boolean {
    return Boolean(this.contract);
  }

  async mintPropertyToken(
    ownerAddress: string,
    tokenURI: string,
  ): Promise<{ tokenId: string; txHash: string }> {
    const contract = this.getContract();
    const deployerAddress = await this.wallet!.getAddress();
    const hasRecipient =
      Boolean(ownerAddress) &&
      ethers.isAddress(ownerAddress) &&
      ownerAddress !== ethers.ZeroAddress;
    const recipient = hasRecipient
      ? ethers.getAddress(ownerAddress)
      : deployerAddress;

    let tokenId: string;
    try {
      tokenId = (await contract.listProperty.staticCall(tokenURI)).toString();
    } catch (error) {
      throw this.toMintError(
        'listProperty',
        error,
        'Mint failed — ensure the backend wallet is the contract owner and has Sepolia ETH.',
      );
    }

    let receipt;
    try {
      const tx = await contract.listProperty(tokenURI);
      receipt = await tx.wait();
    } catch (error) {
      throw this.toMintError(
        'listProperty',
        error,
        'Mint transaction failed on Sepolia.',
      );
    }

    if (recipient === deployerAddress) {
      return { tokenId, txHash: receipt.hash };
    }

    try {
      await this.transferMintedToken(contract, deployerAddress, recipient, tokenId);
    } catch (error) {
      throw this.toMintError(
        'transfer',
        error,
        `Token ${tokenId} was minted but transfer to ${recipient} failed. The deed may still be held by the deployer wallet.`,
      );
    }

    return { tokenId, txHash: receipt.hash };
  }

  private async transferMintedToken(
    contract: Contract,
    from: string,
    to: string,
    tokenId: string,
  ): Promise<void> {
    const owner = await contract.ownerOf(tokenId);
    if (owner.toLowerCase() !== from.toLowerCase()) {
      throw new BadRequestException(
        `Deployer wallet does not own token ${tokenId} (current owner: ${owner}).`,
      );
    }

    try {
      const transferTx = await contract.transferPropertyOwnership(tokenId, to);
      await transferTx.wait();
      return;
    } catch (error) {
      this.logger.warn(
        `transferPropertyOwnership failed for token ${tokenId}, falling back to safeTransferFrom: ${error instanceof Error ? error.message : error}`,
      );
    }

    const transferTx = await contract.safeTransferFrom(from, to, tokenId);
    await transferTx.wait();
  }

  private toMintError(
    step: 'listProperty' | 'transfer',
    error: unknown,
    fallback: string,
  ): BadRequestException {
    const detail =
      error instanceof Error && error.message ? error.message : String(error);
    this.logger.error(`Blockchain mint ${step} failed: ${detail}`);
    return new BadRequestException(`${fallback} (${detail})`);
  }

  async getTokenProperty(tokenId: string): Promise<OnChainProperty> {
    this.ensureTokenId(tokenId);
    const contract = this.getReadContract();
    const [owner, tokenURI, inEscrow, escrowBuyer, escrowAmount] =
      await contract.getProperty(tokenId);

    return {
      tokenId,
      owner,
      tokenURI,
      inEscrow,
      escrowBuyer,
      escrowAmount: ethers.formatEther(escrowAmount),
    };
  }

  async getRecordsForTokenIds(
    tokenIds: string[],
  ): Promise<OnChainRecord[]> {
    if (!this.isEnabled()) return [];

    const numericIds = tokenIds.filter((id) => /^\d+$/.test(id));

    // Fetch all token records in parallel instead of sequentially
    const results = await Promise.allSettled(
      numericIds.map((tokenId) => this.getTokenProperty(tokenId)),
    );

    return results
      .filter((r): r is PromiseFulfilledResult<OnChainProperty> => r.status === 'fulfilled')
      .map((r) => r.value);
  }

  async verifyOwnership(
    walletAddress: string,
    tokenId: string,
  ): Promise<boolean> {
    this.ensureAddress(walletAddress);
    this.ensureTokenId(tokenId);
    const contract = this.getReadContract();
    const owner = await contract.ownerOf(tokenId);
    return owner.toLowerCase() === walletAddress.toLowerCase();
  }

  async verifySaleCompleted(
    tokenId: string,
    expectedBuyerWallet: string,
  ): Promise<boolean> {
    if (!this.isEnabled()) return true;
    this.ensureAddress(expectedBuyerWallet);
    const onChain = await this.getTokenProperty(tokenId);
    return (
      !onChain.inEscrow &&
      onChain.owner.toLowerCase() === expectedBuyerWallet.toLowerCase()
    );
  }

  private init() {
    this.provider = new JsonRpcProvider(this.config.sepoliaRpcUrl!);
    this.wallet = new Wallet(this.config.deployerPrivateKey!, this.provider);
    this.contract = new Contract(
      this.config.contractAddress!,
      RealEstateMarketplaceAbi,
      this.wallet,
    );
    this.logger.log(
      `Blockchain connected — contract ${this.config.contractAddress}`,
    );
    void this.verifyDeployerIsOwner();
  }

  private async verifyDeployerIsOwner() {
    if (!this.contract || !this.wallet) return;
    try {
      const [owner, deployer] = await Promise.all([
        this.contract.owner(),
        this.wallet.getAddress(),
      ]);
      if (owner.toLowerCase() !== deployer.toLowerCase()) {
        this.logger.warn(
          `Backend wallet ${deployer} is not the contract owner (${owner}). listProperty will revert until PRIVATE_KEY matches the deployer account.`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Could not verify contract owner: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  private getContract(): Contract {
    if (!this.contract) {
      throw new ServiceUnavailableException(
        'Blockchain service is not configured',
      );
    }
    return this.contract;
  }

  private getReadContract(): Contract {
    if (!this.provider || !this.config.contractAddress) {
      throw new ServiceUnavailableException(
        'Blockchain service is not configured',
      );
    }
    return new Contract(
      this.config.contractAddress,
      RealEstateMarketplaceAbi,
      this.provider,
    );
  }

  private ensureAddress(address: string) {
    if (!ethers.isAddress(address)) {
      throw new BadRequestException('Invalid wallet address');
    }
  }

  private ensureTokenId(tokenId: string) {
    if (!/^\d+$/.test(tokenId)) {
      throw new BadRequestException('Invalid blockchain token ID');
    }
  }
}
