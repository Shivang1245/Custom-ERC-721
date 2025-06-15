require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - _transfer() Function", function () {
  let customERC721;
  let owner, addr1, addr2, addr3;
  let baselineSupply;

  before(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const deployedAddress = process.env.TESTCUSTOMERC721;
    if (!deployedAddress || deployedAddress.trim() === "") {
      throw new Error(
        "No deployed contract address provided in TESTCUSTOMERC721."
      );
    }
    customERC721 = await ethers.getContractAt(
      "TestCustomERC721",
      deployedAddress.trim()
    );
    console.log("Using deployed TestCustomERC721 at:", deployedAddress.trim());
  });

  beforeEach(async function () {
    let currentSupplyRaw = await customERC721.totalSupply();
    baselineSupply = BigInt(currentSupplyRaw.toString());
  });

  function getExpectedMintedTokenId() {
    return baselineSupply + 1n;
  }

  it("should revert when transferring a non-existent token", async function () {
    const nonExistentTokenId = baselineSupply + 1n;
    await expect(
      customERC721.exposedTransfer(
        addr1.address,
        addr2.address,
        nonExistentTokenId
      )
    ).to.be.revertedWith("ERC721: query for nonexistent token");
  });

  it("should revert when the 'from' address is not the actual owner", async function () {
    const mintTx = await customERC721.connect(addr1).mint();
    await mintTx.wait();
    const mintedTokenId = getExpectedMintedTokenId();
    await expect(
      customERC721
        .connect(addr1)
        .exposedTransfer(owner.address, addr2.address, mintedTokenId)
    ).to.be.revertedWith("ERC721: transfer of token that is not own");
  });

  it("should successfully transfer token when called by the owner", async function () {
    let mintTx = await customERC721.connect(addr1).mint();
    await mintTx.wait();
    const mintedTokenId = getExpectedMintedTokenId();

    await (
      await customERC721.connect(addr1).approve(addr3.address, mintedTokenId)
    ).wait();

    await expect(
      customERC721
        .connect(addr1)
        .exposedTransfer(addr1.address, addr2.address, mintedTokenId)
    )
      .to.emit(customERC721, "Transfer")
      .withArgs(addr1.address, addr2.address, mintedTokenId);

    const newOwner = await customERC721.ownerOf(mintedTokenId);
    expect(newOwner).to.equal(addr2.address);
    const approved = await customERC721.getApproved(mintedTokenId);
    expect(approved).to.equal(ethers.ZeroAddress);
  });

  it("should clear approvals on transferring the token", async function () {
    const mintTx = await customERC721.connect(addr1).mint();
    await mintTx.wait();
    const mintedTokenId = getExpectedMintedTokenId();

    await (
      await customERC721.connect(addr1).approve(addr3.address, mintedTokenId)
    ).wait();
    let approved = await customERC721.getApproved(mintedTokenId);
    expect(approved).to.equal(addr3.address);

    await (
      await customERC721
        .connect(addr1)
        .exposedTransfer(addr1.address, addr2.address, mintedTokenId)
    ).wait();
    approved = await customERC721.getApproved(mintedTokenId);
    expect(approved).to.equal(ethers.ZeroAddress);
  });

  it("should allow an approved operator to transfer a token", async function () {
    const mintTx = await customERC721.connect(addr1).mint();
    await mintTx.wait();
    const mintedTokenId = getExpectedMintedTokenId();

    await (
      await customERC721.connect(addr1).setApprovalForAll(addr3.address, true)
    ).wait();

    await expect(
      customERC721
        .connect(addr3)
        .exposedTransfer(addr1.address, addr2.address, mintedTokenId)
    )
      .to.emit(customERC721, "Transfer")
      .withArgs(addr1.address, addr2.address, mintedTokenId);

    const newOwner = await customERC721.ownerOf(mintedTokenId);
    expect(newOwner).to.equal(addr2.address);
  });

  it("should revert when transferring a token to the zero address", async function () {
    const mintTx = await customERC721.connect(addr1).mint();
    await mintTx.wait();
    const mintedTokenId = getExpectedMintedTokenId();

    await expect(
      customERC721
        .connect(addr1)
        .exposedTransfer(addr1.address, ethers.ZeroAddress, mintedTokenId)
    ).to.be.revertedWith("ERC721: transfer to zero address");
  });

  it("should throw error when transferFrom is called with extra arguments", async function () {
    const mintTx = await customERC721.connect(addr1).mint();
    await mintTx.wait();
    const mintedTokenId = getExpectedMintedTokenId();

    await expect(
      customERC721
        .connect(addr1)
        .exposedTransfer(addr1.address, addr2.address, mintedTokenId, 123)
    ).to.be.rejectedWith(/no matching fragment/i);
  });
});
