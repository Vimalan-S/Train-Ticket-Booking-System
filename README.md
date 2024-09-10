# Execution commands
npm run build
<br />
npm start
<br/><br/>
-------------------------------------------------------------

# Common  Routes:

•	URL:  POST    on    /register
<br />
Body:
{
  "username": "testuser3",
  "password": "testpassword3",
  "role": "admin"
}


•	URL:  POST    on    /login
<br />
Body:
{
  "username": "testuser3",
  "password": "testpassword3"
}

-----------------------------------------------------

# User Routes:

•	URL: POST   on    api/users/add
<br />
Body:
{
"name": "John Doe",
"mobilenumber": "1234567890",
"gender": "Male",
"role": "regular"
}
<br /><br />
•	URL: GET   on     api/users/
<br /><br />
•	URL: GET   on     api/users/:id
<br /><br />
•	URL: PUT   on     api/users/:id
<br />
Body:
{
"name": "John Doe",
"mobilenumber": "1234567890",
"gender": "Male",
"role": "regular"
}
<br /><br />
•	URL: DELETE   on     api/users/:id
<br /><br />
•	URL: POST   on     api/users/book-ticket/:trainId
<br />
Header:  Authorization: Bearer <token>
<br />
Body:
{
"name" : "John Doe"
}

-------------------------------------------------------------------

# Admin Routes:

•	URL:  POST     on           api/admin/add-train     
<br />
Header:  Authorization: Bearer <token>
<br />
Body:
{
  "trainName": "Express Train",
  "maxSeatsAvailable": 200,
  "startLocation": "City A",
  "endLocation": "City B"
}
