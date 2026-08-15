package models

import "time"

// OrgSetting is a single key-value row in the org_settings table.
// The special key "meta" stores a JSON blob for auxiliary data (e.g. Cloudinary IDs).
type OrgSetting struct {
	ID        int       `gorm:"primaryKey;autoIncrement" json:"-"`
	Key       string    `gorm:"column:key;uniqueIndex;size:100;not null" json:"key"`
	Value     string    `gorm:"column:value;type:text"                  json:"value"`
	CreatedAt time.Time `gorm:"column:created_at;not null;default:now()" json:"-"`
	UpdatedAt time.Time `gorm:"column:updated_at;not null;default:now()" json:"-"`
}

// TableName overrides GORM's default pluralisation.
func (OrgSetting) TableName() string { return "org_settings" }

// Well-known org_settings keys — used across repository and service layers.
const (
	OrgKeyName               = "name"
	OrgKeyTagline            = "tagline"
	OrgKeyLogoURL            = "logo_url"
	OrgKeyAddress            = "address"
	OrgKeyPhone              = "phone"
	OrgKeyEmail              = "email"
	OrgKeyWebsite            = "website"
	OrgKeyRegistrationNumber = "registration_number"
	OrgKeyUPIID              = "upi_id"
	OrgKeyUPIName            = "upi_name"
	OrgKeyBankName           = "bank_name"
	OrgKeyAccountNumber      = "account_number"
	OrgKeyIFSCCode           = "ifsc_code"
	OrgKeyAccountHolderName  = "account_holder_name"
	OrgKeySignatureURL       = "signature_url"
	OrgKeyPresidentName      = "president_name"
	OrgKeySecretaryName      = "secretary_name"
	OrgKeyFoundedYear        = "founded_year"
	OrgKeyDescription        = "description"
	OrgKeyMeta               = "meta" // JSON blob: {logo_cloudinary_id, signature_cloudinary_id}
)

// NgoConfigResponse is the structured response returned by GET /ngo/config.
// API contract is unchanged — same JSON shape as the old NgoConfig model.
type NgoConfigResponse struct {
	Name               string    `json:"name"`
	Tagline            string    `json:"tagline"`
	LogoURL            string    `json:"logoUrl"`
	Address            string    `json:"address"`
	Phone              string    `json:"phone"`
	Email              string    `json:"email"`
	Website            string    `json:"website,omitempty"`
	RegistrationNumber string    `json:"registrationNumber"`
	UPIID              string    `json:"upiId"`
	UPIName            string    `json:"upiName"`
	BankName           string    `json:"bankName,omitempty"`
	AccountNumber      string    `json:"accountNumber,omitempty"`
	IFSCCode           string    `json:"ifscCode,omitempty"`
	AccountHolderName  string    `json:"accountHolderName,omitempty"`
	SignatureURL        string    `json:"signatureUrl"`
	PresidentName      string    `json:"presidentName"`
	SecretaryName      string    `json:"secretaryName"`
	FoundedYear        int       `json:"foundedYear"`
	Description        string    `json:"description,omitempty"`
	UpdatedAt          time.Time `json:"updatedAt"`
}

// OrgMetaJSON holds auxiliary data stored in the "meta" key as JSON.
type OrgMetaJSON struct {
	LogoCloudinaryID      string `json:"logo_cloudinary_id"`
	SignatureCloudinaryID string `json:"signature_cloudinary_id"`
}
