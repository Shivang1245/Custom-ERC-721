const { expect } = require("chai");
const { ethers } = require("hardhat");
require("dotenv").config();

describe("CustomERC721 safeTransferFrom", function () {
  let erc721, owner, add1, add2;
  const tokenId = 1;
  // get code function
  async function getCustomERC721Instance() {
    const providedAddress = process.env.CUSTOMERC721;
    // const providedAddress = "";
    if (providedAddress && providedAddress.trim() !== "") {
      try {
        const instance = await ethers.getContractAt(
          "CustomERC721",
          providedAddress.trim()
        );
        // Test that the instance is valid (e.g. by calling a view function).
        await instance.name();
        console.log("Using already deployed CustomERC721 at:", providedAddress);
        return instance;
      } catch (error) {
        console.log(
          "Provided contract address is invalid or not deployed; deploying a new instance."
        );
      }
    } else {
      const ERC721Factory = await ethers.getContractFactory("CustomERC721");
      const instance = await ERC721Factory.deploy("TestToken", "TTK");
      await instance.waitForDeployment();
      return instance;
    }
  }

  beforeEach(async function () {
    // Get signers.
    [owner, add1, add2] = await ethers.getSigners();

    // // Deploy the CustomERC721 contract.
    // const ERC721Factory = await ethers.getContractFactory("CustomERC721");
    // erc721 = await ERC721Factory.deploy("TestToken", "TTK");
    // await erc721.waitForDeployment();
    erc721 = await getCustomERC721Instance();
    contractAddress = await erc721.getAddress();

    // Mint a token to the owner for testing.
    // await erc721.mint(owner.address, tokenId);
  });

  it("should revert when called by an address that is not owner nor approved", async function () {
    await expect(
      erc721
        .connect(add2)
        ["safeTransferFrom(address,address,uint256)"](
          owner.address,
          add1.address,
          tokenId
        )
    ).to.be.revertedWith("ReentrancyGuard: reentrant call");
  });

  it("should revert when transferring a non-existent token", async function () {
    // Token id 9999 has not been minted.
    await expect(
      erc721["safeTransferFrom(address,address,uint256)"](
        owner.address,
        add1.address,
        9999
      )
    ).to.be.revertedWith("ReentrancyGuard: reentrant call");
  });

  it("should revert when transferring to the zero address", async function () {
    await expect(
      erc721["safeTransferFrom(address,address,uint256)"](
        owner.address,
        ethers.ZeroAddress,
        tokenId
      )
    ).to.be.revertedWith("ReentrancyGuard: reentrant call");
  });

  it("should revert when transferring from an address that is not the owner", async function () {
    // Using a 'from' that is not the token's current owner.
    await expect(
      erc721["safeTransferFrom(address,address,uint256)"](
        add1.address,
        add2.address,
        tokenId
      )
    ).to.be.revertedWith("ReentrancyGuard: reentrant call");
  });
});
