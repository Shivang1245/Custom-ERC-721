require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - balanceOf() Function", function () {
  let customERC721, owner, addr1, addr2, addr3;

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

  it("should return 0 balance for an address that hasn't minted any tokens", async function () {
    const balanceAddr1 = await customERC721.balanceOf(addr1.address);
    expect(balanceAddr1).to.equal(0n);
  });

  it("should return correct balance after a single mint", async function () {
    await (await customERC721.connect(addr1).mint()).wait();
    const balanceAddr1 = await customERC721.balanceOf(addr1.address);
    expect(balanceAddr1).to.equal(1n);
  });

  it("should return correct balance for multiple tokens minted by the same address", async function () {
    await (await customERC721.connect(addr2).mint()).wait();
    await (await customERC721.connect(addr2).mint()).wait();
    const balanceAddr2 = await customERC721.balanceOf(addr2.address);
    expect(balanceAddr2).to.equal(2n);
  });

  it("should update balances correctly after transferring a token", async function () {
    await (await customERC721.connect(addr3).mint()).wait();

    const balanceBeforeAddr3 = await customERC721.balanceOf(addr3.address);
    const initialBalanceAddr1 = await customERC721.balanceOf(addr1.address);

    const tokenId = await customERC721.tokenOfOwnerByIndex(
      addr3.address,
      balanceBeforeAddr3 - 1n
    );

    await (
      await customERC721
        .connect(addr3)
        .transferFrom(addr3.address, addr1.address, tokenId)
    ).wait();

    const finalBalanceAddr3 = await customERC721.balanceOf(addr3.address);
    const finalBalanceAddr1 = await customERC721.balanceOf(addr1.address);
    expect(finalBalanceAddr3).to.equal(balanceBeforeAddr3 - 1n);
    expect(finalBalanceAddr1).to.equal(initialBalanceAddr1 + 1n);
  });

  it("should update the balance after burning a token", async function () {
    await (await customERC721.connect(addr2).mint()).wait();

    const balanceBeforeBurn = await customERC721.balanceOf(addr2.address);
    const tokenId = await customERC721.tokenOfOwnerByIndex(
      addr2.address,
      balanceBeforeBurn - 1n
    );

    await (await customERC721.connect(addr2).burn(tokenId)).wait();
    const balanceAfterBurn = await customERC721.balanceOf(addr2.address);
    expect(balanceAfterBurn).to.equal(balanceBeforeBurn - 1n);
  });

  it("should revert when balanceOf is called for the zero address", async function () {
    await expect(customERC721.balanceOf(ethers.ZeroAddress)).to.be.revertedWith(
      "ERC721: balance query for zero address"
    );
  });
});
