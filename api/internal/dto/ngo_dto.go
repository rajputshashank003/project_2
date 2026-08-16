package dto

// UpdateNgoConfigRequest is the body/form for PATCH /ngo/config.
// All fields are optional (partial update).
type UpdateNgoConfigRequest struct {
	Name               *string `json:"name"               form:"name"`
	Tagline            *string `json:"tagline"            form:"tagline"`
	Address            *string `json:"address"            form:"address"`
	Phone              *string `json:"phone"              form:"phone"`
	Email              *string `json:"email"              form:"email"`
	Website            *string `json:"website"            form:"website"`
	RegistrationNumber *string `json:"registrationNumber" form:"registrationNumber"`
	UPIID              *string `json:"upiId"              form:"upiId"`
	UPIName            *string `json:"upiName"            form:"upiName"`
	BankName           *string `json:"bankName"           form:"bankName"`
	AccountNumber      *string `json:"accountNumber"      form:"accountNumber"`
	IFSCCode           *string `json:"ifscCode"           form:"ifscCode"`
	AccountHolderName  *string `json:"accountHolderName"  form:"accountHolderName"`
	PresidentName      *string `json:"presidentName"      form:"presidentName"`
	SecretaryName      *string `json:"secretaryName"      form:"secretaryName"`
	FoundedYear        *int    `json:"foundedYear"        form:"foundedYear"`
	Description        *string `json:"description"        form:"description"`
	Mission            *string `json:"mission"            form:"mission"`
	Vision             *string `json:"vision"             form:"vision"`
	ManagerPhone       *string `json:"managerPhone"       form:"managerPhone"`
	StatBeneficiaries  *string `json:"statBeneficiaries"  form:"statBeneficiaries"`
	StatVolunteers     *string `json:"statVolunteers"     form:"statVolunteers"`
	StatEventsHeld     *string `json:"statEventsHeld"     form:"statEventsHeld"`
	StatDonations      *string `json:"statDonations"      form:"statDonations"`
	StatYearsActive    *string `json:"statYearsActive"    form:"statYearsActive"`
	RemoveLogo         *bool   `json:"removeLogo"         form:"removeLogo"`
	RemoveSignature    *bool   `json:"removeSignature"    form:"removeSignature"`
}
