# Message Flow

| Exchange  | Type | Routing Key | Queue | Parameters | Status |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| twitter | topic  | twitter.cmd.sync.user | twitter-sync-user-queue | `screen_name`, `s5r_user_id` | Implemented |
| twitter | topic  | twitter.cmd.sync.user-history | twitter-sync-user-history-queue | `screen_name` | Implemented |
| twitter | topic | twitter.user-history.synced | twitter-user-history-synced-queue | |
| twitter | topic | twitter.cmd.sync.user-history-followers | twitter-sync-user-history-followers-queue |
| twitter | topic | | |
| twitter | topic | | |
