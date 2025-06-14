const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - getApproved() Function", function () {
  let TestCustomERC721, customERC721;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    TestCustomERC721 = await ethers.getContractFactory("TestCustomERC721");
    customERC721 = await TestCustomERC721.deploy("Test Token", "TTK");
    await customERC721.waitForDeployment();
  });

  it("should revert when getApproved is called on a nonexistent token", async function () {
    await expect(customERC721.getApproved(1)).to.be.revertedWith(
      "ERC721: query for nonexistent token"
    );
  });

  it("should return the zero address if no approval has been set", async function () {
    await (await customERC721.connect(addr1).mint()).wait();

    const approvedAddr = await customERC721.getApproved(1);
    expect(approvedAddr).to.equal(ethers.ZeroAddress);
  });

  it("should return the correct approved address after an approval is set", async function () {
    await (await customERC721.connect(addr1).mint()).wait();

    await (await customERC721.connect(addr1).approve(addr2.address, 1)).wait();

    const approvedAddr = await customERC721.getApproved(1);
    expect(approvedAddr).to.equal(addr2.address);
  });

  it("should update the approval if a new approval is set", async function () {
    await (await customERC721.connect(addr1).mint()).wait();

    await (await customERC721.connect(addr1).approve(addr2.address, 1)).wait();
    let approvedAddr = await customERC721.getApproved(1);
    expect(approvedAddr).to.equal(addr2.address);

    await (await customERC721.connect(addr1).approve(owner.address, 1)).wait();
    approvedAddr = await customERC721.getApproved(1);
    expect(approvedAddr).to.equal(owner.address);
  });

  it("should clear approval after a token transfer", async function () {
    await (await customERC721.connect(addr1).mint()).wait();
    await (await customERC721.connect(addr1).approve(addr2.address, 1)).wait();

    let approvedAddr = await customERC721.getApproved(1);
    expect(approvedAddr).to.equal(addr2.address);

    await (
      await customERC721
        .connect(addr1)
        .transferFrom(addr1.address, owner.address, 1)
    ).wait();

    approvedAddr = await customERC721.getApproved(1);
    expect(approvedAddr).to.equal(ethers.ZeroAddress);
  });

  it("should throw error when getApproved is called with extra arguments", async function () {
    await expect(customERC721.getApproved(1, 2)).to.be.rejectedWith(
      /no matching fragment/i
    );
  });
});
