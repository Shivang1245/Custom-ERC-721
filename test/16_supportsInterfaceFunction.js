require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomERC721 - supportsInterface() Function", function () {
  let customERC721;
  let owner, addr1, addr2;

  before(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const deployedAddress = process.env.TESTCUSTOMERC721;
    if (deployedAddress && deployedAddress.trim() !== "") {
      try {
        customERC721 = await ethers.getContractAt(
          "CustomERC721",
          deployedAddress.trim()
        );
        await customERC721.name();
        console.log("Using deployed CustomERC721 at:", deployedAddress.trim());
      } catch (error) {
        console.log(
          "Provided contract address is invalid or not deployed; deploying a new instance."
        );
      }
    }
    if (!customERC721) {
      const CustomERC721Factory = await ethers.getContractFactory(
        "CustomERC721"
      );
      customERC721 = await CustomERC721Factory.deploy("Test Token", "TTK");
      await customERC721.waitForDeployment();
      console.log(
        "Deployed new CustomERC721 at:",
        await customERC721.getAddress()
      );
    }
  });

  it("should return true for the ERC721 interface (0x80ac58cd)", async function () {
    const result = await customERC721.supportsInterface("0x80ac58cd");
    expect(result).to.be.true;
  });

  it("should return true for the ERC721Metadata interface (0x5b5e139f)", async function () {
    const result = await customERC721.supportsInterface("0x5b5e139f");
    expect(result).to.be.true;
  });

  it("should return true for the ERC721Enumerable interface (0x780e9d63)", async function () {
    const result = await customERC721.supportsInterface("0x780e9d63");
    expect(result).to.be.true;
  });

  it("should return false for an unsupported interface (0xffffffff)", async function () {
    const result = await customERC721.supportsInterface("0xffffffff");
    expect(result).to.be.false;
  });

  it("should throw an error when supportsInterface is called with extra arguments", async function () {
    await expect(
      customERC721.supportsInterface("0x80ac58cd", 1)
    ).to.be.rejectedWith(/no matching fragment/i);
  });
});
