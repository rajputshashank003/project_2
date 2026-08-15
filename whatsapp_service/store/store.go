package store

import (
	"context"
	"database/sql"
	"fmt"

	_ "modernc.org/sqlite"
	wastore "go.mau.fi/whatsmeow/store/sqlstore"
	waLog "go.mau.fi/whatsmeow/util/log"
)

// OpenContainer opens (or creates) the SQLite database used by whatsmeow
// to persist the WhatsApp session across server restarts.
// On first run: session is empty → client emits QR code.
// On subsequent runs: session is loaded → client auto-reconnects.
func OpenContainer(dbPath string) (*wastore.Container, error) {
	dbLog := waLog.Stdout("Database", "WARN", true)

	container, err := wastore.New(
		context.Background(),
		"sqlite",
		fmt.Sprintf("file:%s?_foreign_keys=on&_busy_timeout=5000&_journal_mode=WAL&cache=shared", dbPath),
		dbLog,
	)
	if err != nil {
		return nil, fmt.Errorf("store: open sqlite failed: %w", err)
	}

	if err := container.Upgrade(context.Background()); err != nil {
		return nil, fmt.Errorf("store: schema upgrade failed: %w", err)
	}

	// Ensure raw DB is accessible (keeps import used)
	_ = (*sql.DB)(nil)

	return container, nil
}
