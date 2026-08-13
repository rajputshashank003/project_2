package models

import "time"

// NgoConfig is a single-row configuration table (id always = 1).
type NgoConfig struct {
	ID                    int       `gorm:"primaryKey;default:1"                              json:"id,omitempty"`
	Name                  string    `gorm:"size:255"                                          json:"name"`
	Tagline               string    `gorm:"size:500"                                          json:"tagline"`
	LogoURL               string    `gorm:"column:logo_url"                                   json:"logoUrl"`
	LogoCloudinaryID      string    `gorm:"column:logo_cloudinary_id;size:500"                json:"-"`
	Address               string    `gorm:"type:text"                                         json:"address"`
	Phone                 string    `gorm:"size:20"                                           json:"phone"`
	Email                 string    `gorm:"size:255"                                          json:"email"`
	Website               string    `gorm:"size:500"                                          json:"website,omitempty"`
	RegistrationNumber    string    `gorm:"column:registration_number;size:100"               json:"registrationNumber"`
	UPIID                 string    `gorm:"column:upi_id;size:100"                            json:"upiId"`
	UPIName               string    `gorm:"column:upi_name;size:255"                          json:"upiName"`
	BankName              string    `gorm:"column:bank_name;size:255"                         json:"bankName,omitempty"`
	AccountNumber         string    `gorm:"column:account_number;size:50"                     json:"accountNumber,omitempty"`
	IFSCCode              string    `gorm:"column:ifsc_code;size:20"                          json:"ifscCode,omitempty"`
	AccountHolderName     string    `gorm:"column:account_holder_name;size:255"               json:"accountHolderName,omitempty"`
	SignatureURL          string    `gorm:"column:signature_url"                              json:"signatureUrl"`
	SignatureCloudinaryID string    `gorm:"column:signature_cloudinary_id;size:500"           json:"-"`
	PresidentName         string    `gorm:"column:president_name;size:255"                    json:"presidentName"`
	SecretaryName         string    `gorm:"column:secretary_name;size:255"                    json:"secretaryName"`
	FoundedYear           int       `gorm:"column:founded_year"                               json:"foundedYear"`
	Description           string    `gorm:"type:text"                                         json:"description,omitempty"`
	UpdatedAt             time.Time `gorm:"not null;default:now()"                            json:"updatedAt"`
}
