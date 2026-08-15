package wa

import (
	qrcode "github.com/skip2/go-qrcode"
)

// qrToPNG converts a QR code string to a PNG byte slice (256x256 pixels).
func qrToPNG(code string) ([]byte, error) {
	return qrcode.Encode(code, qrcode.Medium, 256)
}
