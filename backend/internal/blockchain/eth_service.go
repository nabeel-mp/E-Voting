package blockchain

import (
	"E-voting/internal/blockchain/contract"
	"E-voting/internal/config"
	"context"
	"crypto/ecdsa"
	"errors"
	"log"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

var (
	client   *ethclient.Client
	auth     *bind.TransactOpts
	instance *contract.VotingSystem
)

func InitBlockchain() {
	var err error
	cfg := config.Config.Blockchain

	if cfg.URL == "" || cfg.PrivateKey == "" || cfg.ContractAddress == "" {
		log.Println(" Blockchain config missing. Skipping Blockchain init.")
		return
	}

	// 1. Connect to Client
	client, err = ethclient.Dial(cfg.URL)
	if err != nil {
		log.Fatalf("Failed to connect to the Ethereum client: %v", err)
	}
	log.Println(" Connected to Blockchain at " + cfg.URL)

	// 2. Load Private Key
	cleanKey := strings.TrimPrefix(cfg.PrivateKey, "0x")
	privateKey, err := crypto.HexToECDSA(cleanKey)
	if err != nil {
		log.Fatal("Invalid Private Key:", err)
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		log.Fatal("Error casting public key to ECDSA")
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)
	log.Printf(" Wallet Address Loaded: %s", fromAddress.Hex())

	// 3. Create Auth Transactor
	chainID, err := client.ChainID(context.Background())
	if err != nil {
		log.Fatal("Failed to get ChainID:", err)
	}

	auth, err = bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		log.Fatal("Failed to create transactor:", err)
	}
	auth.Value = big.NewInt(0)      // in wei
	auth.GasLimit = uint64(3000000) // Adjusted Gas Limit

	// 4. Instantiate Contract
	address := common.HexToAddress(cfg.ContractAddress)
	instance, err = contract.NewVotingSystem(address, client)
	if err != nil {
		log.Fatalf("Failed to instantiate contract: %v", err)
	}
	log.Println(" Smart Contract Loaded at " + cfg.ContractAddress)
}

// Function to write vote to blockchain
func CastVoteOnChain(electionID uint, candidateID uint, voterID uint) (string, error) {
	if instance == nil || client == nil {
		return "", errors.New("blockchain not initialized")
	}

	// 1. Refresh Nonce/Gas Price
	nonce, err := client.PendingNonceAt(context.Background(), auth.From)
	if err != nil {
		return "", err
	}
	auth.Nonce = big.NewInt(int64(nonce))

	// Fetch dynamic gas price
	gasPrice, err := client.SuggestGasPrice(context.Background())
	if err == nil {
		auth.GasPrice = gasPrice
	}

	// 2. Call Smart Contract
	tx, err := instance.CastVote(auth, big.NewInt(int64(electionID)), big.NewInt(int64(candidateID)), big.NewInt(int64(voterID)))
	if err != nil {
		log.Printf(" Blockchain Transaction Failed: %v", err)
		return "", err
	}

	log.Printf(" Vote Transaction Sent! Hash: %s", tx.Hash().Hex())
	return tx.Hash().Hex(), nil
}

// Function to read votes from blockchain
func GetVotesFromChain(electionID uint, candidateID uint) (int64, error) {
	if instance == nil {
		return 0, errors.New("blockchain not initialized")
	}

	count, err := instance.GetVotes(nil, big.NewInt(int64(electionID)), big.NewInt(int64(candidateID)))
	if err != nil {
		return 0, err
	}
	return count.Int64(), nil
}
