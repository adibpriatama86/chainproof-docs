// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DocumentRegistry
 * @notice Stores SHA-256 fingerprints of documents on-chain to prove integrity.
 * @dev Beginner-friendly contract for the ChainProof university project.
 *
 * Concept:
 *  - Users compute SHA-256 of a file in the browser (Web Crypto API).
 *  - The 32-byte hash is sent here as bytes32 along with metadata.
 *  - The blockchain guarantees the hash + timestamp can never be altered.
 */
contract DocumentRegistry {
    struct Document {
        bytes32 fileHash;     // SHA-256 of the file (32 bytes)
        string fileName;      // Original file name (informational)
        string description;   // Short user description
        uint256 uploadedAt;   // Block timestamp of registration
        address owner;        // Wallet that registered the document
    }

    // Quick lookup by hash
    mapping(bytes32 => Document) private documents;

    // Track whether a hash has been registered (cheaper than checking struct fields)
    mapping(bytes32 => bool) public isRegistered;

    // Public list of all hashes so the frontend can show recent records
    bytes32[] public allHashes;

    /// @notice Emitted when a new document is registered.
    event DocumentRegistered(
        bytes32 indexed fileHash,
        string fileName,
        address indexed owner,
        uint256 uploadedAt
    );

    /**
     * @notice Register a new document hash on-chain.
     * @param _fileHash SHA-256 hash of the file (bytes32).
     * @param _fileName Original file name.
     * @param _description Short description / context.
     */
    function registerDocument(
        bytes32 _fileHash,
        string memory _fileName,
        string memory _description
    ) public {
        require(_fileHash != bytes32(0), "Hash cannot be empty");
        require(!isRegistered[_fileHash], "Document already registered");

        documents[_fileHash] = Document({
            fileHash: _fileHash,
            fileName: _fileName,
            description: _description,
            uploadedAt: block.timestamp,
            owner: msg.sender
        });

        isRegistered[_fileHash] = true;
        allHashes.push(_fileHash);

        emit DocumentRegistered(_fileHash, _fileName, msg.sender, block.timestamp);
    }

    /**
     * @notice Verify whether a document hash is registered.
     * @param _fileHash The SHA-256 hash to look up.
     */
    function verifyDocument(bytes32 _fileHash)
        public
        view
        returns (
            bool exists,
            string memory fileName,
            string memory description,
            uint256 uploadedAt,
            address owner
        )
    {
        if (!isRegistered[_fileHash]) {
            return (false, "", "", 0, address(0));
        }
        Document memory d = documents[_fileHash];
        return (true, d.fileName, d.description, d.uploadedAt, d.owner);
    }

    /// @notice Returns every registered hash (use for "recent documents" list).
    function getAllDocumentHashes() public view returns (bytes32[] memory) {
        return allHashes;
    }

    /// @notice Total number of registered documents.
    function totalDocuments() public view returns (uint256) {
        return allHashes.length;
    }
}
