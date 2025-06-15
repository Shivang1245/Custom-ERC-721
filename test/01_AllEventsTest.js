require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - Event Emission Tests", function () {
  let customERC721;
  let owner, addr1, addr2;
  let contractAddress;

  before(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const providedAddress = process.env.TESTCUSTOMERC721;
    if (!providedAddress || providedAddress.trim() === "") {
      throw new Error(
        "No deployed contract address provided in TESTCUSTOMERC721."
      );
    }
    customERC721 = await ethers.getContractAt(
      "TestCustomERC721",
      providedAddress.trim()
    );
    contractAddress = providedAddress.trim();
    console.log("Using deployed TestCustomERC721 at address:", contractAddress);
  });

  afterEach(async function () {
    const countBigInt = await customERC721.allTokensCount();
    const count = Number(countBigInt);
    for (let i = count - 1; i >= 0; i--) {
      const tokenId = await customERC721.readAllToken(i);
      const tokenOwner = await customERC721.ownerOf(tokenId);
      if (tokenOwner === owner.address) {
        await customERC721.connect(owner).exposedBurn(tokenId);
      } else if (tokenOwner === addr1.address) {
        await customERC721.connect(addr1).exposedBurn(tokenId);
      } else if (tokenOwner === addr2.address) {
        await customERC721.connect(addr2).exposedBurn(tokenId);
      }
    }
  });

  it("should emit Mint event on successful minting", async function () {
    await expect(customERC721.connect(addr1).mint())
      .to.emit(customERC721, "Transfer")
      .withArgs(ethers.ZeroAddress, addr1.address, 1);
  });

  it("should revert mint if the token is already minted", async function () {
    await customERC721.connect(addr1).mint();
    await expect(
      customERC721.connect(addr1).exposedMint(addr2.address, 1)
    ).to.be.revertedWith("ERC721: token already added");
  });

  it("should revert when trying to burn a non-existent token", async function () {
    await expect(
      customERC721.connect(addr1).exposedBurn(999)
    ).to.be.revertedWith("ERC721: query for nonexistent token");
  });

  it("should emit Transfer event on successful transfer", async function () {
    await customERC721.connect(owner).exposedMint(owner.address, 101);
    await expect(
      customERC721
        .connect(owner)
        .transferFrom(owner.address, addr1.address, 101)
    )
      .to.emit(customERC721, "Transfer")
      .withArgs(owner.address, addr1.address, 101);
  });

  it("should revert if sender is not owner or approved", async function () {
    await customERC721.connect(owner).exposedMint(owner.address, 102);
    await expect(
      customERC721
        .connect(addr1)
        .transferFrom(owner.address, addr2.address, 102)
    ).to.be.revertedWith("ERC721: transfer caller not owner nor approved");
  });

  it("should emit ApprovalForAll event when setting operator approval", async function () {
    await expect(
      customERC721.connect(owner).exposedSetApprovalForAll(addr1.address, true)
    )
      .to.emit(customERC721, "ApprovalForAll")
      .withArgs(owner.address, addr1.address, true);
  });

  it("should revert when trying to approve a token that doesn't exist", async function () {
    await expect(
      customERC721.connect(owner).approve(addr1.address, 999)
    ).to.be.revertedWith("ERC721: query for nonexistent token");
  });
});
