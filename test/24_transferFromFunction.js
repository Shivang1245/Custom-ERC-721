const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - transferFrom() Function", function () {
  let TestCustomERC721, customERC721;
  let owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    TestCustomERC721 = await ethers.getContractFactory("TestCustomERC721");
    customERC721 = await TestCustomERC721.deploy("Test Token", "TTK");
    await customERC721.waitForDeployment();
  });

  it("should revert when transferring a non-existent token", async function () {
    await expect(
      customERC721.transferFrom(owner.address, addr1.address, 1)
    ).to.be.revertedWith("ERC721: query for nonexistent token");
  });

  it("should revert when the 'from' address is not the actual owner", async function () {
    await (await customERC721.connect(addr1).mint()).wait();

    await expect(
      customERC721.connect(addr1).transferFrom(owner.address, addr2.address, 1)
    ).to.be.revertedWith("ERC721: transfer of token that is not own");
  });

  it("should successfully transfer token when called by the owner", async function () {
    await (await customERC721.connect(addr1).mint()).wait();

    await expect(
      customERC721.connect(addr1).transferFrom(addr1.address, addr2.address, 1)
    )
      .to.emit(customERC721, "Transfer")
      .withArgs(addr1.address, addr2.address, 1);

    const newOwner = await customERC721.ownerOf(1);
    expect(newOwner).to.equal(addr2.address);
  });

  it("should clear approvals on transferring the token", async function () {
    await (await customERC721.connect(addr1).mint()).wait();
    await (await customERC721.connect(addr1).approve(addr3.address, 1)).wait();

    let approved = await customERC721.getApproved(1);
    expect(approved).to.equal(addr3.address);

    await (
      await customERC721
        .connect(addr1)
        .transferFrom(addr1.address, addr2.address, 1)
    ).wait();

    approved = await customERC721.getApproved(1);
    expect(approved).to.equal(ethers.ZeroAddress);
  });

  it("should allow an approved operator to transfer a token", async function () {
    await (await customERC721.connect(addr1).mint()).wait();

    await (
      await customERC721.connect(addr1).setApprovalForAll(addr3.address, true)
    ).wait();

    await expect(
      customERC721.connect(addr3).transferFrom(addr1.address, addr2.address, 1)
    )
      .to.emit(customERC721, "Transfer")
      .withArgs(addr1.address, addr2.address, 1);

    const newOwner = await customERC721.ownerOf(1);
    expect(newOwner).to.equal(addr2.address);
  });

  it("should revert when transferring a token to the zero address", async function () {
    await (await customERC721.connect(addr1).mint()).wait();

    await expect(
      customERC721
        .connect(addr1)
        .transferFrom(addr1.address, ethers.ZeroAddress, 1)
    ).to.be.revertedWith("ERC721: transfer to zero address");
  });

  it("should revert when caller is not owner, approved, or operator", async function () {
    await (await customERC721.connect(addr1).mint()).wait();

    await expect(
      customERC721.connect(addr2).transferFrom(addr1.address, addr3.address, 1)
    ).to.be.revertedWith("ERC721: transfer caller not owner nor approved");
  });

  it("should throw error when transferFrom is called with extra arguments", async function () {
    await (await customERC721.connect(addr1).mint()).wait();

    await expect(
      customERC721
        .connect(addr1)
        .transferFrom(addr1.address, addr2.address, 1, 123)
    ).to.be.rejectedWith(/no matching fragment/i);
  });
});
