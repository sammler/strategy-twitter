# Message Flow

| #   | Exchange  | Type | Routing Key | Queue |Parameters | Status | Triggers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| (1)  | twitter | topic  | **twitter.cmd.sync.user** | twitter-sync-user_queue | `screen_name`, `s5r_user_id` | impl |  |
|   | twitter | topic | *twitter.user.created* | twitter-user-created_queue | `screen_name`, `twitter_id`, `s5r_user_id` |
|   | twitter | topic | *twitter.user.updated* | | `screen_name`, `twitter_id`, `s5r_user_id` |
|   | twitter | topic | *twitter.user.deleted* | | `screen_name`, `twitter_id`, `s5r_user_id` |
||||||
|   | twitter | topic  | **twitter.cmd.sync.user-history** | twitter-sync-user-history_queue | `screen_name` | impl |
||||||
|   | twitter | topic | twitter.user-history.synced | twitter-user-history-synced_queue | |
|   | twitter | topic | **twitter.cmd.sync.user-history-followers** | twitter-sync-user-history-followers_queue | `screen_name`, `next_cursor`, `count`
|   | twitter | topic | twitter.sync.user-history-followers.rate-limit-hit | |
|   | twitter | topic | | |
