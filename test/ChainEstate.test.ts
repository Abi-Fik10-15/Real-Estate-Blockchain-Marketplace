import { expect } from "chai";
import { ethers } from "hardhat";
import { PropertyRegistry, PropertyNFT, EscrowManager } from "../typechain-types";

describe("ChainEstate Contracts", function () {
  let registry: PropertyRegistry;
  let nft: PropertyNFT;
  let escrow: EscrowManager;
  let owner: any, registrar: any, buyer: any, seller: any;

  const CHAIN_ID = "PROP-TEST-001";
  const META_URI = "ipfs://QmTestHash";
  const ESCROW_DURATION = 7 * 24 * 60 * 60; // 7 days

  beforeEach(async () => {
    [owner, registrar, buyer, seller] = await ethers.getSigners();

    // Deploy PropertyRegistry
    const RegistryFactory = await ethers.getContractFactory("PropertyRegistry");
    registry = (await RegistryFactory.deploy(owner.address)) as PropertyRegistry;
    await registry.waitForDeployment();

    // Deploy PropertyNFT
    const NFTFactory = await ethers.getContractFactory("PropertyNFT");
    nft = (await NFTFactory.deploy(owner.address, owner.address)) as PropertyNFT;
    await nft.waitForDeployment();

    // Deploy EscrowManager
    const EscrowFactory = await ethers.getContractFactory("EscrowManager");
    escrow = (await EscrowFactory.deploy(owner.address, owner.address)) as EscrowManager;
    await escrow.waitForDeployment();

    // Grant registrar role
    await registry.setRegistrar(registrar.address, true);
  });

  /* ─── PropertyRegistry ─────────────────────────────── */

  describe("PropertyRegistry", () => {
    it("should mint a property", async () => {
      await registry.connect(registrar).mintProperty(CHAIN_ID, seller.address, META_URI);
      const prop = await registry.getProperty(CHAIN_ID);
      expect(prop.owner).to.equal(seller.address);
      expect(prop.verified).to.equal(false);
    });

    it("should prevent double minting", async () => {
      await registry.connect(registrar).mintProperty(CHAIN_ID, seller.address, META_URI);
      await expect(
        registry.connect(registrar).mintProperty(CHAIN_ID, buyer.address, META_URI)
      ).to.be.revertedWithCustomError(registry, "PropertyAlreadyRegistered");
    });

    it("should transfer ownership", async () => {
      await registry.connect(registrar).mintProperty(CHAIN_ID, seller.address, META_URI);
      await registry.connect(seller).transferOwnership(CHAIN_ID, buyer.address, ethers.ZeroHash);
      const prop = await registry.getProperty(CHAIN_ID);
      expect(prop.owner).to.equal(buyer.address);
      const history = await registry.getHistory(CHAIN_ID);
      expect(history.length).to.equal(1);
      expect(history[0].from).to.equal(seller.address);
    });

    it("should verify a property", async () => {
      await registry.connect(registrar).mintProperty(CHAIN_ID, seller.address, META_URI);
      await registry.connect(registrar).setVerified(CHAIN_ID, true);
      const prop = await registry.getProperty(CHAIN_ID);
      expect(prop.verified).to.equal(true);
    });

    it("should reject non-registrar minting", async () => {
      await expect(
        registry.connect(buyer).mintProperty(CHAIN_ID, seller.address, META_URI)
      ).to.be.revertedWithCustomError(registry, "NotRegistrar");
    });
  });

  /* ─── PropertyNFT ──────────────────────────────────── */

  describe("PropertyNFT", () => {
    it("should mint a deed NFT", async () => {
      const tx = await nft.mintDeed(seller.address, CHAIN_ID, META_URI);
      const receipt = await tx.wait();
      const tokenId = await nft.chainIdToToken(CHAIN_ID);
      expect(tokenId).to.equal(1n);
      expect(await nft.ownerOf(tokenId)).to.equal(seller.address);
      expect(await nft.tokenURI(tokenId)).to.equal(META_URI);
    });

    it("should prevent double-minting for same chainId", async () => {
      await nft.mintDeed(seller.address, CHAIN_ID, META_URI);
      await expect(
        nft.mintDeed(buyer.address, CHAIN_ID, META_URI)
      ).to.be.revertedWithCustomError(nft, "AlreadyMinted");
    });
  });

  /* ─── EscrowManager ────────────────────────────────── */

  describe("EscrowManager", () => {
    const depositAmount = ethers.parseEther("1");

    it("should accept a deposit", async () => {
      await escrow.connect(buyer).deposit(seller.address, CHAIN_ID, ESCROW_DURATION, {
        value: depositAmount,
      });
      const escrowId = await escrow.getEscrowId(buyer.address, CHAIN_ID);
      const esc = await escrow.escrows(escrowId);
      expect(esc.amount).to.equal(depositAmount);
      expect(esc.status).to.equal(1); // DEPOSITED
    });

    it("should release funds to seller minus fee", async () => {
      await escrow.connect(buyer).deposit(seller.address, CHAIN_ID, ESCROW_DURATION, {
        value: depositAmount,
      });
      const escrowId = await escrow.getEscrowId(buyer.address, CHAIN_ID);
      const sellerBalBefore = await ethers.provider.getBalance(seller.address);
      await escrow.connect(seller).release(escrowId);
      const sellerBalAfter = await ethers.provider.getBalance(seller.address);
      // Net = depositAmount - 1% fee
      expect(sellerBalAfter).to.be.gt(sellerBalBefore);
    });

    it("should refund buyer on cancellation", async () => {
      await escrow.connect(buyer).deposit(seller.address, CHAIN_ID, ESCROW_DURATION, {
        value: depositAmount,
      });
      const escrowId = await escrow.getEscrowId(buyer.address, CHAIN_ID);
      const buyerBalBefore = await ethers.provider.getBalance(buyer.address);
      await escrow.connect(buyer).refund(escrowId);
      const buyerBalAfter = await ethers.provider.getBalance(buyer.address);
      expect(buyerBalAfter).to.be.gt(buyerBalBefore);
    });
  });
});
