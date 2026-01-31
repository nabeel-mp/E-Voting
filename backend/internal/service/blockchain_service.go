package service // Changed from 'blockchain' to 'service' to match your likely folder structure

import (
	"context"
	"errors"
	"log"
	"math/big"
	"strings"
	"sync"

	// Adjust these imports to match your project path
	"E-voting/internal/blockchain/contract"
	"E-voting/internal/config"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

var (
	client     *ethclient.Client
	auth       *bind.TransactOpts
	instance   *contract.VotingSystem
	chainMutex sync.Mutex
)

func InitBlockchain() {
	cfg := config.Config.Blockchain

	if cfg.URL == "" || cfg.PrivateKey == "" || cfg.ContractAddress == "" {
		log.Println("⚠️ Blockchain config missing. Skipping Blockchain init.")
		return
	}

	var err error
	client, err = ethclient.Dial(cfg.URL)
	if err != nil {
		log.Fatalf("Failed to connect to the Ethereum client: %v", err)
	}
	log.Println("✅ Connected to Blockchain at " + cfg.URL)

	cleanKey := strings.TrimPrefix(cfg.PrivateKey, "0x")
	privateKey, err := crypto.HexToECDSA(cleanKey)
	if err != nil {
		log.Fatal("Invalid Private Key:", err)
	}

	chainID, err := client.ChainID(context.Background())
	if err != nil {
		log.Fatal("Failed to get ChainID:", err)
	}

	auth, err = bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		log.Fatal("Failed to create transactor:", err)
	}
	auth.Value = big.NewInt(0)
	auth.GasLimit = uint64(3000000)

	address := common.HexToAddress(cfg.ContractAddress)
	instance, err = contract.NewVotingSystem(address, client)
	if err != nil {
		log.Fatalf("Failed to instantiate contract: %v", err)
	}
	log.Println("📜 Smart Contract Loaded at " + cfg.ContractAddress)
}

func CreateElectionOnChain(electionID uint, startTime int64, endTime int64) (string, error) {
	if instance == nil || client == nil {
		return "", errors.New("blockchain not initialized")
	}

	// LOCK: Prevent other transactions from interfering with Nonce
	chainMutex.Lock()
	defer chainMutex.Unlock()

	updateAuthOpts() // Refresh Nonce safely inside lock

	eID := new(big.Int).SetUint64(uint64(electionID))
	sTime := big.NewInt(startTime)
	eTime := big.NewInt(endTime)

	tx, err := instance.CreateElection(auth, eID, sTime, eTime)
	if err != nil {
		log.Printf("❌ Blockchain Create Election Failed: %v", err)
		return "", err
	}

	log.Printf("✅ Election Creation Sent! Hash: %s", tx.Hash().Hex())
	return tx.Hash().Hex(), nil
}

// Function to write vote to blockchain
func CastVoteOnChain(electionID uint, candidateID uint, voterID uint) (string, error) {
	if instance == nil || client == nil {
		return "", errors.New("blockchain not initialized")
	}

	// LOCK: Prevent other votes from interfering with Nonce
	chainMutex.Lock()
	defer chainMutex.Unlock()

	updateAuthOpts() // Refresh Nonce safely inside lock

	eID := new(big.Int).SetUint64(uint64(electionID))
	cID := new(big.Int).SetUint64(uint64(candidateID))
	vID := new(big.Int).SetUint64(uint64(voterID))

	tx, err := instance.CastVote(auth, eID, cID, vID)
	if err != nil {
		log.Printf("❌ Blockchain Vote Failed: %v", err)
		return "", err
	}

	log.Printf("✅ Vote Transaction Sent! Hash: %s", tx.Hash().Hex())
	return tx.Hash().Hex(), nil
}

// Function to read votes from blockchain
func GetVotesFromChain(electionID uint, candidateID uint) (int64, error) {
	if instance == nil {
		return 0, errors.New("blockchain not initialized")
	}

	eID := new(big.Int).SetUint64(uint64(electionID))
	cID := new(big.Int).SetUint64(uint64(candidateID))

	count, err := instance.GetVotes(nil, eID, cID)
	if err != nil {
		return 0, err
	}
	return count.Int64(), nil
}

// Helper to refresh nonce and gas price before every write transaction
func updateAuthOpts() {
	nonce, err := client.PendingNonceAt(context.Background(), auth.From)
	if err == nil {
		auth.Nonce = big.NewInt(int64(nonce))
	}
	gasPrice, err := client.SuggestGasPrice(context.Background())
	if err == nil {
		auth.GasPrice = gasPrice
	}
}
