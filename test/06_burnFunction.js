const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - _burn() Function", function () {
  let TestCustomERC721, customERC721;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    TestCustomERC721 = await ethers.getContractFactory("TestCustomERC721");
    customERC721 = await TestCustomERC721.deploy("Test Token", "TTK");
    await customERC721.waitForDeployment();
  });

  it("should burn an existing token successfully", async function () {
    await (await customERC721.connect(addr1).mint()).wait();

    await (await customERC721.connect(addr1).approve(addr2.address, 1)).wait();

    expect(await customERC721.ownerOf(1)).to.equal(addr1.address);
    expect(await customERC721.balanceOf(addr1.address)).to.equal(1);

    await expect(customERC721.connect(addr1).exposedBurn(1))
      .to.emit(customERC721, "Transfer")
      .withArgs(addr1.address, ethers.ZeroAddress, 1);

    await expect(customERC721.ownerOf(1)).to.be.revertedWith(
      "ERC721: query for nonexistent token"
    );

    expect(await customERC721.balanceOf(addr1.address)).to.equal(0);

    await expect(customERC721.getApproved(1)).to.be.reverted;
  });

  it("should revert when attempting to burn a non-existent token", async function () {
    await expect(customERC721.exposedBurn(999)).to.be.revertedWith(
      "ERC721: query for nonexistent token"
    );
  });

  it("should clear approvals after burning a token", async function () {
    await (await customERC721.connect(addr1).mint()).wait();

    await (await customERC721.connect(addr1).approve(addr2.address, 1)).wait();
    expect(await customERC721.getApproved(1)).to.equal(addr2.address);

    await expect(customERC721.connect(addr1).exposedBurn(1))
      .to.emit(customERC721, "Transfer")
      .withArgs(addr1.address, ethers.ZeroAddress, 1);

    await expect(customERC721.getApproved(1)).to.be.reverted;
  });
});
