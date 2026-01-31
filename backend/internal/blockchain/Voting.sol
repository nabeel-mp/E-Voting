// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    address public owner;

    struct Election {
        uint256 startTime;
        uint256 endTime;
        bool exists;
    }

    // Mappings
    mapping(uint256 => Election) public elections; // Manage election state
    mapping(uint256 => mapping(uint256 => uint256)) public voteCounts; // Election -> Candidate -> Count
    mapping(uint256 => mapping(uint256 => bool)) public hasVoted; // Election -> VoterID -> Status

    // Events
    // NOTE: Removed voterId from event to ensure SECRET BALLOT. 
    // We only log that a vote happened for auditability, not WHO voted for WHOM.
    event VoteCasted(uint256 indexed electionId, uint256 indexed candidateId);
    event ElectionCreated(uint256 indexed electionId, uint256 startTime, uint256 endTime);

    // Modifier to ensure only the backend/admin can interact with sensitive functions
    modifier onlyOwner() {
        require(msg.sender == owner, "Access Denied: Caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender; // The account that deploys the contract is the owner
    }

    // 1. Election Control: Admin must create an election with a timeline
    function createElection(uint256 _electionId, uint256 _startTime, uint256 _endTime) public onlyOwner {
        require(!elections[_electionId].exists, "Election ID already exists");
        require(_endTime > _startTime, "End time must be after start time");
        
        elections[_electionId] = Election({
            startTime: _startTime,
            endTime: _endTime,
            exists: true
        });

        emit ElectionCreated(_electionId, _startTime, _endTime);
    }

    // 2. Secure Voting: Only the backend (owner) can call this after verifying JWT/Auth
    function castVote(uint256 _electionId, uint256 _candidateId, uint256 _voterId) public onlyOwner {
        // A. Election Validity Checks
        require(elections[_electionId].exists, "Election does not exist");
        require(block.timestamp >= elections[_electionId].startTime, "Election has not started");
        require(block.timestamp <= elections[_electionId].endTime, "Election has ended");

        // B. Identity & Double Vote Check
        require(!hasVoted[_electionId][_voterId], "Error: Voter has already voted in this election");

        // C. Record the Vote (Immutable)
        voteCounts[_electionId][_candidateId] += 1;
        hasVoted[_electionId][_voterId] = true;

        // D. Emit Event (Anonymized)
        emit VoteCasted(_electionId, _candidateId);
    }

    // 3. Public Verification: Anyone can check the results
    function getVotes(uint256 _electionId, uint256 _candidateId) public view returns (uint256) {
        return voteCounts[_electionId][_candidateId];
    }
    
    // Helper to check if a user has voted (for frontend UI)
    function checkHasVoted(uint256 _electionId, uint256 _voterId) public view returns (bool) {
        return hasVoted[_electionId][_voterId];
    }
}