const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  const CustomERC721 = await ethers.getContractFactory("CustomERC721");
  const customERC721 = await CustomERC721.deploy("Test Token", "TTK");
  await customERC721.waitForDeployment();
  console.log("CustomERC721 deployed to:", customERC721.target);

  // const MyNFT = await ethers.getContractFactory("MyNFT");
  // const myNFT = await MyNFT.deploy("My NFT", "MNFT");
  // await myNFT.waitForDeployment();
  // console.log("MyNFT deployed to:", myNFT.target);

  // const TestERC721ReceiverFactory = await ethers.getContractFactory(
  //   "TestERC721Receiver"
  // );
  // const testERC721Receiver = await TestERC721ReceiverFactory.deploy();
  // await testERC721Receiver.waitForDeployment();
  // console.log("TestERC721Receiver deployed to:", testERC721Receiver.target);

  // const FaultyERC721ReceiverFactory = await ethers.getContractFactory(
  //   "FaultyERC721Receiver"
  // );
  // const faultyReceiver = await FaultyERC721ReceiverFactory.deploy();
  // await faultyReceiver.waitForDeployment();
  // console.log("FaultyERC721Receiver deployed to:", faultyReceiver.target);

  // const BadERC721Receiver = await ethers.getContractFactory(
  //   "BadERC721Receiver"
  // );
  // const badReceiver = await BadERC721Receiver.deploy();
  // await badReceiver.waitForDeployment();
  // console.log("BadERC721Receiver deployed to:", badReceiver.target);

  const TestCustomERC721 = await ethers.getContractFactory("TestCustomERC721");
  customERC721_test = await TestCustomERC721.deploy("Test Token", "TTK");
  await customERC721_test.waitForDeployment();
  console.log("TestCustomERC721 deployed to:", customERC721_test.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
