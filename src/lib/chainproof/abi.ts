// ABI for the DocumentRegistry contract.
// Keep this in sync with contracts/DocumentRegistry.sol.
export const DOCUMENT_REGISTRY_ABI = [
  "function registerDocument(bytes32 _fileHash, string _fileName, string _description) public",
  "function verifyDocument(bytes32 _fileHash) public view returns (bool exists, string fileName, string description, uint256 uploadedAt, address owner)",
  "function getAllDocumentHashes() public view returns (bytes32[])",
  "function totalDocuments() public view returns (uint256)",
  "function isRegistered(bytes32) public view returns (bool)",
  "event DocumentRegistered(bytes32 indexed fileHash, string fileName, address indexed owner, uint256 uploadedAt)",
] as const;
