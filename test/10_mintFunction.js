require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - _mint() Function", function () {
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

  it("should revert when attempting to mint a token to the zero address (using exposedMint)", async function () {
    await expect(
      customERC721.exposedMint(ethers.ZeroAddress, 100)
    ).to.be.revertedWith("ERC721: mint to zero address");
  });

  it("should revert when attempting to mint a token that already exists (using exposedMint)", async function () {
    const baseline = await customERC721.balanceOf(addr1.address);
    const tokenId = baseline + 1n;
    await customERC721.connect(addr1).mint();
    await expect(
      customERC721.exposedMint(addr2.address, tokenId)
    ).to.be.revertedWith("ERC721: token already added");
  });

  it("should update balances correctly after minting tokens", async function () {
    const baseline1 = await customERC721.balanceOf(addr1.address);
    const baseline2 = await customERC721.balanceOf(addr2.address);

    await customERC721.connect(addr1).mint();
    expect(await customERC721.balanceOf(addr1.address)).to.equal(
      baseline1 + 1n
    );

    await customERC721.connect(addr2).mint();
    expect(await customERC721.balanceOf(addr2.address)).to.equal(
      baseline2 + 1n
    );
  });
});
