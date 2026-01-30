pragma solidity ^0.8.0;

contract VotingSystem {
    // Structure to hold vote counts: Election ID -> Candidate ID -> Vote Count
    mapping(uint256 => mapping(uint256 => uint256)) public voteCounts;
    
    // To prevent double voting on-chain: Election ID -> Voter ID -> Has Voted
    // Note: In this setup, Voter ID is the database ID (uint), not an address.
    mapping(uint256 => mapping(uint256 => bool)) public hasVoted;

    // Events to log activity on the blockchain
    event VoteCasted(uint256 indexed electionId, uint256 indexed candidateId, uint256 voterId);

    // Function to cast a vote
    function castVote(uint256 _electionId, uint256 _candidateId, uint256 _voterId) public {
        // 1. Check if voter has already voted in this election
        require(!hasVoted[_electionId][_voterId], "Voter has already voted in this election");

        // 2. Record the vote
        voteCounts[_electionId][_candidateId] += 1;
        hasVoted[_electionId][_voterId] = true;

        // 3. Emit event
        emit VoteCasted(_electionId, _candidateId, _voterId);
    }

    // Function to get results for a specific candidate
    function getVotes(uint256 _electionId, uint256 _candidateId) public view returns (uint256) {
        return voteCounts[_electionId][_candidateId];
    }
}