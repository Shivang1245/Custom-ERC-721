// const { ethers } = require("hardhat");
// const fs = require("fs");

// async function main() {
//   // Load ABI from the uploaded file
//   const abiPath =
//     "/home/shivang-dutta/Desktop/Custom_ERC-721_creation/custom_ERC-721/artifacts/contracts/MyNFT.sol/MyNFT.json";
//   const abiData = JSON.parse(fs.readFileSync(abiPath, "utf-8"));
//   const abi = abiData.abi;

//   // Define contract address (Replace with the actual deployed contract address)
//   const contractAddress = "0xYourDeployedContractAddressHere";

//   // Get signers
//   const [deployer] = await ethers.getSigners();

//   // Connect to contract
//   const myNFT = new ethers.Contract(contractAddress, abi, deployer);

//   // Filter out functions
//   const functions = abi.filter((item) => item.type === "function");

//   console.log(`Executing functions from MyNFT contract...\n`);

//   for (const func of functions) {
//     try {
//       const funcName = func.name;

//       if (func.stateMutability === "view") {
//         // Call view functions
//         console.log(`Calling: ${funcName}`);
//         const result = await myNFT[funcName]();
//         console.log(`Result:`, result);
//       } else if (func.stateMutability === "nonpayable") {
//         // Call nonpayable functions with dummy values
//         console.log(`Executing: ${funcName}`);

//         // Generate dummy inputs based on expected parameters
//         const args = func.inputs.map((input) => generateDummyValue(input));

//         const tx = await myNFT[funcName](...args);
//         const receipt = await tx.wait();
//         console.log(`Transaction successful:`, receipt.transactionHash);
//       }
//     } catch (error) {
//       console.error(`Error executing ${func.name}:`, error.message);
//     }
//     console.log("\n---------------------------------\n");
//   }
// }

// // Helper function to generate dummy values
// function generateDummyValue(input) {
//   if (input.internalType.includes("address")) {
//     return "0x0000000000000000000000000000000000000000"; // Dummy address
//   } else if (input.internalType.includes("uint")) {
//     return ethers.BigNumber.from(1); // Dummy token ID or number
//   } else if (input.internalType.includes("bool")) {
//     return true;
//   } else if (input.internalType.includes("string")) {
//     return "TestString";
//   } else if (input.internalType.includes("bytes")) {
//     return ethers.utils.formatBytes32String("TestData");
//   }
//   return 0; // Default fallback
// }

// main().catch((error) => {
//   console.error(error);
//   process.exit(1);
// });

const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  // Load ABI from the uploaded file
  const abiPath =
    "/home/shivang-dutta/Desktop/Custom_ERC-721_creation/custom_ERC-721/artifacts/contracts/MyNFT.sol/MyNFT.json"; // Ensure the path is correct
  const abiData = JSON.parse(fs.readFileSync(abiPath, "utf-8"));
  const abi = abiData.abi;

  // Define contract address (Replace with the actual deployed contract address)
  const contractAddress = "";

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log(deployer);

  // Connect to contract
  const myNFT = new ethers.Contract(contractAddress, abi, deployer);

  // Filter out functions
  const functions = abi.filter((item) => item.type === "function");

  console.log(`Executing functions from MyNFT contract...\n`);

  for (const func of functions) {
    try {
      const funcName = func.name;
      const inputs = func.inputs.map((input) => generateDummyValue(input));

      if (func.stateMutability === "view" || func.stateMutability === "pure") {
        // Call view functions
        console.log(`Calling: ${funcName}`);
        const result = await myNFT[funcName](...inputs);
        console.log(`Result:`, result);
      } else if (func.stateMutability === "nonpayable") {
        // Call nonpayable functions
        console.log(`Executing: ${funcName}`);

        const tx = await myNFT[funcName](...inputs, { from: deployer.address });
        const receipt = await tx.wait();
        console.log(`Transaction successful:`, receipt.transactionHash);
      }
    } catch (error) {
      console.error(`Error executing ${func.name}:`, error.message);
    }
    console.log("\n---------------------------------\n");
  }
}

// Helper function to generate dummy values based on input types
function generateDummyValue(input) {
  if (input.internalType.includes("address")) {
    return "0x0000000000000000000000000000000000000000"; // Dummy address
  } else if (input.internalType.includes("uint")) {
    return ethers.BigNumber.from(1); // Dummy token ID or number
  } else if (input.internalType.includes("bool")) {
    return true;
  } else if (input.internalType.includes("string")) {
    return "TestString";
  } else if (input.internalType.includes("bytes")) {
    return ethers.utils.formatBytes32String("TestData");
  }
  return 0; // Default fallback
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
