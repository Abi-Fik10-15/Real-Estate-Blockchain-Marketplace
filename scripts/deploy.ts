import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  /* ── 1. PropertyRegistry ──────────────────────────────── */
  const RegistryFactory = await ethers.getContractFactory("PropertyRegistry");
  const registry = await RegistryFactory.deploy(deployer.address);
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("✅ PropertyRegistry deployed to:", registryAddr);

  /* ── 2. PropertyNFT ───────────────────────────────────── */
  // Minter role = deployer initially (can be changed via setMinter)
  const NFTFactory = await ethers.getContractFactory("PropertyNFT");
  const nft = await NFTFactory.deploy(deployer.address, deployer.address);
  await nft.waitForDeployment();
  const nftAddr = await nft.getAddress();
  console.log("✅ PropertyNFT deployed to:      ", nftAddr);

  /* ── 3. EscrowManager ─────────────────────────────────── */
  const EscrowFactory = await ethers.getContractFactory("EscrowManager");
  const escrow = await EscrowFactory.deploy(deployer.address, deployer.address);
  await escrow.waitForDeployment();
  const escrowAddr = await escrow.getAddress();
  console.log("✅ EscrowManager deployed to:    ", escrowAddr);

  /* ── 4. Grant registrar role to deployer on registry ──── */
  await registry.setRegistrar(deployer.address, true);
  console.log("\n🔑 Registrar role granted to deployer.");

  /* ── Summary ──────────────────────────────────────────── */
  console.log("\n── Deployment Summary ──────────────────────────────");
  console.log(JSON.stringify({
    network:          (await ethers.provider.getNetwork()).name,
    PropertyRegistry: registryAddr,
    PropertyNFT:      nftAddr,
    EscrowManager:    escrowAddr,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
