package service

// Messenger is the interface implemented by SMSService, WhatsAppTwilioService,
// and WhatsAppLocalService.
// OTPService, DonationService, and IDCardService depend on this interface
// rather than any concrete messaging type — enabling zero-code channel switching.
type Messenger interface {
	Send(phone, message string)
}
