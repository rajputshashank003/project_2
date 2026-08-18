package wa

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	wastore "go.mau.fi/whatsmeow/store/sqlstore"
	waLog "go.mau.fi/whatsmeow/util/log"
	_ "modernc.org/sqlite"
)

// OpenContainer opens (or creates) the SQLite database used by whatsmeow
// to persist the WhatsApp session across server restarts.
// On first run: session is empty → client emits QR code.
// On subsequent runs: session is loaded → client auto-reconnects.
func OpenContainer(dbPath string) (*wastore.Container, error) {
	if dbPath == "" {
		dbPath = "store/whatsapp.db"
	}

	// Ensure target directory exists
	dir := filepath.Dir(dbPath)
	if dir != "" && dir != "." {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return nil, fmt.Errorf("wa store: mkdir failed: %w", err)
		}
	}

	dbLog := waLog.Stdout("Database", "WARN", true)

	container, err := wastore.New(
		context.Background(),
		"sqlite",
		fmt.Sprintf("file:%s?_foreign_keys=on&_busy_timeout=5000&_journal_mode=WAL&cache=shared", dbPath),
		dbLog,
	)
	if err != nil {
		return nil, fmt.Errorf("wa store: open sqlite failed: %w", err)
	}

	if err := container.Upgrade(context.Background()); err != nil {
		return nil, fmt.Errorf("wa store: schema upgrade failed: %w", err)
	}

	// Keep sql.DB import used
	_ = (*sql.DB)(nil)

	return container, nil
}
