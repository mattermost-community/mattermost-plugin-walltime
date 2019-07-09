module github.com/mattermost/mattermost-plugin-walltime

go 1.12

require (
	github.com/go-ldap/ldap v3.0.3+incompatible // indirect
	github.com/lib/pq v1.1.1 // indirect
	github.com/mattermost/go-i18n v1.11.0 // indirect
	github.com/mattermost/mattermost-server v5.12.0+incompatible
	github.com/pelletier/go-toml v1.4.0 // indirect
	github.com/pkg/errors v0.8.1
	github.com/stretchr/objx v0.2.0 // indirect
	go.uber.org/atomic v1.4.0 // indirect
	go.uber.org/zap v1.10.0 // indirect
	golang.org/x/crypto v0.0.0-20190701094942-4def268fd1a4 // indirect
	golang.org/x/net v0.0.0-20190628185345-da137c7871d7 // indirect
	golang.org/x/sys v0.0.0-20190626221950-04f50cda93cb // indirect
	google.golang.org/appengine v1.6.1 // indirect
)

// Workaround for https://github.com/golang/go/issues/30831 and fallout.
replace github.com/golang/lint => github.com/golang/lint v0.0.0-20190227174305-8f45f776aaf1
