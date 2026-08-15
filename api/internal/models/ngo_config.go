package models

// NgoConfig type alias kept for backward compatibility with any code that
// referenced it before the org_settings refactor. New code should use
// NgoConfigResponse and OrgSetting from org_setting.go.
//
// Deprecated: Use NgoConfigResponse for API responses.
type NgoConfig = NgoConfigResponse
