  # backend for live chat application 
   This is a backend for the live chat appilication 

  steps
    1. npm init
    2. create git repository
    3. install nodemon ( restarting server)
    4. create app.js ,constants.js and index.js
    5. create model controllers db routes utils folder in src 
    6. install prettier package and create .prettierrc and .prettierignore
    7. install mongoose and express
    
    8. create project in in mongo db atlas and do needed things like ipaddress and user name password copy (we need to take care of network access and database access)
    9. add environment variable in .env file (PORT AND MONGODB_URL)
    10 add db_name in constants file
    11.create method for db connectionin db folder index.js( iify function )
    12.install dotenv package
    13 create ApiError and ApiResponse class for send the data in  structured way 
    14. use then and catch to ad event listener to our app in then and throw error in catch in index.js files
    
# todo 
   read abt process

# info 
 to use experimental feature we write in our script in package.json in dev command (-r dotenv/config  --experimental-json-modules) with previous 