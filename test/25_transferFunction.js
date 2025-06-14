const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - _transfer() Function", function () {
  let TestCustomERC721, customERC721;
  let owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    TestCustomERC721 = await ethers.getContractFactory("TestCustomERC721");
    customERC721 = await TestCustomERC721.deploy("Test Token", "TTK");
    await customERC721.waitForDeployment();
  });

  it("should transfer token correctly when called with valid from, to, and tokenId", async function () {
    await (await customERC721.connect(addr1).mint()).wait();
    await (await customERC721.connect(addr1).approve(addr3.address, 1)).wait();

    await expect(
      customERC721
        .connect(addr1)
        .exposedTransfer(addr1.address, addr2.address, 1)
    )
      .to.emit(customERC721, "Transfer")
      .withArgs(addr1.address, addr2.address, 1);

    expect(await customERC721.ownerOf(1)).to.equal(addr2.address);

    expect(await customERC721.getApproved(1)).to.equal(ethers.ZeroAddress);
  });

  it("should revert when transferring a token that does not exist", async function () {
    await expect(
      customERC721.exposedTransfer(addr1.address, addr2.address, 999)
    ).to.be.revertedWith("ERC721: query for nonexistent token");
  });

  it("should revert when transferring a token from an address that is not the owner", async function () {
    await (await customERC721.connect(addr1).mint()).wait();
    await expect(
      customERC721.exposedTransfer(addr2.address, addr3.address, 1)
    ).to.be.revertedWith("ERC721: transfer of token that is not own");
  });

  it("should revert when transferring a token to the zero address", async function () {
    await (await customERC721.connect(addr1).mint()).wait();
    await expect(
      customERC721.exposedTransfer(addr1.address, ethers.ZeroAddress, 1)
    ).to.be.revertedWith("ERC721: transfer to zero address");
  });

  it("should update balances correctly after a successful transfer", async function () {
    await (await customERC721.connect(addr1).mint()).wait();
    const balanceAddr1Before = await customERC721.balanceOf(addr1.address);
    const balanceAddr2Before = await customERC721.balanceOf(addr2.address);

    await customERC721
      .connect(addr1)
      .exposedTransfer(addr1.address, addr2.address, 1);

    const balanceAddr1After = await customERC721.balanceOf(addr1.address);
    const balanceAddr2After = await customERC721.balanceOf(addr2.address);

    expect(balanceAddr1After).to.equal(balanceAddr1Before - 1n);
    expect(balanceAddr2After).to.equal(balanceAddr2Before + 1n);
  });
});
