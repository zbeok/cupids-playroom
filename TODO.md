# TODOS
- TODO fix the initial process by asyncing the init_user. the id should be the unique id we are using, there shouldn't be users with same id and diff uuids

# BUGS
- dump_dbs isn't updating as i like.... 

# PROCESS
- author sends letter
- it gets stored to database as well as the user
- a group of mods (bow) will receive the letter to approve or not
  - TODO will the mods b specifying recipient
  - how will mods be approving which eltter
    - query queue
    - index based
- bot will let them know that their recipient is chill
  - do we let people have multiple recipients
    - TODO yes but how is the bot is going to have to relay multiple convos...
- bot ferries messages and uses nickname to do so
  - maybe you can switch between partners using a specific signal, and not "push to talk"
- bot must have a close connection option