# Security and privacy

Field Inspections keeps all data on the device. It has no authentication, server, telemetry or cloud service of its own, so it is not designed to hold regulated or highly sensitive data. SQLite data and stored photos rely on the operating system sandbox and are not additionally encrypted by the app. Operating system device backups (iCloud Backup, Android Auto Backup) can include this data.

## Reporting a vulnerability

Report vulnerabilities privately through [GitHub private vulnerability reporting](https://github.com/FolderITDev/mobile-field-inspections/security/advisories/new). Do not disclose personal data or exploitable details in public issues. For anything else, contact Folder IT through [folderit.net](https://folderit.net).

This is a static reference repository without a support commitment; reports are reviewed on a best-effort basis.

## Untrusted input

Treat form input, persisted JSON and selected media as untrusted input. Never add API keys or model credentials to the mobile bundle.

## Dependency advisories

The installed dependency graph reports **14 moderate advisories**, propagated mainly from `decode-uri-component` through routing/query-string and `uuid` through Xcode/config tooling. No high or critical advisories were reported in this installation. The automatic force fix proposes incompatible Expo/router downgrades and was not applied. Recheck upstream compatible releases before publication; do not describe the graph as vulnerability-free. See [URI decoding advisory](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr) and [UUID advisory](https://github.com/advisories/GHSA-w5hq-g745-h8pq).
