package blockchain

import (
	"context"
	"crypto/ecdsa"
	"log"
	"math/big"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	// You will need to generate the binding file (see instructions below)
	// "E-voting/internal/blockchain/contract"
)

// Config variables (Move these to your config/env file in production)
const (
	// For local development (Hardhat/Ganache)
	BlockchainURL = "http://127.0.0.1:8545"
	// This private key is from Hardhat's default list (DO NOT USE IN PRODUCTION)
	AdminPrivateKey = "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
	// Address where you deployed the contract
	ContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
)

var (
	client *ethclient.Client
	auth   *bind.TransactOpts
	// instance *contract.VotingSystem // Uncomment after generating binding
)

func InitBlockchain() {
	var err error
	client, err = ethclient.Dial(BlockchainURL)
	if err != nil {
		log.Fatalf("Failed to connect to the Ethereum client: %v", err)
	}
	log.Println("Connected to Blockchain at " + BlockchainURL)

	// Load Private Key
	privateKey, err := crypto.HexToECDSA(AdminPrivateKey)
	if err != nil {
		log.Fatal(err)
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		log.Fatal("Error casting public key to ECDSA")
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)

	// Get the nonce (transaction count)
	nonce, err := client.PendingNonceAt(context.Background(), fromAddress)
	if err != nil {
		log.Fatal(err)
	}

	chainID, err := client.ChainID(context.Background())
	if err != nil {
		log.Fatal(err)
	}

	auth, err = bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		log.Fatal(err)
	}
	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)              // in wei
	auth.GasLimit = uint64(300000)          // in units
	auth.GasPrice = big.NewInt(20000000000) // in wei (20 gwei)

	// Load Contract (Uncomment after generating binding)
	// address := common.HexToAddress(ContractAddress)
	// instance, err = contract.NewVotingSystem(address, client)
	// if err != nil {
	//     log.Fatalf("Failed to instantiate contract: %v", err)
	// }
}

// Function to write vote to blockchain
func CastVoteOnChain(electionID uint, candidateID uint, voterID uint) (string, error) {
	// 1. Refresh Nonce (important for sequential transactions)
	nonce, _ := client.PendingNonceAt(context.Background(), auth.From)
	auth.Nonce = big.NewInt(int64(nonce))

	// 2. Call Smart Contract
	// tx, err := instance.CastVote(auth, big.NewInt(int64(electionID)), big.NewInt(int64(candidateID)), big.NewInt(int64(voterID)))
	// if err != nil {
	//     return "", err
	// }

	// return tx.Hash().Hex(), nil

	// Placeholder until you generate bindings:
	log.Printf("MOCK: Writing to Blockchain -> Election: %d, Candidate: %d, Voter: %d", electionID, candidateID, voterID)
	return "0xMOCK_TRANSACTION_HASH", nil
}

// Function to read votes from blockchain
func GetVotesFromChain(electionID uint, candidateID uint) (int64, error) {
	// count, err := instance.GetVotes(nil, big.NewInt(int64(electionID)), big.NewInt(int64(candidateID)))
	// if err != nil {
	//     return 0, err
	// }
	// return count.Int64(), nil
	return 0, nil
}
