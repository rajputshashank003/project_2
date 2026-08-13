package dto

import "encoding/json"

// ---- Error envelope ---------------------------------------------------------

// ErrorEnvelope is the standard error response shape for all 4xx/5xx responses.
type ErrorEnvelope struct {
	Error ErrorDetail `json:"error"`
}

type ErrorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// ---- Success / List wrappers ------------------------------------------------

// DataResponse wraps a single resource response.
type DataResponse struct {
	Data interface{} `json:"data"`
}

// PaginatedResponse wraps a list response with pagination metadata.
type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Pagination Pagination  `json:"pagination"`
}

type Pagination struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"totalPages"`
}

// ---- Idempotency ------------------------------------------------------------

// IdempotencyResponse is the cached JSON stored per idempotency key.
type IdempotencyResponse = json.RawMessage

// ---- Pagination query params ------------------------------------------------

type PaginationQuery struct {
	Page  int `form:"page"`
	Limit int `form:"limit"`
}

func (p *PaginationQuery) Normalize() {
	if p.Page < 1 {
		p.Page = 1
	}
	if p.Limit < 1 {
		p.Limit = 20
	}
	if p.Limit > 100 {
		p.Limit = 100
	}
}

func (p *PaginationQuery) Offset() int {
	return (p.Page - 1) * p.Limit
}
