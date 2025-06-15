require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - _burn() Function", function () {
  let customERC721;
  let owner, addr1, addr2;

  before(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
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

  async function getLastMintedToken(signer) {
    const tx = await customERC721.connect(signer).mint();
    await tx.wait();
    const balance = await customERC721.balanceOf(signer.address);
    const tokenId = await customERC721.tokenOfOwnerByIndex(
      signer.address,
      balance - 1n
    );
    return tokenId;
  }

  it("should burn an existing token successfully", async function () {
    const baseline = await customERC721.balanceOf(addr1.address);
    const tokenId = await getLastMintedToken(addr1);
    const newBalance = await customERC721.balanceOf(addr1.address);
    expect(newBalance).to.equal(baseline + 1n);

    await (
      await customERC721.connect(addr1).approve(addr2.address, tokenId)
    ).wait();

    await expect(customERC721.connect(addr1).exposedBurn(tokenId))
      .to.emit(customERC721, "Transfer")
      .withArgs(addr1.address, ethers.ZeroAddress, tokenId);

    const finalBalance = await customERC721.balanceOf(addr1.address);
    expect(finalBalance).to.equal(baseline);

    await expect(customERC721.ownerOf(tokenId)).to.be.revertedWith(
      "ERC721: query for nonexistent token"
    );

    await expect(customERC721.getApproved(tokenId)).to.be.reverted;
  });

  it("should revert when attempting to burn a non-existent token", async function () {
    await expect(customERC721.exposedBurn(999)).to.be.revertedWith(
      "ERC721: query for nonexistent token"
    );
  });

  it("should clear approvals after burning a token", async function () {
    const baseline = await customERC721.balanceOf(addr1.address);
    const tokenId = await getLastMintedToken(addr1);
    await (
      await customERC721.connect(addr1).approve(addr2.address, tokenId)
    ).wait();
    expect(await customERC721.getApproved(tokenId)).to.equal(addr2.address);

    await expect(customERC721.connect(addr1).exposedBurn(tokenId))
      .to.emit(customERC721, "Transfer")
      .withArgs(addr1.address, ethers.ZeroAddress, tokenId);

    await expect(customERC721.getApproved(tokenId)).to.be.reverted;

    const finalBalance = await customERC721.balanceOf(addr1.address);
    expect(finalBalance).to.equal(baseline);
  });
});
