package dto

// UpdateNgoConfigRequest is the body for PATCH /ngo/config.
// All fields are optional (partial update).
type UpdateNgoConfigRequest struct {
	Name               *string `json:"name"`
	Tagline            *string `json:"tagline"`
	LogoB64            *string `json:"logoBase64"`
	Address            *string `json:"address"`
	Phone              *string `json:"phone"`
	Email              *string `json:"email"`
	Website            *string `json:"website"`
	RegistrationNumber *string `json:"registrationNumber"`
	UPIID              *string `json:"upiId"`
	UPIName            *string `json:"upiName"`
	BankName           *string `json:"bankName"`
	AccountNumber      *string `json:"accountNumber"`
	IFSCCode           *string `json:"ifscCode"`
	AccountHolderName  *string `json:"accountHolderName"`
	SignatureB64       *string `json:"signatureBase64"`
	PresidentName      *string `json:"presidentName"`
	SecretaryName      *string `json:"secretaryName"`
	FoundedYear        *int    `json:"foundedYear"`
	Description        *string `json:"description"`
}
