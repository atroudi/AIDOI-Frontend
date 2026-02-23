# Insert admin user to db (email: admin@mail.com , pwd: 1Abc@2De )
mongosh "mongodb://127.0.0.1:27017/dev_db" --eval '
db.users.insertOne({
  email: "admin@mail.com",
  password: "$2b$12$oA.LEUOfqmkVwMsK8tGEhOD8Mjswk4/ZwPJv0ZB043tqQ2hvodVuS",
  first_name: "Portal",
  last_name: "Admin",
  role: "admin",
  reset_pwd_token: null,
  reset_pwd_count: 0,
  activation_token: null,
  activation_count: 0,
  is_logged_out: true,
  verified: true,
  banned: false,
  created_at: new Date()
});
'